const path = require('path')
const {app, BrowserWindow} = require('electron')
let mainWindow = null
if (process.mas) app.setName('Electron APIs')

function initialize () {
  function createWindow () {
    const windowOptions = {
        width: 1024,
        minWidth: 1024,
        height: 670,
        minHeight: 670,
        frame: false,
        title: app.getName()
    }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.webContents.openDevTools()
    mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))

    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  app.on('ready', () => {
    createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
}

function initMainEvent(){
    // 程序启动时需要进行初始化：添加主进程响应事件， 读取用户数据
    require('./main_process/win_event')
}


initialize()
initMainEvent()