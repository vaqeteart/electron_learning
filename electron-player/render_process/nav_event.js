
var userData = require('../userdata/user_data')
var songApi = require('../script/song_api')
var songlistEvent = require('./songlist_event')
var importM = require('./import')
var util = require('../script/util')

var titleLength = 10    // 歌单显示的最大字符长度，当太长时隐藏不显示

function initNavBar(){
    var items = document.querySelectorAll('.nav-item')  // 获取所有标签页
    items.forEach(item => {
        item.onclick = navItemOnClick    // 为每一个标签页添加点击事件
    })
    var collectAlbum = userData.getAllAlbumId()   // 从用户数据中获取收藏歌单
    collectAlbum.forEach(albumId => {
        addAlbumItem(albumId)       // 将收藏歌单添加到导航栏
    })

    // 播放状态item事件
    var playItem = document.querySelector('.nav-play-item')
    playItem.addEventListener('click', function () {
        var importM = require('./import')
        var lrcEvent = require('./songlrc_event')
        document.body.appendChild(importM.songlrcPage)   // 添加歌词页面到程序
        lrcEvent.initLrcPage()   // 初始化歌词页面
    })
}

function navItemOnClick(){
    removeAllSelected()   // 移除所有选项的选中状态
    this.classList.add('is-selected')  // 当前选中
    if(this.id == 'find-music'){  // 显示热门歌单页
        var songlistOverview = require('./songlist_overview_event')
        var songPage = document.getElementById('songlist-section')
        if(songPage){
            importM.songlistPage = document.querySelector('.main-frame').removeChild(songPage)  // 依次歌单详细信息页
        }
        document.querySelector('.main-frame').appendChild(importM.songlistOverviewPage)
        songlistOverview.showSonglistOverview()    // 显示热门歌单页
    }else if(this.id == 'local-music'){
        util.showFunctionNotOpenDialog()  // 功能暂未实现
        removeAllSelected()
    }else{
        var page = document.getElementById('songlist-overview-section')
        if(page){ // 显示歌单列表详情
            importM.songlistOverviewPage = document.querySelector('.main-frame').removeChild(page)
            document.querySelector('.main-frame').appendChild(importM.songlistPage)
        }
        if(this.id == 'my-love-music'){  // 刷新歌单信息
            songlistEvent.freshSonglistPage(-1)   // 默认歌单id: -1
        }else{
            songlistEvent.freshSonglistPage(parseInt(this.id))
        }
    }
}

function removeAllSelected(){
    // 移除所有按钮的选中状态
    var items = document.querySelectorAll('.nav-item')
    items.forEach( (item, idx, array) => {
        item.classList.remove('is-selected')
    })
}

function updatePlayItem(albumId, name, singer){
    // 刷新播放信息
    var songApi = require('../script/song_api')
    songApi.getAlbumImg(albumId, (url)=>{
        document.querySelector('.nav-play-item-img').src = url
    })
    document.querySelector('.nav-paly-songname').innerHTML = name
    document.querySelector('.nav-paly-singer').innerHTML = singer
}

function addAlbumItem(albumId){
    // 向导航栏添加一个标签页
    if(!albumId) return
    
    var albumItem = document.getElementById('my-love-music')
    songApi.getSonglistInfo(albumId, function (info) {
        let item = albumItem.cloneNode(true)   // 复制一个标签节点
        item.id = String(albumId)  // 给节点id赋值为对应的歌单id，用于点击时获取
        item.querySelector('.nav-item-text').innerHTML = info.songlistTitle.slice(0, titleLength) + '...'
        document.getElementById('album-list').appendChild(item)
        item.onclick = navItemOnClick
    })
}

function deleteAlbumItem(albumId){
    // 从导航栏删除一个标签页
    var item = document.getElementById(String(albumId))
    document.getElementById('album-list').removeChild(item)
}

setTimeout(initNavBar, 1500)   // 延迟刷新，等待数据库数据读取完毕

module.exports = {
    removeAllSelected, 
    updatePlayItem,
    deleteAlbumItem,
    addAlbumItem,
}


