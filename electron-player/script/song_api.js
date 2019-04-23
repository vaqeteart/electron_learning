// 本API只针对网站http://music.taihe.com/

var request = require('request')
var fs = require('fs')


function getRequestOptions(requestUrl){
    // 获取请求头
    var options = {
        url: requestUrl,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36'
        }
    }
    return options
}

function getSonglistInfo(songlistId, callback){
    // 获取歌单信息：图片，名称，创建者，创建时间，歌曲数
    if(!songlistId) songlistId = 566176545
    var url = 'http://music.taihe.com/songlist/' + songlistId    // 完整URL
    var options = getRequestOptions(url)  // 请求头
    // request(options).pipe(fs.createWriteStream('./script/songlist_tmp.html'))    // 获取数据保存在本地
    // var data = fs.readFileSync('songlist_tmp.html', 'utf-8')
    request(options, function(err, response, body){
        var data = body
        var songlistImgUrl = data.match(/songlist-info-pic[\d\D]+?<img src="(.+?)"/)[1]
        var songlistTitle = data.match(/songlist-info-songlisttitle[\d\D]+?>(.+?)</)[1]
        var songlistUserName = data.match(/songlist-info-user[\d\D]+?nickname=(.+?)"/)[1]
        var songlistUserImgUrl = data.match(/songlist-info-user[\d\D]+?<img src="(.+?)"/)[1]
        var songlistNum = data.match(/songlist-num[\d\D]+?(\d+?)首/)[1]
        var songlistPlayNum = data.match(/songlist-listen[\d\D]+?(\d+?)次播放/)[1]
        var songlistInfo = {
            songlistImgUrl: songlistImgUrl,
            songlistTitle: songlistTitle,
            songlistUserName: songlistUserName,
            songlistUserImgUrl: songlistUserImgUrl,
            songlistNum: songlistNum,
            songlistPlayNum: songlistPlayNum
        }
        callback(songlistInfo)
    })
}

function getSonglist(songlistId, callback){
    // 获取歌单中所有的歌曲id, callback(data) => data: [songid1, songid2, songid3,...]
    if(!songlistId) songlistId = 566176545
    var url = 'http://music.taihe.com/songlist/'+ songlistId
    var options = getRequestOptions(url)
    request(options, function(err, reponse, body){
        if (err){
            return
        }
        // fs.writeFile('songlist_ttt.html', body, function (params) {
        //     console.log('finish')
        // })
        var result = []
        var match = body.match(/<a href="\/song\/[0-9]+?"/g)
        match.forEach(element => {
            var re = element.match(/([0-9]{4,})/)[1]
            if(re){
                result.push(parseInt(re))
            }
        })
        callback(result)
    })
}

function getSonglink(songId, callback){
    // callback(data)   http://music.taihe.com/
    // data 数据形式:
    /*{ 
        queryId: '865218',
        status: 0,
        songId: 865218,
        songName: '天空之城',
        artistId: '1731',
        artistName: '李志',
        albumId: 112147,
        albumName: '我爱南京',
        lrcLink:
        'http://qukufile2.qianqian.com/data2/lrc/fbd17fc0f73f7e43b6565c0a1e5aa85e/607350896/607350896.lrc',
        time: 223,
        linkCode: 22000,
        songLink:
        'http://zhangmenshiting.qianqian.com/data2/music/cafe2bacf97dea7df09c77155f7dd331/607350881/607350881.mp3?xcode=a28ec0edac5cf0cfe4d6351b3c1b445d',
        showLink:
        'http://zhangmenshiting.qianqian.com/data2/music/cafe2bacf97dea7df09c77155f7dd331/607350881/607350881.mp3?xcode=a28ec0edac5cf0cfe4d6351b3c1b445d',
        format: 'mp3',
        rate: 128,
        size: 3570463,
        linkinfo: null,
        version: '',
        copyType: 0,
        enhancement: '0.680000' }*/
    //通过歌曲id请求相应的mp3url等信息(千千静听)
    // songId = 865218
    url = 'http://play.taihe.com/data/music/songlink'   //歌曲请求网址
    form_data = {
        form:{
            'songIds': songId,
            'hq': 0,
            'type': 'm4a,mp3',
            'rate': '',
            'pt': 0,
            'flag': -1,
            's2p': -1,
            'prerate': -1,
            'bwt': -1,
            'dur': -1,
            'bat': -1,
            'bp': -1,
            'pos': -1,
            'auto': -1,
        }
    }
    req = request.post(url, form_data, function (err, response, body) {
        var songInfo = body.match(/{"queryId":.+?}/)[0]
        var data = JSON.parse(songInfo)
        callback(data)
    })
}

function getSongRes(url, name){
    // 获取歌曲资源(lrc, mp3),传入文件url，将内容保存到本地路径
    // var url = 'http://zhangmenshiting.qianqian.com/data2/music/fc562f5263bbbe4e0b8aa62ce468a5ff/607347147/607347147.mp3?xcode=a52c040b9e0a2b8f3d7cab37c0a62272'
    request(url).pipe(fs.createWriteStream(name))
}

function downloadSong(songId){
    // 提供歌曲id下载该歌曲，http://music.taihe.com/
    getSonglink(songId, function (data) {
        var url = data.songLink
        getSongRes(url, data.songName+'.mp3')
    })
}

function getSongLrc(lrcUrl, callback){
    // lrcUrl = 'http://qukufile2.qianqian.com/data2/lrc/fbd17fc0f73f7e43b6565c0a1e5aa85e/607350896/607350896.lrc'
    var options = getRequestOptions(lrcUrl)
    request(options, function (err, response, body) {
        callback(body)
    })
}

function getAlbumImg(albumId, callback){
    // 获取歌单图片链接, callback(imgUrl)
    if(!albumId) albumId = 607340402
    var url = 'http://music.taihe.com/album/' + albumId
    var options = getRequestOptions(url)
    // request(options).pipe(fs.createWriteStream('album.html'))
    request(options, function (err, response, body) {
        var pattern =new RegExp("<img src=\"http:.+?\""); 
        var result = body.match(/<img src="(http:.+?)"/)
        callback(result[1])
    })
}

function getHotAlbumId(callback){
    // 获取http://music.taihe.com/songlist下最热的歌单id
    var url = 'http://music.taihe.com/songlist'
    var options = getRequestOptions(url)
    request(options, function(err, response, body){
        var data = body
        var albumIds = []
        var result = data.match(/href="\/songlist\/([0-9]+?)" title/g)
        result.forEach(element =>{
            re = element.match(/([0-9]+)/)
            albumIds.push(parseInt(re[1]))
        })
        callback(albumIds)
    })
    // request(options).pipe(fs.createWriteStream('songlist_hot.html'))
    // var data = fs.readFileSync('./script/songlist_hot.html', 'utf-8')
    // var albumIds = []
    // var result = data.match(/href="\/songlist\/([0-9]+?)" title/g)
    // result.forEach(element =>{
    //     re = element.match(/([0-9]+)/)
    //     albumIds.push(parseInt(re[1]))
    // })
    // callback(albumIds)
}

module.exports = {
    getSonglist,
    getSonglink,
    getSongRes,
    downloadSong,
    getAlbumImg,
    getSonglistInfo,
    getHotAlbumId,
    getSongLrc, 
}


// getSonglistInfo(null, function(data){
//     console.log(data)
// })

