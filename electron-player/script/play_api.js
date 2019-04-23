
// 全局唯一播放器
const Player = new Audio()  

function PlayNew(url){
    // URL：网络资源路径或本地路径
    if(!url) return
    Player.src = url
    Player.load()   // 重新加载数据
    Player.play()
}

function Play(){
    // 继续播放
    Player.play()
}

function Pause(){
    // 暂停
    Player.pause()
}

function PlayToTime(t){
    // 跳转到时间t进行播放
    if(t <= 0 || t >= Player.duration){
        return
    }
    Player.currentTime = t
    Player.play()
}

function SetVolume(v){
    // 设置音量
    if(v < 0 || v > 1){
        return
    }
    Player.volume = v
}

function setMute(state){
    // 静音开关
    Player.muted = state
}

function isPaused(){
    return Player.paused
}

module.exports = {
    PlayNew,
    Play,
    Pause,
    PlayToTime,
    SetVolume,
    setMute,
    isPaused,
}