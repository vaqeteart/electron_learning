const path = require('path')
const {app, BrowserWindow} = require('electron')
let mainWindow = null
if (process.mas) app.setName('Electron APIs')

function initialize () {
  function createWindow () {
    const windowOptions = {
      width: 640,
      height: 500,
      frame: true,
    }

    mainWindow = new BrowserWindow(windowOptions)
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

function initEvent(){
  require('./script/ipc_main')
}
initEvent()
initialize()
