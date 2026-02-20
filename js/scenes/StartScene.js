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
    }

    onTouchEnd(e) {
        const touch = e.changedTouches[0]
        const tx = touch.clientX, ty = touch.clientY
        for (const btn of this._diffBtns) {
            if (tx >= btn.x && tx <= btn.x + btn.w && ty >= btn.y && ty <= btn.y + btn.h) {
                const { GameScene } = require('./GameScene')
                this.game.loadScene(new GameScene(this.game, btn.key))
                return
            }
        }
    }
}
