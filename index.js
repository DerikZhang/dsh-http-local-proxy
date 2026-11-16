/**
 * Host half of the local HTTP proxy bundle.
 *
 * One proxy address is written into this process's environment, so every
 * package operation the Plugin Manager starts inherits it: `pnpm add` and its
 * `git` fetches for a GitHub spec, plus any shell command the session spawns.
 * Registered host code runs inside the Harness process, which is what lets the
 * proxy reach those child environments without editing any profile file.
 *
 * Both Config fields are volatile, so the Settings row can write them without
 * remounting this plugin; the Loader then emits `loader/volatile-update` and
 * this module re-applies the environment in place.
 */
import z from '@deepseek-ai/schemastery'

/** Address the input box starts with. */
const DEFAULT_PROXY_URL = 'http://127.0.0.1:7897'

/** Names read by pnpm (via undici), git, curl and other child CLIs. */
const PROXY_NAMES = ['http_proxy', 'HTTP_PROXY', 'https_proxy', 'HTTPS_PROXY', 'all_proxy', 'ALL_PROXY']

/** Bypass list read by child CLIs. */
const NO_PROXY_NAMES = ['no_proxy', 'NO_PROXY']

/** Loopback entries always merged into the bypass list, so local services stay local. */
const LOOPBACK_ENTRIES = ['localhost', '127.0.0.1', '::1']

/** Makes a Node child (22.21+, 24+) honor the proxy variables for its own built-in fetch. */
const NODE_ENV_PROXY_FLAG = 'NODE_USE_ENV_PROXY'

/** Every name this plugin may add, change, or remove. */
const TOUCHED_NAMES = [...PROXY_NAMES, ...NO_PROXY_NAMES, NODE_ENV_PROXY_FLAG]

/**
 * Volatile Config. `.volatile()` keeps writes from restarting the plugin: the
 * Loader commits the new values into the running references instead.
 */
export const Config = z.object({
  enabled: z.boolean().default(false).volatile(),
  url: z.string().default(DEFAULT_PROXY_URL).volatile(),
})

/**
 * Whether a value is a proxy URL this plugin can route through.
 *
 * @param value Candidate address.
 * @returns true for a parseable `http:` or `https:` URL.
 */
function isProxyUrl(value) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Read a Config field that is normally a volatile reference.
 *
 * @param value Volatile reference, or a plain value when volality is absent.
 * @param fallback Value used when the field is undefined.
 * @returns The current field value.
 */
function readField(value, fallback) {
  if (value !== null && typeof value === 'object' && typeof value.get === 'function') return value.get()
  return value === undefined ? fallback : value
}

/**
 * Snapshot the environment before this plugin changes anything.
 *
 * @returns One entry per touched name; `undefined` marks an absent name.
 */
function captureEnvironment() {
  const entries = new Map()
  for (const name of TOUCHED_NAMES) entries.set(name, process.env[name])
  return entries
}

/**
 * Put every touched name back to the captured value, removing names that were absent.
 *
 * @param baseline Snapshot from {@link captureEnvironment}.
 */
function restoreEnvironment(baseline) {
  for (const [name, value] of baseline) {
    if (value === undefined) Reflect.deleteProperty(process.env, name)
    else process.env[name] = value
  }
}

/**
 * The bypass list a child should see: the user's entries plus loopback.
 *
 * @param baseline Snapshot holding the original `no_proxy` value.
 * @returns The merged bypass list, or `*` when the user bypasses everything.
 */
function bypassList(baseline) {
  const inherited = baseline.get('no_proxy') ?? baseline.get('NO_PROXY') ?? ''
  const entries = String(inherited)
    .split(/[,\s]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '')
  if (entries.includes('*')) return '*'
  const present = new Set(entries.map((entry) => entry.toLowerCase()))
  for (const entry of LOOPBACK_ENTRIES) if (!present.has(entry)) entries.push(entry)
  return entries.join(',')
}

/**
 * Report a refused address once, without failing the write that stored it.
 *
 * @param ctx Plugin context, for the logger.
 * @param url The address that cannot be used.
 */
function warnUnusable(ctx, url) {
  try {
    ctx.logger?.('local-http-proxy')?.warn(
      'ignoring proxy address %s: expected an http:// or https:// URL',
      url,
    )
  } catch {
    // A logger is a nicety here; a plugin without one still applies the environment.
  }
}

/**
 * Apply one settings snapshot to the process environment.
 *
 * The environment is first restored to its captured state, so changing the
 * address never leaves an older value behind.
 *
 * @param ctx Plugin context, for diagnostics.
 * @param baseline Environment captured before the first change.
 * @param settings Current `enabled` and `url` values.
 * @returns Disposer restoring the captured environment.
 */
function arrange(ctx, baseline, settings) {
  restoreEnvironment(baseline)
  if (settings.enabled !== true) return () => {}
  const url = typeof settings.url === 'string' ? settings.url.trim() : ''
  if (!isProxyUrl(url)) {
    warnUnusable(ctx, url)
    return () => {}
  }
  for (const name of PROXY_NAMES) process.env[name] = url
  const noProxy = bypassList(baseline)
  for (const name of NO_PROXY_NAMES) process.env[name] = noProxy
  process.env[NODE_ENV_PROXY_FLAG] = '1'
  return () => restoreEnvironment(baseline)
}

/**
 * Host entry point.
 *
 * @param ctx Plugin context owning every registration and effect.
 * @param config Resolved Config, with volatile fields as live references.
 */
export function apply(ctx, config) {
  const baseline = captureEnvironment()
  let dispose = () => {}

  const sync = () => {
    const previous = dispose
    dispose = () => {}
    previous()
    dispose = arrange(ctx, baseline, {
      enabled: readField(config.enabled, false),
      url: readField(config.url, DEFAULT_PROXY_URL),
    })
  }

  ctx.effect(() => () => {
    const current = dispose
    dispose = () => {}
    current()
  }, 'local-http-proxy: proxy environment')

  ctx.on('loader/volatile-update', () => {
    sync()
  })

  sync()
}
