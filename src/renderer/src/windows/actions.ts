
/**
 * @desc 登录窗口
 */
export async function openLoginWin() {
  window.api.operationWindow('loginOut')
}

/**
 * @desc 主页窗口
 */
export async function openIndexWin() {
  window.api.operationWindow('loginSuccess')
}


/**
 * @desc 关闭所有窗口
 */
export async function closeAllWin() {
  window.api.operationWindow('close')
}

/**
 * @desc 窗口最小化
 */
export async function minimizeWin() {
  window.api.operationWindow('min')
}

/**
 * @desc 窗口最大化或还原
 */
export async function toggleMaximize() {
  window.api.operationWindow('toggleMaximize')
}

/**
 * @desc 获取当前窗口是否最大化
 */
export function isMaximized() {
  return window.api.handleWindow('isMaximized')
}

/**
 * @desc 获取当前窗口是否最小化
 */
export function isMinimized() {
  return window.api.handleWindow('isMinimized')
}

/**
 * @desc 获取当前版本
 */
export function getVersion() {
  return window.api.handleWindow('getVersion')
}

/**
 * @desc 打开浏览器控制台
 */
export function openDevTools() {
  return window.api.operationWindow('openDevTools')
}

/**
 * @desc 检测软件版本
 */
export function checkUpdate() {
  return window.api.operationWindow('checkUpdate')
}

/**
 * @desc 更新软件版本
 */
export function updateDownloaded() {
  return window.api.operationWindow('updateDownloaded')
}