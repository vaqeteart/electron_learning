var links = document.querySelectorAll('link[rel="import"]')   // 获取index.html中的所有import文档
 
// Import and add each page to the DOM
var songlistPage = null
var songlistOverviewPage = null
var songlrcPage = null

Array.prototype.forEach.call(links, (link) => {
    let template = link.import.querySelector('template')  // 获取文档模板对象
    let clone = document.importNode(template.content, true)  // 模板对象的content属性表示其文档内容，获取副本
    if (link.href.match('nav.html')){
        document.querySelector('.left-frame').appendChild(clone) // 导航栏添加到index.html中的left-frame中
    } else if(link.href.match('songlist.html')){
        songlistPage = clone
    } else if(link.href.match('songlist_overview.html')){
        document.querySelector('.main-frame').appendChild(clone)  // 程序最开始显示歌单页
        songlistOverviewPage = clone
    }  else if(link.href.match('songlrc.html')){   // 歌词页，暂存
        songlrcPage = clone
    }
})


module.exports = {
    songlistPage,
    songlistOverviewPage,
    songlrcPage
}