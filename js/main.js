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


        // 屏幕宽高和像素比，支持高清渲染
        const info = wx.getSystemInfoSync()
        const pixelRatio = info.pixelRatio || 1
        this.screenWidth = info.windowWidth
        this.screenHeight = info.windowHeight
        this.canvas.width = this.screenWidth * pixelRatio
        this.canvas.height = this.screenHeight * pixelRatio
        // 如有 styleWidth/styleHeight 属性可设置（部分平台支持）
        if (this.canvas.style) {
            this.canvas.style.width = this.screenWidth + 'px'
            this.canvas.style.height = this.screenHeight + 'px'
        }
        this.ctx.scale(pixelRatio, pixelRatio)

        // 当前场景
        this.currentScene = null

        // 开放数据域（好友排行榜）
        try {
            this.openDataContext = wx.getOpenDataContext()
        } catch (e) {
            this.openDataContext = null
        }

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

        // 评价推荐按钮（悬浮在右侧）
        try {
            const fb = wx.createFeedbackButton({
                type: 'text',
                text: '评价',
                style: {
                    left: this.screenWidth - 64,
                    top: Math.round(this.screenHeight * 0.42),
                    width: 56,
                    height: 56,
                    lineHeight: 56,
                    backgroundColor: '#0f3460',
                    color: '#7ab8f0',
                    textAlign: 'center',
                    fontSize: 13,
                    borderRadius: 28,
                },
            })
            fb.show()
        } catch (e) { /* 环境不支持则静默跳过 */ }

        // 注册系统级分享（右上角菜单 → 发送给朋友）
        wx.onShareAppMessage(() => {
            const scene = this.currentScene
            if (scene && scene._buildShareContent) {
                const { title, desc } = scene._buildShareContent()
                return { title, desc }
            }
            return {
                title: '「逢7过」— 你的反应速度够快吗？快来挑战！',
                desc: '遇到含7或7的倍数就「过」，其他就「说」，简单？来试试！',
            }
        })

        // 注册分享到朋友圈
        wx.onShareTimeline(() => {
            const scene = this.currentScene
            if (scene && scene._buildShareContent) {
                const { title } = scene._buildShareContent()
                return { title, query: '' }
            }
            return {
                title: '「逢7过」— 反应游戏，你能坚持几关？',
                query: '',
            }
        })

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
