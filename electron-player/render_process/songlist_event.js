var playApi = require('../script/play_api')
var songApi = require('../script/song_api')
var playApi = require('../script/play_api')
var util = require('../script/util')
var userData = require('../userdata/user_data')

var songIdList = []         // song id 
var songlistInfo = {}       // 当前歌单的具体信息: id: info, id: info, ...
var currLine = null         // 当前选中的行
var albumIdCurr = null      // 当前显示的歌单id


window.onresize = function () {   // 窗口自适应，当程序窗口大小变化时，随时调整列表的各列宽度
    // 列表头部窗口，为列表所有列重新设置宽度
    var head_width = window.getComputedStyle(document.querySelector('.songlist-head-frame')).getPropertyValue('width')
    var total_width = parseInt(head_width)
    document.querySelector('.songlist-head-title').style.width = (total_width-165)*0.38 + 'px'
    document.querySelector('.songlist-head-singer').style.width = (total_width-165)*0.255 + 'px'
    document.querySelector('.songlist-head-album').style.width = (total_width-165)*0.255 + 'px'
    document.querySelector('.songlist-head-time').style.width = (total_width)*0.11 + 'px'
    document.querySelectorAll('.songlist-line-table').forEach(element => {
        element.style.width = (total_width-110) + 'px'
    })
    document.querySelectorAll('.songlist-line-title').forEach(element => {
        element.style.width = (total_width-165)*0.38 + 'px'
    });
    document.querySelectorAll('.songlist-line-singer').forEach(element => {
        element.style.width = (total_width-165)*0.255 + 'px'
    })
    document.querySelectorAll('.songlist-line-album').forEach(element => {
        element.style.width = (total_width-165)*0.255 + 'px'
    })
    document.querySelectorAll('.songlist-line-time').forEach(element => {
        element.style.width = (total_width)*0.11 + 'px'
    })
}

function initAblumOpEvent(){
    // 初始歌单操作事件：全部播放，收藏，下载
    var playAll = document.querySelector('.play-all-btn')
    var collect = document.querySelector('.collect-album')
    var download = document.querySelector('.download-all')
    if(userData.isAlbumCollected(albumIdCurr) || albumIdCurr == -1){
        collect.classList.add('collected-album')
    }else{
        collect.classList.remove('collected-album')
    }
    playAll.onclick = function () {
        var songInfo = songlistInfo[songIdList[0]]
        var playEvent = require('./play_event')
        var navEvent = require('./nav_event')
        if(!songInfo) return
        playApi.PlayNew(songInfo.songLink)
        playEvent.startPlay(songInfo.time, songIdList[0])
        navEvent.updatePlayItem(songInfo.albumId, songInfo.songName, songInfo.artistName)
    }
    collect.onclick = function () {
        var nav_event = require('./nav_event')
        if(albumIdCurr == -1) return   //我喜欢的音乐不能取消
        if(this.classList.contains('collected-album')){
            userData.cancelCollect(albumIdCurr)
            nav_event.deleteAlbumItem(albumIdCurr)   // 取消收藏，导航栏删除相应的标签页
        }else{
            userData.collect(albumIdCurr)
            nav_event.addAlbumItem(albumIdCurr)     // 收藏，导航栏添加相应的标签页
        }
        this.classList.toggle('collected-album')
    }
    download.onclick = function () {   // 下载按钮
        util.showFunctionNotOpenDialog()
    }
}

// 给元素添加事件-歌曲行点击及鼠标悬浮等事件
function addSongClickEvent(element, songId){
    element.onclick = function () {  // 单击选中当前行
        element.classList.toggle('songlist-line-selected')
        if(currLine){
            currLine.classList.toggle('songlist-line-selected')
            currLine.classList.remove('songlist-line-hover')
        }
        currLine = element
    }
    element.onmouseover = function () {
        element.classList.add('songlist-line-hover')
    }
    element.onmouseout = function () {
        element.classList.remove('songlist-line-hover')
    }
    element.ondblclick = function () {   // 双击当前行播放歌曲
        var songId = parseInt(element.dataset.songid)
        var songInfo = songlistInfo[songId]
        playApi.PlayNew(songInfo.songLink)
        playEvent = require('./play_event')
        navEvent = require('./nav_event')
        playEvent.startPlay(songInfo.time, songId)
        navEvent.updatePlayItem(songInfo.albumId, songInfo.songName, songInfo.artistName)
    }

    // 红心操作
    var heart = element.querySelector('.songlist-line-heart')
    if(userData.isSongLoved(songId)){   // 初始化心的颜色，收藏的为红色
        heart.classList.add('songlist-line-hearted')
        heart.style.fill = '#fc0000'
    }else{
        heart.classList.remove('songlist-line-hearted')
        heart.style.fill = '#a1a1a1'
    }
    heart.onclick = function () {  // 点击红心收藏或取消收藏歌曲
        var songId = parseInt(this.parentNode.parentNode.dataset.songid) // 对应歌曲id
        if(this.classList.contains('songlist-line-hearted')){
            this.style.fill = '#bd0404'
            userData.dislike(songId)
        }else{
            this.style.fill = '#5f5f5f'
            userData.love(songId)
        }
        this.classList.toggle('songlist-line-hearted')
    }
    heart.onmouseover = function () {  // 鼠标停留显示对应颜色
        if(this.classList.contains('songlist-line-hearted')){
            this.style.fill = '#bd0404'
        }else{
            this.style.fill = '#5f5f5f'
        }
    }
    heart.onmouseout = function () {
        if(this.classList.contains('songlist-line-hearted')){
            this.style.fill = '#fc0000'
        }else{
            this.style.fill = '#a1a1a1'
        }
    }
}

function _initSonglistLine(songlist){
    var lines = document.querySelectorAll('.songlist-line')
    var songlistNode = document.querySelector('.song-list')
    var top = parseInt(window.getComputedStyle(lines[0]).getPropertyValue('top'))
    for(let sid of songIdList){    // 清空songlistInfo的数据
        delete songlistInfo[sid]
    }
    songIdList.splice(0, songIdList.length)  // 清空songIdList数据
    for(let i=1; i<=songlist.length; i++){
        songIdList.push(songlist[i-1])
        songApi.getSonglink(songlist[i-1], function (songInfo) {   // 利用id获取歌曲详细数据
            var curLine = null
            if(i<=lines.length){   // 当页面还有行节点时使用原节点
                curLine = lines[i-1]
                curLine.style.top = (top + (i-1)*30) + 'px'
            }else{
                curLine = lines[0].cloneNode(true)   // 页面中已有节点不够，添加新的节点
                curLine.style.top = (top + (i-1)*30) + 'px'
                songlistNode.appendChild(curLine)
            }
            if(i%2 == 0){
                curLine.classList.add('songlist-line-double')  // 隔行显示不同的颜色
            }else{
                curLine.classList.remove('songlist-line-double')
            }
            addSongClickEvent(curLine, songlist[i-1])  // 为当前行添加点击事件
            songlistInfo[songlist[i-1]] = songInfo    // 保存歌曲信息，防止重复调用api获取数据
            curLine.dataset.songid = songlist[i-1]
            curLine.querySelector('.songlist-line-num').innerHTML = (Array(2).join('0')+i).slice(-2)   // 将数据显示到具体位置
            curLine.querySelector('.songlist-line-title').innerHTML = songInfo.songName
            curLine.querySelector('.songlist-line-singer').innerHTML = songInfo.artistName
            curLine.querySelector('.songlist-line-album').innerHTML = songInfo.albumName
            curLine.querySelector('.songlist-line-time').innerHTML = util.strTime(songInfo.time)
        
            if(i>=songlist.length){
                for(let j=i+1; j<=lines.length; j++){   // 多余行节点删掉
                    songlistNode.removeChild(lines[j-1])
                }
            }
        })
    }

    if(!songlist){   // 歌单中没有歌曲数据时，显示默认信息
        for(let i=1; i<lines.length; i++){
            songlistNode.removeChild(lines[i])
        }
        lines[0].querySelector('.songlist-line-num').innerHTML = 1
        lines[0].querySelector('.songlist-line-title').innerHTML = '未知'
        lines[0].querySelector('.songlist-line-singer').innerHTML = '未知'
        lines[0].querySelector('.songlist-line-album').innerHTML = '未知'
        lines[0].querySelector('.songlist-line-time').innerHTML = '00:00'
    }
}

function freshSonglist(albumId){
    // 刷新歌单, albumId: 歌单id， id为-1表示我喜欢的音乐歌单
    if(albumId != -1){
        songApi.getSonglist(albumId, function(songlist){
            _initSonglistLine(songlist)
            showSongListInfo(albumId, songlist.length) //显示歌单的具体信息：图片，名称，创建者等
        })
    }else{
        freshLocalSonglist()
    }
}

function showSongListInfo(albumId, num){
    // 显示歌单信息: 图片，创建者，歌曲数，播放数等
    if(albumId){
        songApi.getSonglistInfo(albumId, function (info) {
            document.querySelector('.album-img').src = info.songlistImgUrl
            document.querySelector('.text-songlist-name').innerHTML = info.songlistTitle
            document.querySelector('.text-song-num').innerHTML = '歌曲数'+num   // 多页的时候不准确：info.songlistNum
            document.querySelector('.text-song-play-num').innerHTML = '播放数' + util.convertNumber(info.songlistPlayNum)
            document.querySelector('.creator-img').src = info.songlistUserImgUrl
            document.querySelector('.creator-name').innerHTML = info.songlistUserName
        })
    }else{
        document.querySelector('.album-img').src = './assets/album_default.png'
        document.querySelector('.text-songlist-name').innerHTML = '我喜欢的音乐'
        document.querySelector('.text-song-num').innerHTML = '歌曲数'+ '-'
        document.querySelector('.text-song-play-num').innerHTML = '播放数'+ '-'
        document.querySelector('.creator-img').src = './assets/creator_default.png'
        document.querySelector('.creator-name').innerHTML = '未知'
        var collect = document.querySelector('.collect-album')
        collect.classList.add('collected-album')  // 我喜欢的音乐默认收藏
    }
    // 刷新一下歌曲数显示
    var playEvent = require('./play_event')
    playEvent.updateSonglistNumber(num) 
}

function freshLocalSonglist(){
    // 刷新本地歌单-我喜欢的音乐，不需要显示歌单信息
    var songlist = userData.getAllSongId()
    _initSonglistLine(songlist)
    showSongListInfo()
}

function freshSonglistPage(albumId){
    albumIdCurr = albumId 
    freshSonglist(albumId)   // 刷新歌单
    initAblumOpEvent()       // 初始化歌单操作按键
}

function getCurrAlbumId(){
    return albumIdCurr
}

// 接口都默认使用albumid， 后期修改进入时传albumid
// freshSonglistPage(566176545)

module.exports = {
    songIdList,
    songlistInfo,
    freshSonglistPage,
    getCurrAlbumId,
}