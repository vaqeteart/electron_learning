var sqlite3 = require('sqlite3')
var db = new sqlite3.Database('./user_data.db')

// 表名：'song_table'       // 保存喜欢的歌曲id: [id, time]
// 表名：'album_table'     // 保存收藏的歌单id: [id, time]

function init(){
    isTableCreated(function(created){
        if(created){
            return
        }else{
            createTable()
        }
    })
}


function createTable(){
    var sql_song = "CREATE TABLE song_table\
    (\
        song_id int,\
        time varchar\
    )"
    var sql_album = "CREATE TABLE album_table\
    (\
        album_id int,\
        time varchar\
    )"
    db.run(sql_song, function (err) {
        if(err){
            console.log('create song table error: ', err)
        }else{
            console.log('create song table success!')
        }
    })
    db.run(sql_album, function (err) {
        if(err){
            console.log('create album table error: ', err)
        }else{
            console.log('create album table success!')
        }
    })
}

function isTableCreated(callback){
    // 判断table有没有创建
    var sql = 'SELECT name FROM sqlite_master WHERE type="table" ORDER BY name'
    db.all(sql, function (err, result) {
        if(result.length>0){
            callback(true)
        }else{
            callback(false)
        }
    })
}

function insertSongId(songId){
    var sql = 'INSERT INTO song_table VALUES (?, ?)'
    db.run(sql, songId, Date.now(), function (err) {
        if(err){
            console.log('insert songid error: ', err)
        }else{
            console.log('insert songid success: ', songId)
        }
    })
}

function deleteSongId(songId){
    var sql = 'DELETE FROM song_table WHERE song_id = ?'
    db.run(sql, songId, function (err) {
        if(err){
            console.log('delete songid error: ', err, songId)
        }else{
            console.log('delete songid success!')
        }
    })
}

function insertAlbumId(albumId){
    var sql = 'INSERT INTO album_table VALUES (?, ?)'
    db.run(sql, albumId, Date.now(), function (err) {
        if(err){
            console.log('insert albumId error: ', err)
        }else{
            console.log('insert albumId success: ', albumId)
        }
    })
}

function deleteAlbumId(albumId){
    var sql = 'DELETE FROM album_table WHERE album_id = ?'
    db.run(sql, albumId, function (err) {
        if(err){
            console.log('delete albumId error: ', err, albumId)
        }else{
            console.log('delete albumId success!')
        }
    })
}

function getAllSongId(callback){
    var sql = 'SELECT * FROM song_table'
    db.all(sql, function(err, result){
        if(err){
            console.log('get all songid error: ', err)
        }else{
            callback(result)
        }
    })
}

function getAllAlbumId(callback){
    var sql = 'SELECT * FROM album_table'
    db.all(sql, function (err, result) {
        if(err){
            console.log('get all albumid error: ', err)
        }else{
            callback(result)
        }
    })
}

function showAllTables(){
    // 显示当前数据库中所有table
    var sql = 'SELECT name FROM sqlite_master WHERE type="table" ORDER BY name'
    db.all(sql, function (err, result) {
        if(err){
            console.log('show all tables error: ', err)
        }else{
            console.log('showtables: ', result)
        }
    })
}

function deleteAllTables(){
    // 清空当前数据库，将其中的表全部删除，在sqlite_master中找到表记录
    var sql = 'SELECT name FROM sqlite_master WHERE type="table" ORDER BY name'
    db.all(sql, function (err, result){
        if(err){
            console.log('delete all tables error: ', err)
        }else{
            result.forEach(item => {
                var sql1 = 'DROP TABLE ' + item.name
                // console.log(sql1)
                db.run(sql1, function (err) {
                    if(err){
                        console.log('delete table failed: ', item.name, err)
                    }
                })
            })
        }
    })
}

function clearTables(tbname){
    var sql = 'SELECT * FROM ' + tbname
    db.all(sql, function (err, result) {
        if(err){
            console.log('get all albumid error: ', err)
        }else{
            var sql1 = null
            if(tbname == 'song_table'){
                sql1 = 'DELETE FROM song_table WHERE song_id=?'
                result.forEach(item => {
                    db.run(sql1, item.song_id)
                })
            }else{
                sql1 = 'DELETE FROM album_table WHERE album_id=?'
                result.forEach(item => {
                    db.run(sql1, item.album_id)
                })
            }  
        }
    })
}

function close(){
    db.close(function(err){
        if(err){
            console.log('close sqlite error:', err)
        }else{
            console.log('close sqlite success!')
        }
    })
}

// test
// init()
// insertSongId(123456789)
// insertSongId(223456789)
// insertSongId(323456789)
// insertAlbumId(123456789)
// insertAlbumId(223456789)
// insertAlbumId(323456789)
// clearTables('song_table')
// clearTables('album_table')
// getAllSongId(function(songids){
//     console.log('all songids: ', songids)
// })
// getAllAlbumId(function(albumids){
//     console.log('all albumids: ', albumids)
// })
// deleteSongId(12344456)
// inquiry()
// showAllTables()
// deleteAllTables()
// close()

module.exports = {
    init,
    insertSongId,
    deleteSongId,
    getAllSongId,
    insertAlbumId,
    deleteAlbumId,
    getAllAlbumId,
    clearTables,
    deleteAllTables,
    close,
}



// electrong 中使用sqlite3会出现找不到模块的问题，这里需要重新进行构建
// 具体操作：
// npm install --save-dev electron-rebuild
// package.json下的scripts中添加："rebuild": "electron-rebuild -f -w sqlite3"
// npm run rebuild
// https://www.jianshu.com/p/677165ca1d45