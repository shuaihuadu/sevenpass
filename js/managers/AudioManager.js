/**
 * 音频管理器
 * 统一管理背景音乐和音效
 */

class AudioManager {
    constructor() {
        this.bgmAudio = null
        this.sfxPool = {}
        this.bgmEnabled = true
        this.sfxEnabled = true
    }

    /**
     * 播放背景音乐
     * @param {string} src 音频路径
     * @param {boolean} loop 是否循环
     */
    playBGM(src, loop = true) {
        if (!this.bgmEnabled) return
        if (this.bgmAudio) {
            this.bgmAudio.stop()
        }
        this.bgmAudio = wx.createInnerAudioContext()
        this.bgmAudio.src = src
        this.bgmAudio.loop = loop
        this.bgmAudio.volume = 0.5
        this.bgmAudio.play()
    }

    /**
     * 停止背景音乐
     */
    stopBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.stop()
        }
    }

    /**
     * 播放音效
     * @param {string} src 音频路径
     */
    playSFX(src) {
        if (!this.sfxEnabled) return
        const audio = wx.createInnerAudioContext()
        audio.src = src
        audio.volume = 0.8
        audio.play()
        audio.onEnded(() => {
            audio.destroy()
        })
    }

    /**
     * 切换背景音乐开关
     */
    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled
        if (!this.bgmEnabled) {
            this.stopBGM()
        }
        return this.bgmEnabled
    }

    /**
     * 切换音效开关
     */
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled
        return this.sfxEnabled
    }
}

export default new AudioManager()
