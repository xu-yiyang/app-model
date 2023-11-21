import { app, shell, BrowserWindow, ipcMain, clipboard, nativeImage } from 'electron'
import { autoUpdater } from 'electron-updater'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import path, { join } from 'path'
import iconDrog from '../../resources/dropIcon.png?asset'
import icon from '../../resources/icon.png?asset'

//所有窗体
let windows: {
  loginWindow: null | BrowserWindow,
  indexWindow: null | BrowserWindow,
} = {
  loginWindow: null, // 登录窗口
  indexWindow: null, // 主窗口
}

const publicAtts = {
  icon: icon,
  frame: false,
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    sandbox: false,
    nodeIntegration: true,
  }
}
let updataUrl = import.meta.env['RENDERER_VITE_ALL_UPDATE_URL'] || ''
function enableCheckUpdate() {
  const focusedWindow: any = BrowserWindow.getFocusedWindow();//当前操作的窗口实例
  autoUpdater.setFeedURL(updataUrl);
  
  //默认会自动下载新版本，如果不想自动下载，设置autoUpdater.autoDownload = false
  autoUpdater.autoDownload = false
  
  //监听'error'事件
  autoUpdater.on('error', (err) => {
    console.log(err, '下载错误')
  })
  
  //监听'update-available'事件，发现有新版本时触发
  autoUpdater.on('update-available', (info) => {
    console.log('found new version',info)
    focusedWindow?.webContents?.send?.('update-available', info)
  })
  
  // 监听下载进度
  autoUpdater.on('download-progress', function (progressObj) {
    console.log(progressObj)
    focusedWindow?.webContents?.send?.('download-progress', progressObj)
  })
  
  //监听'update-downloaded'事件，新版本下载完成时触发
  autoUpdater.on('update-downloaded', () => {
    console.log('发现新版本，是否更新？');
    autoUpdater.quitAndInstall()
    app.quit()
  })
}

function createLoginWindow() {
  windows.loginWindow = new BrowserWindow({
    ...publicAtts,
    width: 720,
    height: 512,
    resizable: false,
  });

  // 加载应用的入口页面，并指定默认路由
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    windows.loginWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/login`)
  } else {
    windows.loginWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/login' })
  }

  // 当登录窗体关闭时，销毁窗体对象
  windows.loginWindow.on('closed', () => {
    windows.loginWindow = null;
  });
}

function createIndexWindow(): void {
  // Create the browser window.node_modules
  windows.indexWindow = new BrowserWindow({
    ...publicAtts,
    width: 1280,
    minWidth: 1024,
    height: 720,
    minHeight: 720,
  })

  enableCheckUpdate()
  
  windows.indexWindow.on('ready-to-show', () => {
    windows?.indexWindow?.show()
  })

  windows.indexWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    windows.indexWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    windows.indexWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/** 接收渲染进程 操作窗口 的通知
 * @param {Object} event
 * @param {String} windowName 需要操作的窗口名称
 * @param {String} operationType 操作类型
 */
ipcMain.on('operation-window', function (event, operationType, other) {
  const focusedWindow = other?.windowName ? windows[other.windowName] : BrowserWindow.getFocusedWindow();//当前操作的窗口实例
  if (!focusedWindow) return;
  switch (operationType) {
    case 'min'://窗口 最小化
      focusedWindow.minimize();
      break;

    case 'max'://窗口 最大化
      focusedWindow.maximize();
      break;

    case 'toggleMaximize'://窗口最大化或还原
      if (focusedWindow?.isMaximized()) {
        focusedWindow.unmaximize()
      } else {
        focusedWindow?.maximize()
      }
      break;

    case 'close'://窗口 关闭
      focusedWindow.close();
      break;

    case 'loginSuccess'://登录成功
      windows?.loginWindow?.close()
      createIndexWindow()
      break;

    case 'loginOut'://退出登录
      windows?.indexWindow?.close()
      createLoginWindow()
      break;

    case 'openDevTools'://打开控制台
      focusedWindow.webContents.openDevTools();
      break;

    case 'getDownloads'://获取下载目录
      event.returnValue = app.getPath('downloads')
      break;
      
    case 'getPathExe'://获取exe运行目录
      event.returnValue = path.dirname(app.getPath('exe'))
      break;
      
    case 'getAppPath'://获取项目目录
      event.returnValue = app.getAppPath()
      break;
      
    case 'isPackaged':// 项目是否打包，用于判断是否本地开发环境
      event.returnValue = app.isPackaged
      break;

    case 'startDragFile'://获取下载目录
      // const thumbnailFromPath = other.imgUrl ? nativeImage.createFromPath(iconDrog) : iconDrog;
      const thumbnailFromPath = nativeImage.createFromPath(iconDrog).resize({
        width: 30,
        height: 30,
      });
      event.sender.startDrag({
        file: other.file,
        icon: thumbnailFromPath
      })
      break;

    case 'copyToClipboard'://复制文本到剪贴板
      clipboard.writeText(other.text)
      break;

    case 'checkUpdate'://检测软件版本
      //检测更新
      autoUpdater.checkForUpdates()
      break;

    case 'updateDownloaded'://更新软件
      autoUpdater.downloadUpdate()
      break;

    case 'openPath'://打开文件夹
      shell.openPath(other.url);
      break;


  }
});
ipcMain.handle('handle-window', function (event, operationType, other) {
  const focusedWindow = other?.windowName ? windows[other.windowName] : BrowserWindow.getFocusedWindow();//当前操作的窗口实例
  if (!focusedWindow) return;
  switch (operationType) {
    case 'isMaximized'://获取当前窗口是否最大化
      return focusedWindow?.isMaximized()

    case 'isMinimized'://获取当前窗口是否最小化
      return focusedWindow?.isMinimized()

    case 'getVersion'://获取app版本
      return app.getVersion()
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createLoginWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createLoginWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   如果用户不是在 macOS(darwin) 上运行程序，则调用 app.quit()
  //   app.quit()
  // }
  app.quit()
})