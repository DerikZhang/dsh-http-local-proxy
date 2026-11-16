# dsh-local-http-proxy

Configure one HTTP proxy for plugin and package installs in DeepSeek Harness, and switch it
on or off from the Web UI.

English | [中文](README.zh.md)

## What it does

DeepSeek Harness installs plugins by running `pnpm add` — and `git`, when the spec is a GitHub
address — inside your profile directory. When GitHub or a package registry is unreachable from
your network, those installs fail. This plugin writes one proxy address into the Harness
process environment, so every install it starts goes through that proxy instead of connecting
directly.

It sets `http_proxy`, `HTTPS_PROXY`, `all_proxy` and their siblings for child processes, keeps
the usual loopback entries in `no_proxy` so local services stay local, and sets
`NODE_USE_ENV_PROXY=1` so a Node child honors those variables too.

Turning the switch on applies the address immediately, with no restart. Turning it off
restores the environment this process started with.

## Use it

After installing the bundle and reloading the page, the proxy panel is in three places:

- **Plugins** page — a **Proxy** tab beside *Installed*.
- **Settings → Plugins** — a **Proxy** tab.
- **Settings → General** — a row titled *HTTP proxy for plugin installs*.

The panel has one switch and one address box. The box starts at `http://127.0.0.1:7897`; type
another `http://` or `https://` address, then press Enter, click **Save**, or move focus out of
the box. An address that is not an `http://` or `https://` URL is refused with a message and
cannot be saved.

## Install

From this repository:

```sh
dsh plugin --profile <profile> add github:DerikZhang/dsh-http-local-proxy
```

Then select the bundle in that profile if it is not enabled yet.

## Limitations

- **Child processes only.** The proxy reaches installs and newly spawned commands. Requests
  the Harness process itself makes — model traffic, web search, web fetch — are not affected,
  so enabling it cannot interrupt a running conversation.
- **A launch-time policy wins.** If you started `dsh` with `HTTP_PROXY`/`HTTPS_PROXY`
  exported, the launcher installs its own outbound policy before any plugin loads, and that
  policy takes precedence over the address set here.
- **Commands already running keep their environment.** Only processes started after the
  switch is on inherit the proxy.
- **HTTP proxies only.** SOCKS and PAC URLs are refused; the host itself supports only
  `http://` and `https://` proxy URLs.
- **`no_proxy` is merged, not replaced.** Your existing bypass entries are kept and the
  loopback entries are appended.

## License

MIT
