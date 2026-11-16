# dsh-local-http-proxy

在 DeepSeek Harness 里配置一个 HTTP 代理，让本地安装插件和依赖时走这个代理，并在 Web 界面里开关它。

[English](README.md) | 中文

## 它做什么

DeepSeek Harness 安装插件的方式是在你的 profile 目录里执行 `pnpm add`；当来源是 GitHub 地址时还会调用 `git`。
如果 GitHub 或某个软件源在你的网络里访问不了，这些安装就会失败。这个插件把同一个代理地址写进 Harness
进程的环境，于是它拉起的每一次安装都走这个代理，而不是直连。

它会设置 `http_proxy`、`HTTPS_PROXY`、`all_proxy` 等变量，把常用的回环地址留在 `no_proxy` 里以免本地服务也被代走，
并设置 `NODE_USE_ENV_PROXY=1` 让 Node 子进程同样遵守这些变量。

打开开关立即生效，无需重启；关闭开关则恢复到进程启动时的环境。

## 怎么用

安装 bundle 并刷新页面后，代理面板出现在三处：

- **插件** 页 ——「已安装」旁边的 **代理** 标签。
- **设置 → 插件** —— **代理** 标签。
- **设置 → 通用** —— 标题为「插件安装 HTTP 代理」的一行。

面板里是一个开关加一个地址框。地址默认为 `http://127.0.0.1:7897`，换成别的 `http://` 或 `https://`
地址后，按回车、点「保存」或让输入框失焦即可。不是 `http://` / `https://` 的地址会提示错误并且无法保存。

## 安装

从 npm 安装：

```sh
dsh plugin --profile <profile> add dsh-local-http-proxy
```

或者直接从本仓库安装：

```sh
dsh plugin --profile <profile> add github:DerikZhang/dsh-http-local-proxy
```

安装后如果该 bundle 未启用，请在那个 profile 里选中它。

## 限制

- **只作用于子进程。** 代理覆盖安装过程和新启动的命令；Harness 进程自身发出的请求（模型流量、联网搜索、
  网页抓取）不受影响，所以开启它不会打断正在进行的对话。
- **启动时的策略优先。** 如果你在启动 `dsh` 时已经导出了 `HTTP_PROXY` / `HTTPS_PROXY`，启动器会在任何插件
  加载之前装好自己的出站策略，那个策略优先于这里设置的地址。
- **已在运行的命令保持原环境。** 只有在开关打开之后启动的进程才会继承代理。
- **仅支持 HTTP 代理。** SOCKS 和 PAC 地址会被拒绝；宿主本身只支持 `http://` 与 `https://` 代理地址。
- **`no_proxy` 是合并而非替换。** 你原有的绕过条目会保留，回环地址会被追加进去。

## 许可

MIT
