var playApi = require('../script/play_api')
var util = require('../script/util')

var timer = null   // 播放进度条定时器
var curTime = 0    // 当前播放的时间进度，s
var timeAll = 0    // 当前播放的总时长，s
var curSongId = null  // 当前播放歌曲id
var curPlayMode = 1    // 当前播放模式 1：顺序  2： 列表循环，3： 单曲循环 4： 随机


function initContetnPlay(){
    //初始化播放前后
    var playLastBg = document.querySelector('.play-last-bg')
    playLastBg.addEventListener('click', function(){
        playLast()   // 播放上一首
    })
    var playNextBg = document.querySelector('.play-next-bg')
    playNextBg.addEventListener('click', function(){
        playNext()  // 播放下一首
    })

    // 播放 暂停
    var playBg = document.querySelector('.play-bg')
    playBg.addEventListener('click', function(){
        play = document.querySelector('.play').style
        if (play.opacity == '1'){   // 如果当前是暂停状态，则开始播放，否则暂停
            play.opacity = '0'
            if(curSongId){
                playApi.Play()
                continuePlay()    // 开始播放，开启刷新定时器
            }
        }else{
            play.opacity = '1'
            if(curSongId){
                playApi.Pause()
                pausePlay()
            }
        }
        pause = document.querySelectorAll('.play')[1].style
        if (pause.opacity == '1'){
            pause.opacity = '0'
        }else{
            pause.opacity = '1'
        }
    })
}

function initTime(){
    // 时间进度条初始化
    var slider = document.getElementById('time-slider')
    var sliderFront = document.querySelector('.time-front')
    var sliderBg = document.querySelector('.time-bg')
    slider.style.left = window.getComputedStyle(sliderFront).getPropertyValue('width')   // 滑块的初始位置与滑动条保持一致

    // 添加事件
    sliderBg.addEventListener('mousedown', function (e) {
        var width = e.clientX - parseInt(window.getComputedStyle(this).getPropertyValue('left'))  // 计算点击位置距背景条左端的距离，即为滑动条的宽度
        document.querySelector('.time-front').style.width = width + 'px'
        document.getElementById('time-slider').style.left = width + 'px'   // 修改滑块和滑动条的位置
        var newTime = Math.floor(width/this.offsetWidth * timeAll)   // 根据百分比计算新的时间
        playApi.PlayToTime(newTime)
        curTime = newTime
        if(!timer){
            timer = setInterval(updateTime, 1000)   // 定时刷新
        }
        freshTime(newTime)   // 刷新时间
    })

    // 滑块添加滑动事件
    slider.addEventListener('mousedown', function(e){  
        if (e.button == 0){  //鼠标左键
            var posBegin = e.clientX   // 点击时记录开始位置
            var widthBegin = parseInt(window.getComputedStyle(sliderFront).getPropertyValue('width'))  // 进度条当前的宽度
            document.onmousemove = function(e){
                var newWidth = Math.max(0, Math.min(sliderBg.offsetWidth, widthBegin + e.clientX - posBegin)) // 鼠标拖动时进度条新的宽度，不要超过边界:[0, 背景条宽度]
                sliderFront.style.width = newWidth + 'px'
                slider.style.left = newWidth + 'px'
                // 取消选择， 防止拖动过程中选中其它元素
                var newTime = Math.floor(newWidth/sliderBg.offsetWidth * timeAll)  // 时间重新计算
                playApi.PlayToTime(newTime)
                curTime = newTime
                window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty()
                document.onmouseup = function () {   // 当鼠标弹起时，不再响应滑动事件
                    document.onmousemove = null
                }
                if(!timer){
                    timer = setInterval(updateTime, 1000)
                }
                freshTime(newTime)   // 刷新时间
            }
        }
    })
}   

function freshTime(time){
    // time: second
    var timeBegin = document.querySelector('.time-begin')   
    timeBegin.innerText = util.strTime(time)   // 时间格式转换
}

//voice
function initVoiceSwitch(){
    var voiceOpen = document.querySelectorAll('.voice')[1]
    voiceOpen.addEventListener('click', function() {   // 添加事件
        var volume = document.querySelector('.volume-front')
        if (voiceOpen.style.opacity == '1'){   // 当当前非静音状态时，设置静音否则相反
            voiceOpen.style.opacity = '0'
            volume.style.opacity = '0' 
            playApi.setMute(true)   // 调用接口，播放器静音
        }else{
            voiceOpen.style.opacity = '1'
            volume.style.opacity = '1'
            playApi.setMute(false)
        }
        var voiceClose = document.querySelectorAll('.voice')[0]
        if (voiceClose.style.opacity == '1'){
            voiceClose.style.opacity = '0'
        }else{
            voiceClose.style.opacity = '1'
        }
    })
}

function initVolumeSlider(){
    var slider = document.getElementById('volume-slider')
    var sliderFront = document.querySelector('.volume-front')
    var sliderBg = document.querySelector('.volume-bg')
    slider.style.left = window.getComputedStyle(sliderFront).getPropertyValue('width')

    sliderBg.addEventListener('mouseover', function(){   // 当鼠标放在上面时才显示滑块
        let width = window.getComputedStyle(sliderFront).getPropertyValue('width')
        slider.style.opacity = '1'
        slider.style.left = width
    })
    sliderBg.addEventListener('mouseout', function(){   // 鼠标移出区域，滑块隐藏
        slider.style.opacity = '0'
    })
    sliderBg.addEventListener('mousedown', function (e) {   // 鼠标点击事件
        let left = parseInt(window.getComputedStyle(this).getPropertyValue('left'))
        let width = e.clientX - left
        sliderFront.style.width = width + 'px'   // 更新滑块位置和滑动条的宽度
        slider.style.left = width + 'px'
        playApi.SetVolume(width / this.offsetWidth)  // 设置音量百分比
    })

    slider.addEventListener('mousedown', function(e){
        if (e.button == 0){  //鼠标左键
            var posBegin = e.clientX
            var widthBegin = parseInt(window.getComputedStyle(sliderFront).getPropertyValue('width'))  // sliderFront.offsetLeft
            document.onmousemove = function(e){
                slider.style.opacity = '1'  //防止拖出背景条区域时滑块因不在区域内而隐藏
                var newWidth = Math.max(0, Math.min(sliderBg.offsetWidth, widthBegin + e.clientX - posBegin)) // 滑块拖动重新计算宽度
                sliderFront.style.width = newWidth + 'px'
                slider.style.left = newWidth + 'px'
                // 取消选择， 防止拖动过程中选中其它元素
                window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                document.onmouseup = function (e) {
                    document.onmousemove = null   // 鼠标弹起，滑动结束
                    var edgeLeft = parseInt(window.getComputedStyle(sliderBg).getPropertyValue('left'))
                    var edgeRight = edgeLeft + sliderBg.offsetWidth
                    if(e.clientX < edgeLeft || e.clientX > edgeRight)
                        slider.style.opacity = '0'
                }
                playApi.SetVolume(newWidth/sliderBg.offsetWidth)   // 重新设置音量
            }
        }
    })
}

// play-order
function initPlayOrder(){
    var play_order = document.querySelectorAll('.play-order')[0]    // 列表循环
    play_order.addEventListener('click', function () {
        this.classList.toggle('is-show')
        let next = document.querySelectorAll('.play-order')[1]
        next.classList.toggle('is-show')
        curPlayMode = 3     // 记录当前模式
    })
    play_order = document.querySelectorAll('.play-order')[1]   // 单曲循环
    play_order.addEventListener('click', function () {
        this.classList.toggle('is-show')
        let next = document.querySelectorAll('.play-order')[2]
        next.classList.toggle('is-show')
        curPlayMode = 4
    })
    play_order = document.querySelectorAll('.play-order')[2]   // 随机
    play_order.addEventListener('click', function () {
        this.classList.toggle('is-show')
        let next = document.querySelectorAll('.play-order')[3]
        next.classList.toggle('is-show')
        curPlayMode = 1
    })
    play_order = document.querySelectorAll('.play-order')[3]  // 顺序
    play_order.classList.toggle('is-show')
    play_order.addEventListener('click', function () {
        this.classList.toggle('is-show')
        let next = document.querySelectorAll('.play-order')[0]
        next.classList.toggle('is-show')
        curPlayMode = 2
    })
}


function initLrcSonglistBtn(){
    // 歌词，歌单按钮
    var lrcBtn = document.querySelector('.lyrics-btn')
    var songlistBtn = document.querySelector('.play-list-num')
    lrcBtn.addEventListener('click', function () {
        util.showFunctionNotOpenDialog()   // 功能暂未开放
    })
    songlistBtn.addEventListener('click', function () {
        util.showFunctionNotOpenDialog()
    })
}

function initContent(){
    initContetnPlay()
    initTime()
    initPlayOrder()
    initVoiceSwitch()
    initVolumeSlider()
    initLrcSonglistBtn()
}

initContent()

function pausePlay(){
    // 暂停播放
    if(timer){
        clearInterval(timer)   // 清除定时器数据
    }
    if(document.getElementById('songlrc-section')){   // 是否有打开lrcPage
        require('./songlrc_event').animationCtrl(false)
    }
}

function continuePlay(){
    timer = setInterval(updateTime, 1000)  // 开启定时器进行时间刷新
    if(document.getElementById('songlrc-section')){
        require('./songlrc_event').animationCtrl(true)
    }
}

function updateTime(){
    var percent = curTime/timeAll   // 计算百分比
    var widthAll = parseInt(window.getComputedStyle(document.querySelector('.time-bg')).getPropertyValue('width'))
    var width = Math.floor(percent * widthAll)
    freshTime(curTime)   // 刷新显示时间
    document.querySelector('.time-front').style.width = width + 'px'     // 更新滑动条宽度和滑块位置
    document.getElementById('time-slider').style.left = width + 'px'
    curTime += 1
    if(curTime > timeAll){   
        clearInterval(timer)
        timer = null
        playNextAuto()   // 播放完毕，自动进行下一首
    }
}

function startPlay(t, songId){
    // t: 歌曲的总时长,只负责表现，实际播放使用playApi
    document.querySelector('.time-end').innerText = util.strTime(t)
    var play = document.querySelectorAll('.play')[0]
    var pause = document.querySelectorAll('.play')[1]
    play.style.opacity = '0'
    pause.style.opacity = '1'
    curTime = 0
    timeAll = t
    curSongId = songId
    if(timer){
        clearInterval(timer)
        timer = null
    }
    timer = setInterval(updateTime, 1000);

    if(document.getElementById('songlrc-section')){
        var lrcEvent =require('./songlrc_event')
        lrcEvent.freshContent()
    }
}

function playNextAuto(){
    // 播放下一首，根据播放方式进行选择：顺序-单曲循环-列表循环-随机
    var songlistEvent = require('./songlist_event')
    var nextSongId = 0
    if(curPlayMode == 1){ 
        var songIdx = songlistEvent.songIdList.indexOf(curSongId)
        if(songIdx == songlistEvent.songIdList.length-1){  // 播放到最后一首，暂停
            pausePlay()
        }else{
            nextSongId = songlistEvent.songIdList[songIdx + 1]
            startPlay(songlistEvent.songlistInfo[nextSongId].time, nextSongId)   // 开始播放
            playApi.PlayNew(songlistEvent.songlistInfo[nextSongId].songLink)     // 调用播放api
            freshPlayItem(nextSongId)   // 刷新播放信息
        }
    }else if(curPlayMode == 2){
        var songIdx = songlistEvent.songIdList.indexOf(curSongId)
        if(songIdx == songlistEvent.songIdList.length-1){
            nextSongId = songlistEvent.songIdList[0]
        }else{
            nextSongId = songlistEvent.songIdList[songIdx + 1]
        }
        startPlay(songlistEvent.songlistInfo[nextSongId].time, nextSongId)
        playApi.PlayNew(songlistEvent.songlistInfo[nextSongId].songLink)
        freshPlayItem(nextSongId)
    }else if(curPlayMode == 3){
        startPlay(timeAll, curSongId)
        playApi.PlayNew(songlistEvent.songlistInfo[curSongId].songLink)
    }else{
        var curIdx = songlistEvent.songIdList.indexOf(curSongId)
        var nextIdx = Math.floor(Math.random() * songlistEvent.songIdList.length)   // 随机获取一个值
        if(nextIdx == curIdx){
            nextIdx += 1
        }
        if(nextIdx == songlistEvent.songIdList.length-1){
            nextIdx = 0
        }
        nextSongId = songlistEvent.songIdList[nextIdx]
        startPlay(songlistEvent.songlistInfo[nextSongId].time, nextSongId)
        playApi.PlayNew(songlistEvent.songlistInfo[nextSongId].songLink)
        freshPlayItem(nextSongId)
    }

    if(document.getElementById('songlrc-section')){   // 如果歌词页显示，刷新歌词内容
        var lrcEvent =require('./songlrc_event')
        lrcEvent.freshContent()
    }
}

function playNext(){
    // 播放下一首，按列表循环
    var songlistEvent = require('./songlist_event')
    var nextSongId = 0
    if(!curSongId){
        curSongId = songlistEvent.songIdList[0]
    }
    var songIdx = songlistEvent.songIdList.indexOf(curSongId)
    if(songIdx == songlistEvent.songIdList.length-1){    // 获取下一首歌曲id
        nextSongId = songlistEvent.songIdList[0]
    }else{
        nextSongId = songlistEvent.songIdList[songIdx+1]
    }
    startPlay(songlistEvent.songlistInfo[nextSongId].time, nextSongId)
    playApi.PlayNew(songlistEvent.songlistInfo[nextSongId].songLink)
    freshPlayItem(nextSongId)

    if(document.getElementById('songlrc-section')){
        var lrcEvent =require('./songlrc_event')
        lrcEvent.freshContent()
    }
}

function playLast(){
    // 同playNext
    var songlistEvent = require('./songlist_event')
    if(!curSongId){
        curSongId = songlistEvent.songIdList[0]
    }
    songIdx = songlistEvent.songIdList.indexOf(curSongId)
    if(songIdx == 0){
        lastSongId = songlistEvent.songIdList[songlistEvent.songIdList.length-1]
    }else{
        lastSongId = songlistEvent.songIdList[songIdx-1]
    }
    startPlay(songlistEvent.songlistInfo[lastSongId].time, lastSongId)
    playApi.PlayNew(songlistEvent.songlistInfo[lastSongId].songLink)
    freshPlayItem(lastSongId)

    if(document.getElementById('songlrc-section')){
        var lrcEvent =require('./songlrc_event')
        lrcEvent.freshContent()
    }
}

function freshPlayItem(songid){
    var leftEvent = require('./nav_event')
    var songlistEvent = require('./songlist_event')
    var songInfo = songlistEvent.songlistInfo[songid]
    leftEvent.updatePlayItem(songInfo.albumId, songInfo.songName, songInfo.artistName)
}

function updateSonglistNumber(num){
    // 更新右下角的数字信息
    document.querySelector('.play-list-num-bg').innerHTML = num
}

function getCurrSongId(){
    return curSongId  // 获取当前播放歌曲id
}

function getCurrTime(){
    return curTime   // 获取当前播放时间
}

function getTimeAll(){
    return timeAll   // 当前歌曲总时长
}

module.exports = {
    startPlay,
    updateSonglistNumber,
    getCurrSongId,
    getCurrTime,
    getTimeAll,
}