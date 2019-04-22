const {ipcMain, dialog} = require('electron')

ipcMain.on('function-open-dialog', (event) => {
    const options = {
        title: '打开文件对话框',
    }
    dialog.showOpenDialog(options)
})

ipcMain.on('function-save-dialog', (event) => {
    const options = {
        title: '保存文件对话框',
    }
    dialog.showSaveDialog(options)
})

ipcMain.on('function-error-dialog', (event) => {
    var title = '错误对话框'
    var content = '发生了一个错误！'
    dialog.showErrorBox(title, content)
})

ipcMain.on('function-msg-dialog', (event) => {
    const options = {
        type: 'info',
        title: '信息',
        message: '消息对话框内容！',
    }
    dialog.showMessageBox(options)
})