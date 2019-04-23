// util function

// 将字符串形式的时间解析为整数时间:s
function parseTime(str){
    //t: 00:00 -> second
    var idx = str.indexOf(':')
    var min = parseInt(str.slice(0, idx))
    var sec = parseInt(str.slice(idx+1))
    total = min*60+sec
    return total
}

// 将时间秒数转换为字符串形式： 00:00
function strTime(t){
    //t: second(int) -> (string)00:00
    var min = parseInt(t/60)
    var str_min = (Array(2).join('0')+min).slice(-2)
    var sec = t%60
    var str_sec = (Array(2).join('0')+sec).slice(-2)
    var re = str_min + ':' + str_sec
    return re
}

function convertNumber(num){
    // 当数字大于10000时，使用xx万显示(取上限)，其余显示具体数字
    if(num > 10000){
        return Math.ceil(num/10000) + '万'
    }
    return num
}

function showFunctionNotOpenDialog(){
    const {ipcRenderer} = require('electron')
    ipcRenderer.send('function-not-open-dialog')
}


module.exports = {
    parseTime, strTime,
    convertNumber, 
    showFunctionNotOpenDialog,
}