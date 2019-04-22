const {ipcRenderer} = require('electron')

var open_dialog = document.getElementById("open-dialog")
var save_dialog = document.getElementById("save-dialog")
var error_dialog = document.getElementById("error-dialog")
var msg_dialog = document.getElementById("msg-dialog")

    
open_dialog.onclick = function(){
    ipcRenderer.send('function-open-dialog')
}

save_dialog.onclick = function(){
    ipcRenderer.send('function-save-dialog')
}

error_dialog.onclick = function(){
    ipcRenderer.send('function-error-dialog')
}

msg_dialog.onclick = function(){
    ipcRenderer.send('function-msg-dialog')
}