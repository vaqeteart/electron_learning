const {ipcMain, BrowserWindow, dialog} = require('electron')


// 关闭
ipcMain.on('win-close', (event, arg)=>{
    BrowserWindow.getFocusedWindow().close()
})

// 最大-正常
ipcMain.on('win-max', (event, arg)=>{
    var win = BrowserWindow.getFocusedWindow()
    if (win.isMaximized()){
        win.unmaximize()
    }else{
        win.maximize()
    }
})

// 最小
ipcMain.on('win-min', (event, arg)=>{
    BrowserWindow.getFocusedWindow().minimize()
})

// 功能未开放
ipcMain.on('function-not-open-dialog', (event) => {
    const options = {
        type: 'info',
        title: '信息',
        message: '功能暂未开放！',
    }
    dialog.showMessageBox(options)
})