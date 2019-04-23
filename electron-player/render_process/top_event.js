
const {ipcRenderer} = require('electron')

// 关闭
var close = document.getElementById('winclose')
close.addEventListener('click', function () {
    ipcRenderer.send('win-close', '')
})

// 最大化
var maximize = document.getElementById('maximize')
maximize.addEventListener('click', function () {
    ipcRenderer.send('win-max', '')  
})

// 最小化
var minimize = document.getElementById('minimize')
minimize.addEventListener('click', function () {
    ipcRenderer.send('win-min', '')
})

// 搜索
var search = document.getElementById('search')
search.addEventListener('focus', function(){
    var icon = document.querySelector('.search-icon')
    icon.classList.toggle('is-focus')
    document.onkeydown = function (event) {
        if(event.keyCode == 13){
            var util = require('../script/util')
            util.showFunctionNotOpenDialog()
        }
    }
})

search.addEventListener('blur', function(){
    var icon = document.querySelector('.search-icon')
    icon.classList.toggle('is-focus')
    document.onkeydown = null
})

