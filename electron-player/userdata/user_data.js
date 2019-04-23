var dbdata = require('./db_api')
var LoveSongIds = []
var CollectAlbums = []

function initUserData(){
    dbdata.init()  // 初始化数据库
    dbdata.getAllSongId(function(songIds){    // 获取所有歌曲id并保存
        songIds.forEach(element => {
            LoveSongIds.push(element.song_id)
        });
    })

    dbdata.getAllAlbumId(function(albumIds){
        albumIds.forEach(element => {     // 获取所有歌单id并保存
            CollectAlbums.push(element.album_id)
        })
    })
}


function love(songId){  // 添加歌曲收藏
    if(LoveSongIds.indexOf(songId) == -1){   
        LoveSongIds.push(songId)
        dbdata.insertSongId(songId)
    }
}

function dislike(songId){   // 取消歌曲收藏
    var idx = LoveSongIds.indexOf(songId)
    if(idx != -1){
        LoveSongIds.splice(idx, 1)
        dbdata.deleteSongId(songId)
    }
}

function collect(albumId){   // 添加歌单收藏
    if(CollectAlbums.indexOf(albumId) == -1){
        CollectAlbums.push(albumId)
        dbdata.insertAlbumId(albumId)
    }
}

function cancelCollect(albumId){   // 取消歌单收藏
    var idx = CollectAlbums.indexOf(albumId)
    if(idx != -1){
        CollectAlbums.splice(idx, 1)
        dbdata.deleteAlbumId(albumId)
    }
}

function isSongLoved(songId){   // 判断歌曲id是否被收藏
    var idx = LoveSongIds.indexOf(songId)
    return idx != -1
}

function isAlbumCollected(albumId){  // 判读歌单id是否被收藏
    var idx = CollectAlbums.indexOf(albumId)
    return idx != -1
}

function getAllSongId(){
    return LoveSongIds
}

function getAllAlbumId(){
    return CollectAlbums
}

initUserData()   // 启动时读取数据

module.exports = {
    getAllSongId,
    getAllAlbumId,
    love,
    dislike,
    collect,
    cancelCollect,
    initUserData,
    isSongLoved,
    isAlbumCollected
}