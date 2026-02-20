/**
 * 游戏主入口
 * SevenPass - 七关小游戏
 */

import { StartScene } from './scenes/StartScene'

class Main {
    constructor() {
        // 获取画布
        this.canvas = wx.createCanvas()
        this.ctx = this.canvas.getContext('2d')

        // 微信小游戏 Canvas 的 roundRect 不接受纯数字半径，强制覆盖为兼容实现
        this.ctx.roundRect = function (x, y, w, h, radii) {
            const r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? radii[0] : 0)
            const safeR = Math.min(r, w / 2, h / 2)
            this.moveTo(x + safeR, y)
            this.lineTo(x + w - safeR, y)
            this.arcTo(x + w, y, x + w, y + safeR, safeR)
            this.lineTo(x + w, y + h - safeR)
            this.arcTo(x + w, y + h, x + w - safeR, y + h, safeR)
            this.lineTo(x + safeR, y + h)
            this.arcTo(x, y + h, x, y + h - safeR, safeR)
            this.lineTo(x, y + safeR)
            this.arcTo(x, y, x + safeR, y, safeR)
            this.closePath()
            return this
        }

        // 屏幕宽高
        const info = wx.getSystemInfoSync()
        this.screenWidth = info.windowWidth
        this.screenHeight = info.windowHeight

        this.canvas.width = this.screenWidth
        this.canvas.height = this.screenHeight

        // 当前场景
        this.currentScene = null

        // 启动游戏
        this.init()
    }

    init() {
        // 绑定触摸事件
        wx.onTouchStart(e => {
            if (this.currentScene && this.currentScene.onTouchStart) {
                this.currentScene.onTouchStart(e)
            }
        })

        wx.onTouchMove(e => {
            if (this.currentScene && this.currentScene.onTouchMove) {
                this.currentScene.onTouchMove(e)
            }
        })

        wx.onTouchEnd(e => {
            if (this.currentScene && this.currentScene.onTouchEnd) {
                this.currentScene.onTouchEnd(e)
            }
        })

        // 加载开始场景
        this.loadScene(new StartScene(this))

        // 启动游戏循环
        this.loop()
    }

    /**
     * 切换场景
     * @param {object} scene
     */
    loadScene(scene) {
        this.currentScene = scene
    }

    /**
     * 游戏主循环
     */
    loop() {
        requestAnimationFrame(() => this.loop())

        const ctx = this.ctx

        // 清空画布
        ctx.clearRect(0, 0, this.screenWidth, this.screenHeight)

        // 渲染当前场景
        if (this.currentScene) {
            this.currentScene.update()
            this.currentScene.render(ctx)
        }
    }
}

export default new Main()
