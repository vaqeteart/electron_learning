var importM = require('./import')
var util = require('../script/util')
var playApi = require('../script/play_api')

var lrcText = null       //  歌词，按行: [[t, lrc], [t lrc], ]
var lrcTitle = null      //  歌词中的作曲歌手等信息，没有时间标记，按行：[]
var updateTimer = null   //  刷新定时其
var curLrcLine = null    //  当前歌词行


function initLrcPage(){
    lrcText = null
    lrcTitle = null
    var closeBtn = document.querySelector('.lrc-close')
    closeBtn.onclick = function(){  // 关闭按钮添加点击事件
        var lrcPage = document.getElementById('songlrc-section')
        importM.songlrcPage = document.body.removeChild(lrcPage)   // 移除歌词页
        if(updateTimer){
            clearInterval(updateTimer)
            updateTimer = null
        }
    }
    var playEvent = require('./play_event')
    if(!playEvent.getCurrSongId() || playApi.isPaused()){   // 当前没有播放歌曲则暂时动画
        animationCtrl(false)
        return
    } 
    freshContent()   // 刷新歌词内容
    updateTimer = setInterval(updateLrcScroll, 1000);
}

function freshContent(){
    lrcText = null
    lrcTitle = null
    curLrcLine = null
    var playEvent = require('./play_event')
    var songlistEvent = require('./songlist_event')
    var songApi = require('../script/song_api')
    var songId = playEvent.getCurrSongId()
    var songInfo = songlistEvent.songlistInfo[songId]
    document.querySelector('.lrc-song-name').innerHTML = songInfo.songName
    document.querySelector('.lrc-songlist-name').innerHTML = '专辑：' + songInfo.albumName
    document.querySelector('.lrc-singer').innerHTML = '歌手：' + songInfo.artistName
    songApi.getAlbumImg(songInfo.albumId, function (imgUrl) {   // 获取歌单图片作为旋转图
        document.querySelector('.rotate-img').src = imgUrl
    })
    songApi.getSongLrc(songInfo.lrcLink, function (lrc) {   // 获取歌词数据
        var lineNum= parseLrc(lrc)   // 解析歌词
        var lrcNode = document.querySelector('.ul-lrc')
        var lineNodes = document.querySelectorAll('.li-lrc-sentence')
        var curLine = null
        for(let i=0; i<lineNum; i++){   // 歌词按行添加到列表节点
            if(i < lineNodes.length){
                curLine = lineNodes[i]
            }else{
                curLine = lineNodes[0].cloneNode(true)
                lrcNode.appendChild(curLine)
            }
            if(i<lrcTitle.length){
                curLine.innerHTML = lrcTitle[i]
            }else{
                curLine.innerHTML = lrcText[i-lrcTitle.length][1]
            }
            curLine.classList.remove('li-lrc-curr')
        }
        if(lineNum == 0){   // 若没有歌词则清空原有数据
            for(let j=0; j<lineNodes.length; j++){
                lineNodes[j].innerHTML = ''
                if(j==5) lineNodes[j].innerHTML = '无歌词'
            }
        }else{
            for(let j=lineNum; j<lineNodes.length; j++){
                lrcNode.removeChild(lineNodes[j])    // 若有多余行，删除
            }
        }
    
    })
    animationCtrl(true)    // 每次刷新就播放动画
}

function parseLrc(lrc){
    if(!lrc) return 0    //没有歌词文件返回
    lrcText = []
    lrcTitle = []
    var lines = lrc.split('\n')  // 将歌词分割成一行行数据
    var lineNum = 0
    lines.forEach(line => {
        var prefix = line.match(/\[(.+?)\]/g)  // 找到形如[xxx]的文本
        var text = ''
        if(prefix){
            prefix.forEach(t => {   //可能会有[xx:xx][xx:xx][xx:xx] xxxx 这样的存在
                let tt = t.match(/(\d.+\d)/g)   // 匹配带时间的[xxx]
                if(tt){
                    text = line.substr(line.lastIndexOf(']')+1)  // 去除时间信息的歌词文本
                    if(text.trim()){   //只添加非空行
                        let tn = util.parseTime(tt[0])   // 解析时间文件为数字：s
                        lrcText.push([tn, text])     // 保存解析数据
                        lineNum += 1
                    }
                }else{
                    text = line.trim().slice(1, -1)  // 头部几行信息，没有时间，去掉左右的[]
                    if(text){
                        lrcTitle.push(text)
                        lineNum += 1
                    }
                }
            })
        }
    })
    return lineNum
}

function updateLrcScroll(){
    if(!lrcText && !lrcTitle) return
    var playEvent = require('./play_event')
    var curTime = playEvent.getCurrTime()
    var lrc = null
    if(lrcText.length > 0){
        var idx = 0      // 记录歌词在lrcText中的行数
        var lineNum = 0  // 歌词在整个歌词中行数
        for(let i=0; i<lrcText.length; i++){   // 遍历寻找当前时间对应的歌词
            if(lrcText[i][0] == curTime){
                lrc = lrcText[i][1]
                idx = i
                break
            }
        }
        if(lrc){
            lineNum = idx + lrcTitle.length
            if(idx-5 > 0){    // 默认将第六行做为中间
                idx -= 5
            }else{
                idx=0
            }
            document.querySelector('.ul-lrc').scrollTop = 32*idx    // 一行的高度为32，歌词页向上滚动idx行，使得当前行正好居中
            var lineNodes = document.querySelectorAll('.li-lrc-sentence')
            lineNodes[lineNum].classList.add('li-lrc-curr')         // 显示当前行的特殊颜色
            if(curLrcLine){
                curLrcLine.classList.remove('li-lrc-curr')  // 其它行取消特殊颜色
            }
            curLrcLine = lineNodes[lineNum]
        }
    }else{   // 有些歌词不规范，没有时间信息，这里按比例自行滚动
        var timeAll = playEvent.getTimeAll()
        let idx = parseInt(curTime / timeAll * (lrcText.length + lrcTitle.length)) - 5
        document.querySelector('.ul-lrc').scrollTop = 32*idx
    }
}

function animationCtrl(state){
    // 控制动画是否播放： start： true 播放， false：暂停
    var rotateImg = document.querySelector('.rotate-img')
    var waves = document.querySelectorAll('.wave')
    if(!rotateImg) return  // lrcPage 未打开
    var ctrl = ''
    if(state) ctrl = 'running'
    else ctrl = 'paused'
    rotateImg.style['animation-play-state'] = ctrl
    waves.forEach( wave => {
        wave.style['animation-play-state'] = ctrl
    })
}

module.exports = {
    initLrcPage,
    freshContent,
    animationCtrl,
}


