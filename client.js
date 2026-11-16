window.__ModuleLoader__.load({
  id: 'dsh-local-http-proxy',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Client locale namespace owned by this plugin. */
    const NS = 'local-http-proxy'
    /** Bundle package name: both the `plugins.bundle.config` key and the row's package half. */
    const PACKAGE = 'dsh-local-http-proxy'
    /** Loader entry id (patch id), which is also the Config namespace the Host serves. */
    const ENTRY_ID = 'local-http-proxy'

    /** English copy. */
    const en = {
      navLabel: 'Proxy',
      title: 'HTTP proxy for plugin installs',
      description:
        'Route plugin and package installs through an HTTP proxy so GitHub and the package registries stay reachable.',
      urlLabel: 'Proxy address',
      placeholder: 'http://127.0.0.1:7897',
      save: 'Save',
      saved: 'Saved',
      invalidUrl: 'Enter an http:// or https:// proxy address.',
      saveFailed: 'The setting could not be saved. Please try again.',
      saving: 'Saving…',
      enabledHint: 'Plugin installs, git fetches and newly spawned commands now use this proxy. No restart needed.',
      disabledHint: 'Proxy is off; installs connect directly.',
      unavailable: 'This setting is not available in this deployment.',
    }

    /** Chinese copy. */
    const zh = {
      navLabel: '代理',
      title: '插件安装 HTTP 代理',
      description: '让本地安装插件与依赖时走 HTTP 代理，以便访问 GitHub 和各软件源。',
      urlLabel: '代理地址',
      placeholder: 'http://127.0.0.1:7897',
      save: '保存',
      saved: '已保存',
      invalidUrl: '请输入 http:// 或 https:// 开头的代理地址。',
      saveFailed: '设置保存失败，请重试。',
      saving: '保存中…',
      enabledHint: '插件安装、git 拉取以及之后新启动的命令都会使用该代理，无需重启。',
      disabledHint: '代理已关闭，安装将直连。',
      unavailable: '当前部署未提供该设置。',
    }

    /** Panel chrome; class names carry this plugin's prefix and use the host's tokens. */
    const CSS = [
      '.dshLocalProxy_panel{display:flex;flex-direction:column;gap:16px;padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2);font:inherit}',
      '.dshLocalProxy_panel[data-embedded="true"]{padding:0;border-bottom:0}',
      '.dshLocalProxy_head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px}',
      '.dshLocalProxy_copy{min-width:0}',
      '.dshLocalProxy_title{font-size:14px;line-height:20px;color:var(--dsw-alias-label-primary)}',
      '.dshLocalProxy_description{color:var(--dsw-alias-label-secondary);margin-top:4px;font-size:12px;line-height:18px}',
      '.dshLocalProxy_field{display:flex;flex-direction:column;gap:6px}',
      '.dshLocalProxy_label{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
      '.dshLocalProxy_rowline{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
      '.dshLocalProxy_input{box-sizing:border-box;flex:1 1 240px;min-width:0;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}',
      '.dshLocalProxy_input::placeholder{color:var(--dsw-alias-label-secondary)}',
      '.dshLocalProxy_input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;border-color:transparent}',
      '.dshLocalProxy_input:disabled{cursor:default;opacity:.5}',
      '.dshLocalProxy_input[aria-invalid="true"]{border-color:var(--dsw-alias-state-error-primary)}',
      '.dshLocalProxy_save{flex:0 0 auto;height:32px;padding:0 14px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer}',
      '.dshLocalProxy_save:hover:not(:disabled){background:var(--dsw-alias-bg-layer-1)}',
      '.dshLocalProxy_save:disabled{cursor:default;opacity:.5}',
      '.dshLocalProxy_save:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.dshLocalProxy_error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}',
      '.dshLocalProxy_hint{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
      '.dshLocalProxy_switch{box-sizing:border-box;position:relative;flex:0 0 auto;width:36px;height:20px;margin-top:2px;padding:2px;border:0;border-radius:999px;background:var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));cursor:pointer}',
      '.dshLocalProxy_switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary)}',
      '.dshLocalProxy_switch:disabled{cursor:default;opacity:.5}',
      '.dshLocalProxy_switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.dshLocalProxy_thumb{display:block;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .12s ease}',
      '.dshLocalProxy_switch[aria-checked="false"] .dshLocalProxy_thumb{background:var(--dsw-alias-label-secondary)}',
      '.dshLocalProxy_switch[aria-checked="true"] .dshLocalProxy_thumb{transform:translate(16px)}',
    ].join('\n')

    /**
     * Whether an address is one the Host can route through.
     *
     * @param value Candidate proxy address.
     * @returns true for a parseable `http:` or `https:` URL.
     */
    function isProxyUrl(value) {
      try {
        const parsed = new URL(String(value).trim())
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      } catch {
        return false
      }
    }

    /** A settings snapshot in the one shape every panel needs. */
    const EMPTY_STATE = { status: 'loading', value: undefined, writable: false, revision: undefined }

    /**
     * Read one field out of a snapshot's namespace value.
     *
     * @param state Settings snapshot, possibly still loading.
     * @param field Field name inside the namespace section.
     * @returns The stored value, or undefined.
     */
    function fieldOf(state, field) {
      const value = state === undefined || state === null ? undefined : state.value
      if (value === undefined || value === null || typeof value !== 'object') return undefined
      return value[field]
    }

    /**
     * Subscribe a component to a shared settings form.
     *
     * @param form Shared form controller from `configForms`.
     * @returns The current form snapshot.
     */
    function useFormSnapshot(form) {
      return React.useSyncExternalStore(
        React.useCallback((notify) => form.subscribe(notify), [form]),
        React.useCallback(() => form.getSnapshot(), [form]),
      )
    }

    /**
     * The host's own switch: a `role="switch"` button with a sliding thumb.
     *
     * @param props Checked state, disabled state, accessible label, change handler.
     * @returns The switch button.
     */
    function Switch(props) {
      return h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': props.checked === true,
          'aria-label': props.label,
          title: props.label,
          disabled: props.disabled === true,
          className: 'dshLocalProxy_switch',
          onClick: () => {
            props.onChange(props.checked !== true)
          },
        },
        h('span', { className: 'dshLocalProxy_thumb' }),
      )
    }

    /**
     * The proxy panel body: one switch, one editable address box, and the hint.
     *
     * `submit` performs the write; the panel only owns draft text and busy state.
     *
     * @param props Snapshot, write function, copy, and presentation flags.
     * @returns The panel element tree.
     */
    function ProxyFields(props) {
      const t = typeof props.t === 'function' ? props.t : (key) => key
      const state = props.state === undefined || props.state === null ? EMPTY_STATE : props.state
      const reactId = React.useId()
      const inputId = `dsh-local-proxy-url-${props.scope ?? 'row'}-${String(reactId).replace(/[^a-zA-Z0-9_-]/g, '')}`

      const enabled = fieldOf(state, 'enabled') === true
      const savedUrl = typeof fieldOf(state, 'url') === 'string' ? fieldOf(state, 'url') : ''
      const ready = state.status === 'ready'

      const [draft, setDraft] = React.useState(savedUrl)
      const [busy, setBusy] = React.useState(false)
      const [failed, setFailed] = React.useState(false)
      const [justSaved, setJustSaved] = React.useState(false)

      React.useEffect(() => {
        setDraft(savedUrl)
      }, [savedUrl])

      const locked = busy || !ready || state.writable !== true
      const valid = isProxyUrl(draft)
      const dirty = draft.trim() !== savedUrl

      const write = (field, next) => {
        setBusy(true)
        setFailed(false)
        setJustSaved(false)
        let task
        try {
          task = props.submit(field, next)
        } catch (error) {
          task = Promise.reject(error)
        }
        Promise.resolve(task)
          .then((accepted) => {
            if (accepted === false) setFailed(true)
            else setJustSaved(true)
          })
          .catch(() => {
            setFailed(true)
          })
          .finally(() => {
            setBusy(false)
          })
      }

      const commit = () => {
        const next = draft.trim()
        if (!isProxyUrl(next) || next === savedUrl) return
        write('url', next)
      }

      const canSave = !locked && valid && dirty

      return h(
        'div',
        { className: 'dshLocalProxy_panel', 'data-embedded': props.embedded === true ? 'true' : undefined },
        h(
          'div',
          { className: 'dshLocalProxy_head' },
          h(
            'div',
            { className: 'dshLocalProxy_copy' },
            h('div', { className: 'dshLocalProxy_title' }, t('title')),
            h('div', { className: 'dshLocalProxy_description' }, t('description')),
          ),
          h(Switch, {
            checked: enabled,
            disabled: locked,
            label: t('title'),
            onChange: (next) => {
              write('enabled', next)
            },
          }),
        ),
        h(
          'div',
          { className: 'dshLocalProxy_field' },
          h('label', { className: 'dshLocalProxy_label', htmlFor: inputId }, t('urlLabel')),
          h(
            'div',
            { className: 'dshLocalProxy_rowline' },
            h('input', {
              id: inputId,
              className: 'dshLocalProxy_input',
              type: 'text',
              inputMode: 'url',
              value: draft,
              placeholder: t('placeholder'),
              disabled: locked,
              spellCheck: false,
              autoComplete: 'off',
              'aria-invalid': valid ? 'false' : 'true',
              onChange: (event) => {
                setDraft(event.target.value)
                setFailed(false)
                setJustSaved(false)
              },
              onBlur: commit,
              onKeyDown: (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commit()
                  event.currentTarget.blur()
                } else if (event.key === 'Escape') {
                  setDraft(savedUrl)
                }
              },
            }),
            h(
              'button',
              { type: 'button', className: 'dshLocalProxy_save', disabled: !canSave, onClick: commit },
              busy ? t('saving') : dirty ? t('save') : justSaved ? t('saved') : t('save'),
            ),
          ),
        ),
        valid ? null : h('div', { className: 'dshLocalProxy_error', role: 'alert' }, t('invalidUrl')),
        failed ? h('div', { className: 'dshLocalProxy_error', role: 'alert' }, t('saveFailed')) : null,
        h(
          'div',
          { className: 'dshLocalProxy_hint' },
          busy ? t('saving') : !ready ? t('unavailable') : enabled ? t('enabledHint') : t('disabledHint'),
        ),
      )
    }

    /**
     * Panel over a shared `configForms` controller (the Settings row and the
     * bundle page, whose slot passes no form).
     *
     * @param props `controller`, `t`, `embedded`, `scope`.
     * @returns The panel.
     */
    function ControllerPanel(props) {
      const snapshot = useFormSnapshot(props.controller)
      return h(ProxyFields, {
        state: snapshot,
        t: props.t,
        embedded: props.embedded,
        scope: props.scope,
        submit: (field, next) => props.controller.set(field, next),
      })
    }

    /**
     * Panel over the page-owned form a bundle config row is rendered with.
     *
     * @param props `form` (`{state, mutate}`), `t`, `embedded`, `scope`.
     * @returns The panel.
     */
    function PageFormPanel(props) {
      const form = props.form
      return h(ProxyFields, {
        state: form.state,
        t: props.t,
        embedded: props.embedded,
        scope: props.scope,
        submit: (field, next) => form.mutate([{ op: 'set', path: [field], value: next }]),
      })
    }

    return {
      inject: ['slots', 'locale', 'configForms'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'local-http-proxy: dictionaries')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.plugin = PACKAGE
          style.textContent = CSS
          document.head.appendChild(style)
          return () => {
            style.remove()
          }
        }, 'local-http-proxy: styles')

        const forms = ctx.get('configForms')
        if (forms === undefined) return

        /** Bound translator: slot owner props rarely carry `t`, so read our own namespace. */
        const t = ctx.locale.bind(NS)
        const copy = (ownerProps) =>
          ownerProps !== undefined && typeof ownerProps.t === 'function' ? ownerProps.t : t

        /**
         * The panel a Plugins-page cell renders: the page passes its own form when
         * it has one, otherwise the shared controller of this entry stands in.
         *
         * @param controller Shared form controller for this entry.
         * @param ownerProps Owner props of the cell.
         * @param scope Identifies the input id inside the page.
         * @returns The embedded panel.
         */
        const embedded = (controller, ownerProps, scope) => {
          const passed = ownerProps === undefined ? undefined : ownerProps.form
          if (passed !== undefined && passed !== null) {
            return h(PageFormPanel, { form: passed, t: copy(ownerProps), embedded: true, scope })
          }
          return h(ControllerPanel, { controller, t: copy(ownerProps), embedded: true, scope })
        }

        /** Settings → General row, for people who look there first. */
        ctx.effect(
          () =>
            forms.whileServed([ENTRY_ID], () =>
              ctx.slots.inject('settings.general.item', () => {
                const controller = forms.get(ENTRY_ID)
                return ctx.slots.register(
                  {
                    name: 'settings.general.item',
                    id: ENTRY_ID,
                    order: 18,
                    locale: NS,
                  },
                  (ownerProps) => h(ControllerPanel, { controller, t: copy(ownerProps), scope: 'settings' }),
                )
              }),
            ),
          'local-http-proxy: settings row',
        )

        /** Its own tab on the Plugins page, so the switch and the address sit where people look. */
        ctx.slots.inject('plugins.tab', () => {
          const controller = forms.get(ENTRY_ID)
          return ctx.slots.register(
            { name: 'plugins.tab', id: ENTRY_ID, order: 5, label: () => t('navLabel'), locale: NS },
            (ownerProps) => h(ControllerPanel, { controller, t: copy(ownerProps), scope: 'tab' }),
          )
        })

        /** Its own page inside the Plugins settings section, for people who look there instead. */
        ctx.slots.inject('settings.plugins.tab', () => {
          const controller = forms.get(ENTRY_ID)
          return ctx.slots.register(
            { name: 'settings.plugins.tab', id: ENTRY_ID, order: 65, label: () => t('navLabel'), locale: NS },
            () => h(ControllerPanel, { controller, t, scope: 'settings-plugins' }),
          )
        })

        /** The bundle's own page under Plugins, keyed by the bundle package name. */
        ctx.slots.inject('plugins.bundle.config', () => {
          const controller = forms.get(ENTRY_ID)
          return ctx.slots.register(
            { name: 'plugins.bundle.config', key: PACKAGE, locale: NS },
            (ownerProps) => {
              const view = ownerProps === undefined ? undefined : ownerProps.view
              if (view === 'summary') return null
              return embedded(controller, ownerProps, 'bundle')
            },
          )
        })

        /** The configure page of the row this bundle declares: `<package>#<row id>`. */
        ctx.slots.inject('plugins.row.config', () => {
          const controller = forms.get(ENTRY_ID)
          return ctx.slots.register(
            { name: 'plugins.row.config', key: `${PACKAGE}#${ENTRY_ID}`, locale: NS },
            (ownerProps) => {
              const view = ownerProps === undefined ? undefined : ownerProps.view
              if (view === 'summary') return null
              return embedded(controller, ownerProps, 'row')
            },
          )
        })
      },
    }
  },
})
