// 根据歌单数添加各个显示框，注意定位，上限限30个，添加点击事件；

var songApi = require('../script/song_api')
var songlistEvent = require('./songlist_event')
var importM = require('./import')
var util = require('../script/util')


function showSonglistItemInfo(albumId, item){
    // 显示一个歌单项的数据，通过api获取数据刷新
    songApi.getSonglistInfo(albumId, function (info) {
        item.querySelector('.songlist-overview-item-img').src = info.songlistImgUrl
        item.querySelector('.songlist-overview-item-title').innerHTML = info.songlistTitle
        item.querySelector('.songlist-overview-item-playnum-text').innerHTML = util.convertNumber(info.songlistPlayNum)
        item.querySelector('.songlist-overview-item-username').innerHTML = info.songlistUserName
    })
}

function clickEvent(albumId){
    // 歌单点击事件，进入歌单详情页面
    var section = document.getElementById('songlist-overview-section')
    if(!section) return
    importM.songlistOverviewPage = document.querySelector('.main-frame').removeChild(section) // 移除歌单页节点
    document.querySelector('.main-frame').appendChild(importM.songlistPage)  // 添加歌单详情节点
    songlistEvent.freshSonglistPage(albumId)   // 刷新歌单
    var navEvent = require('./nav_event')
    navEvent.removeAllSelected()  // 清空选中状态
}

function showSonglistOverview(){
    songApi.getHotAlbumId(function(albumIdAll){   // 通过api获取热门歌单id
        var albumItems = document.querySelectorAll('.songlist-overview-item')
        var overViewNode = document.querySelector('.songlist-overview-itemframe')
        var idx = -1
        albumIdAll.forEach(albumId => {  // 为获取的每一个歌单id提供一个节点项来显示
            let currItem = null
            idx += 1
            if(idx < albumItems.length){
                currItem = albumItems[idx]
            }else{
                currItem = albumItems[0].cloneNode(true)
                currItem.style.left = (idx%4)*190 + 'px'
                currItem.style.top = parseInt(idx/4)*250 + 'px'
            }
            overViewNode.appendChild(currItem)
            showSonglistItemInfo(albumId, currItem)
            currItem.addEventListener('click', function(){
                clickEvent(albumId)   // 为歌单项添加事件
            })

            if(idx>albumIdAll.length){
                for(let i=idx; i<=albumItems.length; i++){   // 多余行节点删掉
                    overViewNode.removeChild(albumItems[i-1])
                }
            }
        })
    })
}

function initTitleEvent(){
    // 歌单页的标题都添加暂未实现弹窗
    var tiltes = document.querySelectorAll('.songlist-overview-title')
    tiltes.forEach( title => {
        title.onclick = function () {
            util.showFunctionNotOpenDialog()
        }
    })
}

initTitleEvent()
showSonglistOverview()   //程序启动就执行优先显示


module.exports = {
    showSonglistOverview, 
}

