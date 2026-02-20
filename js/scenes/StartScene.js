/**
 * 开始场景 — 难度选择
 *
 * 简单 / 中等 / 高级 / 疯狂  四种难度
 * 只有1命，答错或超时立即结束
 */

const DIFFICULTIES = [
    {
        key: 'easy',
        label: '简单',
        desc: '顺序数字  慢速',
        color: '#1a6b3a',
        textColor: '#88ffbb',
    },
    {
        key: 'normal',
        label: '中等',
        desc: '随机两~四位数',
        color: '#6b4a00',
        textColor: '#ffd080',
    },
    {
        key: 'hard',
        label: '高级',
        desc: '随机两~四位数  快速',
        color: '#6b1a1a',
        textColor: '#ffaaaa',
    },
    {
        key: 'crazy',
        label: '疯狂',
        desc: '随机大数字  含位数和规则',
        color: '#3a006b',
        textColor: '#cc99ff',
    },
]

export class StartScene {
    constructor(game) {
        this.game = game
        this._diffBtns = []
        this._rankBtn = null
        this._rankCloseBtn = null
        this._showRankModal = false
    }

    update() { /* 无需逐帧逻辑 */ }

    render(ctx) {
        const { screenWidth: w, screenHeight: h } = this.game

        // ── 背景 ──────────────────────────────────────────────
        ctx.fillStyle = '#1a1a2e'
        ctx.fillRect(0, 0, w, h)

        // 装饰圆
        ctx.beginPath()
        ctx.arc(w * 0.15, h * 0.08, w * 0.28, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(233,69,96,0.07)'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(w * 0.88, h * 0.88, w * 0.30, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(15,52,96,0.30)'
        ctx.fill()

        // ── 标题 ──────────────────────────────────────────────
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#e94560'
        ctx.font = `bold ${w * 0.16}px Arial`
        ctx.fillText('逢7过', w / 2, h * 0.13)

        // ── 规则卡片 ──────────────────────────────────────────
        const cardX = w * 0.05, cardW = w * 0.90
        const cardY = h * 0.22, cardH = h * 0.265
        ctx.fillStyle = '#0f1f3d'
        ctx.beginPath()
        ctx.roundRect(cardX, cardY, cardW, cardH, 14)
        ctx.fill()

        ctx.fillStyle = '#e94560'
        ctx.font = `bold ${w * 0.040}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText('游戏规则', w / 2, cardY + cardH * 0.13)

        // 规则条目
        const ruleItems = [
            { tag: '「过」', color: '#e94560', text: '数字包含 7 或是 7 的倍数' },
            { tag: '「说」', color: '#3a9ad9', text: '其他普通数字，正常报数' },
            { tag: '疯狂+', color: '#cc99ff', text: '各位数字之和含7或是7倍数也「过」' },
        ]
        ruleItems.forEach((item, i) => {
            const ry = cardY + cardH * (0.31 + i * 0.23)
            ctx.textAlign = 'left'
            ctx.font = `bold ${w * 0.042}px Arial`
            ctx.fillStyle = item.color
            ctx.fillText(item.tag, cardX + cardW * 0.04, ry)
            ctx.font = `${w * 0.033}px Arial`
            ctx.fillStyle = '#bbbbcc'
            ctx.fillText(item.text, cardX + cardW * 0.28, ry)
        })

        ctx.textAlign = 'center'
        ctx.fillStyle = '#444466'
        ctx.font = `${w * 0.029}px Arial`
        ctx.fillText('只有 1 命，答错或超时立即结束并显示原因', w / 2, cardY + cardH * 0.94)

        // ── 选择难度标题 ──────────────────────────────────────
        const labelY = cardY + cardH + h * 0.04
        ctx.fillStyle = '#888899'
        ctx.font = `${w * 0.036}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText('选择难度', w / 2, labelY)

        // ── 2×2 难度按钮 ──────────────────────────────────────
        const gap = w * 0.04
        const bw = (w - gap * 3) / 2
        const bh = h * 0.115
        const startY = labelY + h * 0.03

        this._diffBtns = []
        DIFFICULTIES.forEach((d, i) => {
            const col = i % 2         // 0 = left, 1 = right
            const row = Math.floor(i / 2)
            const bx = gap + col * (bw + gap)
            const by = startY + row * (bh + gap * 0.8)

            // 按钮背景
            ctx.fillStyle = d.color
            ctx.beginPath()
            ctx.roundRect(bx, by, bw, bh, 14)
            ctx.fill()

            // 难度名称
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#ffffff'
            ctx.font = `bold ${w * 0.072}px Arial`
            ctx.fillText(d.label, bx + bw / 2, by + bh * 0.38)

            // 描述
            ctx.fillStyle = d.textColor
            ctx.font = `${w * 0.029}px Arial`
            ctx.fillText(d.desc, bx + bw / 2, by + bh * 0.75)

            this._diffBtns.push({ key: d.key, x: bx, y: by, w: bw, h: bh })
        })

        // ―― 好友排行榜按途 ――――――――――――――――――――――――――――――――――
        const rankBtnY = startY + 2 * (bh + gap * 0.8) + h * 0.02
        const rankBtnH = h * 0.065
        const rankBtnX = w * 0.15
        const rankBtnW = w * 0.70
        ctx.fillStyle = '#0f3460'
        ctx.beginPath()
        ctx.roundRect(rankBtnX, rankBtnY, rankBtnW, rankBtnH, 12)
        ctx.fill()
        ctx.fillStyle = '#7ab8f0'
        ctx.font = `bold ${w * 0.040}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🏆 好友排行榜', w / 2, rankBtnY + rankBtnH / 2)
        this._rankBtn = { x: rankBtnX, y: rankBtnY, w: rankBtnW, h: rankBtnH }

        // 排行榜弹窗
        if (this._showRankModal) {
            this._renderRankModal(ctx, w, h)
        }
    }

    onTouchEnd(e) {
        const touch = e.changedTouches[0]
        const tx = touch.clientX, ty = touch.clientY
        const { w: sw, h: sh } = { w: this.game.screenWidth, h: this.game.screenHeight }

        // 弹窗关闭按途
        if (this._showRankModal && this._rankCloseBtn) {
            const cb = this._rankCloseBtn
            if (tx >= cb.x && tx <= cb.x + cb.w && ty >= cb.y && ty <= cb.y + cb.h) {
                this._showRankModal = false
                return
            }
            // 点击弹窗外面关闭
            const mw = sw * 0.90, mh = sh * 0.65
            const mx = (sw - mw) / 2, my = (sh - mh) / 2
            if (!(tx >= mx && tx <= mx + mw && ty >= my && ty <= my + mh)) {
                this._showRankModal = false
            }
            return
        }

        // 排行榜按途
        if (this._rankBtn) {
            const rb = this._rankBtn
            if (tx >= rb.x && tx <= rb.x + rb.w && ty >= rb.y && ty <= rb.y + rb.h) {
                this._showRankModal = true
                if (this.game.openDataContext) {
                    this.game.openDataContext.postMessage({
                        type: 'render',
                        width: sw,
                        height: Math.round(sh * 0.52),
                    })
                }
                return
            }
        }

        // 难度按途
        for (const btn of this._diffBtns) {
            if (tx >= btn.x && tx <= btn.x + btn.w && ty >= btn.y && ty <= btn.y + btn.h) {
                const { GameScene } = require('./GameScene')
                this.game.loadScene(new GameScene(this.game, btn.key))
                return
            }
        }
    }

    _renderRankModal(ctx, w, h) {
        const mw = w * 0.90
        const mh = h * 0.65
        const mx = (w - mw) / 2
        const my = (h - mh) / 2

        // 半透明遗挡层
        ctx.fillStyle = 'rgba(0,0,0,0.72)'
        ctx.fillRect(0, 0, w, h)

        // 弹窗背景
        ctx.fillStyle = '#1a1a3a'
        ctx.beginPath()
        ctx.roundRect(mx, my, mw, mh, 16)
        ctx.fill()

        // 弹窗标题
        ctx.fillStyle = '#e94560'
        ctx.font = `bold ${w * 0.048}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🏆 好友排行榜', w / 2, my + h * 0.048)

        // 开放数据域画布
        const rankY = my + h * 0.09
        const rankH = mh - h * 0.13
        const rankW = mw
        if (this.game.openDataContext) {
            try {
                ctx.drawImage(this.game.openDataContext.canvas, mx, rankY, rankW, rankH)
            } catch (e) {
                ctx.fillStyle = '#444466'
                ctx.font = `${w * 0.032}px Arial`
                ctx.fillText('提示：关系链功能需在真机上运行', w / 2, rankY + rankH / 2)
            }
        } else {
            ctx.fillStyle = '#444466'
            ctx.font = `${w * 0.032}px Arial`
            ctx.fillText('关系链功能不可用', w / 2, rankY + rankH / 2)
        }

        // 关闭按途
        const cbW = w * 0.32, cbH = h * 0.052
        const cbX = (w - cbW) / 2
        const cbY = my + mh - cbH - h * 0.015
        ctx.fillStyle = '#2a2a4a'
        ctx.beginPath()
        ctx.roundRect(cbX, cbY, cbW, cbH, 10)
        ctx.fill()
        ctx.fillStyle = '#888899'
        ctx.font = `${w * 0.036}px Arial`
        ctx.fillText('关闭', w / 2, cbY + cbH / 2)
        this._rankCloseBtn = { x: cbX, y: cbY, w: cbW, h: cbH }
    }
}
