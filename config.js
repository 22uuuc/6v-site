/* 墨影书城 · 运行时配置（出口通道 / 接入点）
 * ------------------------------------------------------------------
 * 这个文件在构建之后仍然可以改，改完刷新页面即生效，不需要重新 npm run build。
 * 部署时必须与 index.html 同级（dist 根目录），并由 index.html 用
 *     <script src="./config.js"></script>
 * 在应用主包之前加载。
 *
 * 两种改法：
 *   A. 直接改本文件里的值（推荐，适合上线/换域名/换隧道）
 *   B. 浏览器控制台临时改（只影响当前浏览器）：
 *        localStorage.setItem('moying.api.base', 'https://xxxx.ngrok-free.app')
 *        要撤销：localStorage.removeItem('moying.api.base')
 *        或调用：MoyingRuntime.setBase('https://xxxx.ngrok-free.app')
 * ------------------------------------------------------------------
 */
window.__MOYING__ = {
  /* 前端要连的后端基址（“接的地方”）
   *   null      = 未配置，自动探测：同源 /api → 同主机:8787 → 127.0.0.1:8787
   *   ''        = 强制同源（由 nginx / 隧道把 /api 反代到本机 8787，生产推荐）
   *   'https://xxx.ngrok-free.app' = 直连隧道域名（后端必须放行该来源的 CORS）
   * 注意：https 页面只能连 https 后端，否则会被混合内容策略拦截。
   */
  apiBase: '',

  /* 备用出口（可选，数组；留空 [] = 不启用）
   * 主出口（apiBase）连续失败时按顺序尝试这里列出的地址，命中即切换；
   * 下一轮轮询仍优先回主出口，主恢复后自动切回。切换会以 kind=failover 上报后端留痕。
   * 典型用法：给后端再绑一个备用域名（如 moying-api-backup.xxx），在此并列，
   * 主域名到期/DNS 故障/证书异常时不至于整站打不开。
   * 注意：https 页面只能连 https 备出口；直连 IP 必须带有效证书，否则会被浏览器拦。
   */
  apiFallbacks: ['https://moying-api.us.ci'],

  /* 后端门禁：已于 2026-10-24 移除内置明文 appKey
   *   前端不再随包分发长期凭据：首屏自动向 /api/gate/token 换取 12 小时短时令牌，
   *   之后所有请求只发 x-app-token，过期或被拒时自动重取。
   *   null / '' = 不发 x-app-key；后端关闭旧钥匙兼容通道后无需再改本文件。
   *   临时排障可在浏览器 localStorage['moying.app.key'] 覆盖，仅影响该浏览器。
   */
  appKey: '',
};
