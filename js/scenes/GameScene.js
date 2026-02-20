/**
 * 游戏主场景 - 逢7过
 *
 * 简单：顺序数字，标准规则
 * 中等：随机两~四位数，标准规则
 * 高级：随机两~四位数，快速，标准规则
 * 疯狂：随机两位数起无上限，标准规则 + 各位数字和规则，一命制
 *
 * 所有难度：只有1命，答错或超时立即游戏结束，显示失败原因
 */

import { isSevenNumber, isDigitSumSeven, digitSum, saveData, loadData } from '../utils/index'

const FEEDBACK_DURATION = 700  // 正确反馈停留时间 ms
const FAIL_PAUSE = 1500         // 失败反馈停留时间 ms（让玩家看清数字）

// 难度配置
const DIFFICULTY_CONFIG = {
    easy: {
        label: '简单', key: 'easy',
        sequential: true,
        minNum: 1, maxNum: null,
        baseInterval: 2200, minInterval: 1000,
        seqPerLevel: 20,
    },
    normal: {
        label: '中等', key: 'normal',
        sequential: false,
        minNum: 10, maxNum: 9999,
        baseInterval: 1800, minInterval: 700,
        countPerLevel: 12,
    },
    hard: {
        label: '高级', key: 'hard',
        sequential: false,
        minNum: 10, maxNum: 9999,
        baseInterval: 1200, minInterval: 400,
        countPerLevel: 15,
    },
    crazy: {
        label: '疯狂', key: 'crazy',
        sequential: false,
        minNum: 10, maxNum: null,
        baseInterval: 1000, minInterval: 350,
        countPerLevel: 15,
    },
}

/**
 * 根据难度和关卡生成本关的数字列表及限时
 */
function buildLevel(level, difficulty) {
    const cfg = DIFFICULTY_CONFIG[difficulty]
    const interval = Math.max(cfg.minInterval, cfg.baseInterval - (level - 1) * 80)

    let queue
    if (cfg.sequential) {
        const start = 1 + (level - 1) * cfg.seqPerLevel
        const count = cfg.seqPerLevel + Math.floor((level - 1) * 2)
        queue = Array.from({ length: count }, (_, i) => start + i)
    } else {
        const count = cfg.countPerLevel + Math.floor((level - 1) * 2)
        let maxNum = cfg.maxNum
        if (!maxNum) {
            maxNum = Math.min(Math.pow(10, 2 + Math.floor(level / 2)), 99999999)
        }
        queue = Array.from({ length: count }, () =>
            Math.floor(Math.random() * (maxNum - cfg.minNum + 1)) + cfg.minNum
        )
    }

    return { queue, interval }
}

/**
 * 判断该数字是否应该点「过」
 */
function checkShouldPass(n, difficulty) {
    if (isSevenNumber(n)) return true
    if (difficulty === 'crazy' && isDigitSumSeven(n)) return true
    return false
}

/**
 * 生成失败原因文字行数组
 */
function buildFailLines(n, type, difficulty) {
    const pass = checkShouldPass(n, difficulty)
    const correct = pass ? '「过」' : '「说」'
    const wrong = pass ? '「说」' : '「过」'

    const lines = []
    if (type === 'timeout') {
        lines.push('⏱  超时未作答！')
        lines.push(`${n} 应该点 ${correct}`)
    } else {
        lines.push(`你点了 ${wrong}，${n} 应该点 ${correct}`)
    }

    if (pass) {
        if (String(n).includes('7')) lines.push(`✦ 数字中含有 7`)
        if (n % 7 === 0) lines.push(`✦ ${n} ÷ 7 = ${n / 7}，是 7 的倍数`)
        if (difficulty === 'crazy' && !isSevenNumber(n)) {
            const ds = digitSum(n)
            if (String(ds).includes('7')) lines.push(`✦ 各位数字和 ${ds}，含有 7`)
            if (ds % 7 === 0) lines.push(`✦ 各位数字和 ${ds} ÷ 7 = ${ds / 7}，是 7 的倍数`)
        }
    } else {
        lines.push('✦ 是普通数字，既不含 7，也不是 7 的倍数')
        if (difficulty === 'crazy') {
            const ds = digitSum(n)
            lines.push(`✦ 各位数字和 ${ds}，也不满足逢7条件`)
        }
    }

    return lines
}

export class GameScene {
    constructor(game, difficulty = 'normal') {
        this.game = game
        this.difficulty = difficulty
        // state: 'playing' | 'feedbackOK' | 'feedbackFail' | 'levelComplete' | 'gameOver'
        this.state = 'playing'
        this.currentLevel = 1
        this.totalScore = 0
        this.feedbackTimer = 0
        this.isNewBest = false
        this.lastTime = Date.now()
        this._sayBtn = null
        this._passBtn = null
        this._shareBtn = null
        this._homeBtn = null
        this.failLines = []
        this.failNumber = 0
        this.initLevel(1)
    }

    initLevel(level) {
        const { queue, interval } = buildLevel(level, this.difficulty)
        this.queue = queue
        this.queueIndex = 0
        this.interval = interval
        this.elapsed = 0
        this.answered = false
        this.levelScore = 0
        this.state = 'playing'
        this.failLines = []
    }

    get currentNumber() {
        return this.queue[this.queueIndex]
    }

    answer(passChoice) {
        if (this.state !== 'playing' || this.answered) return
        this.answered = true
        const pass = checkShouldPass(this.currentNumber, this.difficulty)
        if (passChoice === pass) {
            this.levelScore += 10
            this.totalScore += 10
            this.feedbackTimer = FEEDBACK_DURATION
            this.state = 'feedbackOK'
        } else {
            this._triggerFail('wrong')
        }
    }

    _triggerFail(type) {
        this.failNumber = this.currentNumber
        this.failLines = buildFailLines(this.currentNumber, type, this.difficulty)
        this.feedbackTimer = FAIL_PAUSE
        this.state = 'feedbackFail'
    }

    _nextNumber() {
        this.queueIndex++
        this.elapsed = 0
        this.answered = false
        if (this.queueIndex >= this.queue.length) {
            this.state = 'levelComplete'
        } else {
            this.state = 'playing'
        }
    }

    _doGameOver() {
        const key = 'best_' + DIFFICULTY_CONFIG[this.difficulty].key
        const best = loadData(key, 0)
        this.isNewBest = this.totalScore > best
        if (this.isNewBest) saveData(key, this.totalScore)
        // 提交分数到开放数据域（排行榜）
        if (this.game.openDataContext) {
            this.game.openDataContext.postMessage({ type: 'setScore', score: this.totalScore })
        }
        this.state = 'gameOver'
    }

    update() {
        const now = Date.now()
        const dt = now - this.lastTime
        this.lastTime = now

        if (this.state === 'feedbackOK') {
            this.feedbackTimer -= dt
            if (this.feedbackTimer <= 0) this._nextNumber()
            return
        }
        if (this.state === 'feedbackFail') {
            this.feedbackTimer -= dt
            if (this.feedbackTimer <= 0) this._doGameOver()
            return
        }
        if (this.state !== 'playing') return

        this.elapsed += dt
        if (this.elapsed >= this.interval && !this.answered) {
            this._triggerFail('timeout')
        }
    }

    render(ctx) {
        const { screenWidth: w, screenHeight: h } = this.game
        const cfg = DIFFICULTY_CONFIG[this.difficulty]

        // ── 背景 ─────────────────────────────────────────────
        let bg = '#1a1a2e'
        if (this.state === 'feedbackOK') bg = '#0d2e1a'
        else if (this.state === 'feedbackFail') bg = '#2e0a0a'
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, w, h)

        // ── 顶部栏 ────────────────────────────────────────────
        ctx.fillStyle = '#0f3460'
        ctx.fillRect(0, 0, w, 56)

        ctx.fillStyle = '#e94560'
        ctx.font = `bold ${w * 0.036}px Arial`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(`第${this.currentLevel}关  [${cfg.label}]`, 14, 28)

        ctx.textAlign = 'right'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(`${this.totalScore}分`, w - 14, 28)

        // 1命制单颗爱心
        ctx.font = `${w * 0.055}px Arial`
        ctx.textAlign = 'center'
        const alive = this.state !== 'gameOver' && this.state !== 'feedbackFail'
        ctx.fillStyle = alive ? '#e94560' : '#3a3a5a'
        ctx.fillText('♥', w / 2, 28)

        // ── 倒计时条 ──────────────────────────────────────────
        ctx.fillStyle = '#0a1a30'
        ctx.fillRect(0, 56, w, 7)
        if (this.state === 'playing') {
            const pct = Math.max(0, 1 - this.elapsed / this.interval)
            ctx.fillStyle = pct > 0.5 ? '#27ae60' : pct > 0.25 ? '#f39c12' : '#e74c3c'
            ctx.fillRect(0, 56, w * pct, 7)
        }

        // ── 进度 ──────────────────────────────────────────────
        ctx.fillStyle = '#555577'
        ctx.font = `${w * 0.030}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const idx = Math.min(this.queueIndex, this.queue.length - 1)
        ctx.fillText(`${idx} / ${this.queue.length}`, w / 2, 76)

        // ── 数字圆 ────────────────────────────────────────────
        if (['playing', 'feedbackOK', 'feedbackFail'].includes(this.state)) {
            const num = this.state === 'feedbackFail' ? this.failNumber : this.currentNumber
            const cx = w / 2
            const cy = h * 0.385
            const radius = w * 0.24

            ctx.beginPath()
            ctx.arc(cx, cy, radius, 0, Math.PI * 2)
            if (this.state === 'feedbackOK') ctx.fillStyle = '#1a5c30'
            else if (this.state === 'feedbackFail') ctx.fillStyle = '#5c1010'
            else ctx.fillStyle = '#16213e'
            ctx.fill()
            ctx.strokeStyle = this.state === 'feedbackOK' ? '#2ecc71'
                : this.state === 'feedbackFail' ? '#e74c3c'
                    : '#1a4a7a'
            ctx.lineWidth = 4
            ctx.stroke()

            // 数字字号自适应位数
            const dlen = String(num).length
            const fsize = dlen <= 4 ? w * 0.20 : dlen <= 6 ? w * 0.13 : w * 0.09
            ctx.fillStyle = '#ffffff'
            ctx.font = `bold ${fsize}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(String(num), cx, cy)

            // 正确反馈
            if (this.state === 'feedbackOK') {
                ctx.fillStyle = '#2ecc71'
                ctx.font = `bold ${w * 0.058}px Arial`
                ctx.fillText('✓  正确！+10', cx, cy + radius + 36)
            }

            // 失败反馈
            if (this.state === 'feedbackFail') {
                const lineGap = w * 0.046
                const startY = cy + radius + 26
                this.failLines.forEach((line, i) => {
                    ctx.fillStyle = i === 0 ? '#e74c3c' : '#ffcc44'
                    ctx.font = i === 0
                        ? `bold ${w * 0.046}px Arial`
                        : `${w * 0.032}px Arial`
                    ctx.fillText(line, cx, startY + i * lineGap)
                })
            }
        }

        // ── 底部按钮（仅 playing）────────────────────────────
        if (this.state === 'playing') this._renderButtons(ctx, w, h)

        // ── 覆盖层 ────────────────────────────────────────────
        if (this.state === 'levelComplete') this._renderLevelComplete(ctx, w, h)
        if (this.state === 'gameOver') this._renderGameOver(ctx, w, h)
    }

    _renderButtons(ctx, w, h) {
        const gap = 14
        const bw = (w - gap * 3) / 2
        const bh = h * 0.150
        const by = h * 0.735

        // 「说」蓝
        ctx.fillStyle = '#0d4f8c'
        ctx.beginPath()
        ctx.roundRect(gap, by, bw, bh, 16)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = `bold ${w * 0.13}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('说', gap + bw / 2, by + bh * 0.44)
        ctx.font = `${w * 0.030}px Arial`
        ctx.fillStyle = '#7ab8f0'
        ctx.fillText('普通数字', gap + bw / 2, by + bh * 0.81)

        // 「过」红
        ctx.fillStyle = '#7a0a0a'
        ctx.beginPath()
        ctx.roundRect(gap * 2 + bw, by, bw, bh, 16)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = `bold ${w * 0.13}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('过', gap * 2 + bw + bw / 2, by + bh * 0.44)
        ctx.font = `${w * 0.030}px Arial`
        ctx.fillStyle = '#ffaaaa'
        const hint = this.difficulty === 'crazy' ? '含7/倍数/位和' : '含7或7的倍数'
        ctx.fillText(hint, gap * 2 + bw + bw / 2, by + bh * 0.81)

        this._sayBtn = { x: gap, y: by, w: bw, h: bh }
        this._passBtn = { x: gap * 2 + bw, y: by, w: bw, h: bh }
    }

    _renderLevelComplete(ctx, w, h) {
        ctx.fillStyle = 'rgba(0,0,0,0.80)'
        ctx.fillRect(0, 0, w, h)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.fillStyle = '#2ecc71'
        ctx.font = `bold ${w * 0.10}px Arial`
        ctx.fillText('🎉 过关！', w / 2, h * 0.28)

        ctx.fillStyle = '#ffffff'
        ctx.font = `${w * 0.043}px Arial`
        ctx.fillText(`第 ${this.currentLevel} 关完成`, w / 2, h * 0.40)
        ctx.fillText(`本关得分：${this.levelScore} 分`, w / 2, h * 0.48)
        ctx.fillText(`总得分：${this.totalScore} 分`, w / 2, h * 0.55)

        const { queue: nq, interval: ni } = buildLevel(this.currentLevel + 1, this.difficulty)
        ctx.fillStyle = '#666688'
        ctx.font = `${w * 0.032}px Arial`
        ctx.fillText(`下一关：${nq.length} 道题  限时 ${(ni / 1000).toFixed(1)}s`, w / 2, h * 0.62)

        this._drawBtn(ctx, w, h * 0.70, '继续挑战 →', '#e94560')
    }

    _renderGameOver(ctx, w, h) {
        ctx.fillStyle = 'rgba(0,0,0,0.90)'
        ctx.fillRect(0, 0, w, h)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.fillStyle = '#e74c3c'
        ctx.font = `bold ${w * 0.092}px Arial`
        ctx.fillText('游戏结束', w / 2, h * 0.12)

        // 失败的数字
        ctx.fillStyle = '#aaaacc'
        ctx.font = `${w * 0.034}px Arial`
        ctx.fillText('出错的数字：', w / 2, h * 0.21)
        const dlen = String(this.failNumber).length
        const fs = dlen <= 4 ? w * 0.16 : dlen <= 6 ? w * 0.11 : w * 0.08
        ctx.fillStyle = '#e74c3c'
        ctx.font = `bold ${fs}px Arial`
        ctx.fillText(String(this.failNumber), w / 2, h * 0.30)

        // 失败原因
        const lineH = h * 0.046
        this.failLines.forEach((line, i) => {
            ctx.fillStyle = i === 0 ? '#ff6666' : '#ffcc44'
            ctx.font = i === 0
                ? `bold ${w * 0.040}px Arial`
                : `${w * 0.030}px Arial`
            ctx.fillText(line, w / 2, h * 0.40 + i * lineH)
        })

        // 分数
        const scoreY = h * 0.40 + this.failLines.length * lineH + h * 0.04
        ctx.fillStyle = '#aaaacc'
        ctx.font = `${w * 0.036}px Arial`
        ctx.fillText(`总得分：${this.totalScore} 分  ·  第 ${this.currentLevel} 关`, w / 2, scoreY)

        const key = 'best_' + DIFFICULTY_CONFIG[this.difficulty].key
        const best = loadData(key, 0)
        const displayBest = this.isNewBest ? this.totalScore : best

        if (this.isNewBest) {
            // 新纪录金色高亮
            ctx.fillStyle = '#f0c040'
            ctx.font = `bold ${w * 0.048}px Arial`
            ctx.fillText(`🏆 新纪录！${displayBest} 分`, w / 2, scoreY + h * 0.055)
        } else {
            ctx.fillStyle = '#555577'
            ctx.font = `${w * 0.028}px Arial`
            ctx.fillText(`[${DIFFICULTY_CONFIG[this.difficulty].label}] 最高分：${displayBest} 分`, w / 2, scoreY + h * 0.055)
        }

        // ── 底部三按钮区（纵向排列）────────────────────────────
        const bw3 = w * 0.72, bh3 = 50
        const bx3 = (w - bw3) / 2
        const gap3 = h * 0.018
        const by3Start = h * 0.73

        // 📣 挑战好友（橙红）
        ctx.fillStyle = '#c0390b'
        ctx.beginPath()
        ctx.roundRect(bx3, by3Start, bw3, bh3, 25)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = `bold ${w * 0.044}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('分享', w / 2, by3Start + 25)
        this._shareBtn = { x: bx3, y: by3Start, w: bw3, h: bh3 }

        // 返回首页（蓝）
        const by3Home = by3Start + bh3 + gap3
        ctx.fillStyle = '#0d4f8c'
        ctx.beginPath()
        ctx.roundRect(bx3, by3Home, bw3, bh3, 25)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = `bold ${w * 0.044}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('返回首页', w / 2, by3Home + 25)
        this._homeBtn = { x: bx3, y: by3Home, w: bw3, h: bh3 }

    }

    _drawBtn(ctx, w, y, label, color) {
        const bw = w * 0.58, bh = 50
        const bx = (w - bw) / 2
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(bx, y, bw, bh, 25)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = `bold ${w * 0.046}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, w / 2, y + 25)
    }

    onTouchEnd(e) {
        const touch = e.changedTouches[0]
        const tx = touch.clientX, ty = touch.clientY

        if (this.state === 'levelComplete') {
            this.currentLevel++
            this.initLevel(this.currentLevel)
            return
        }
        if (this.state === 'gameOver') {
            if (this._shareBtn && this._hit(tx, ty, this._shareBtn)) {
                this._sharePoster()
                return
            }
            if (this._homeBtn && this._hit(tx, ty, this._homeBtn)) {
                const { StartScene } = require('./StartScene')
                this.game.loadScene(new StartScene(this.game))
            }
            return
        }
        if (this.state !== 'playing') return

        if (this._sayBtn && this._hit(tx, ty, this._sayBtn)) this.answer(false)
        else if (this._passBtn && this._hit(tx, ty, this._passBtn)) this.answer(true)
    }

    _hit(x, y, r) {
        return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h
    }

    _buildShareContent() {
        const cfg = DIFFICULTY_CONFIG[this.difficulty]
        const score = this.totalScore
        const title = `我在玩逢7过，${cfg.label}难度获得了 ${score} 分，你看看你行吗？`
        const desc = `「逢7过」遇到含7或7的倍数就「过」，反应慢了就输！快来挑战！`
        return { title, desc }
    }

    _sharePoster() {
        wx.showLoading({ title: '生成分享海报…', mask: true })
        let offCanvas
        try {
            offCanvas = wx.createOffscreenCanvas({ type: '2d', width: 750, height: 1080 })
        } catch (e) {
            wx.hideLoading()
            const { title, desc } = this._buildShareContent()
            wx.shareAppMessage({ title, desc })
            return
        }
        const ctx = offCanvas.getContext('2d')
        const cfg = DIFFICULTY_CONFIG[this.difficulty]
        const score = this.totalScore
        const level = this.currentLevel
        const best = loadData('best_' + cfg.key, 0)
        const displayBest = this.isNewBest ? score : best
        const PW = 750, PH = 1080

        // 背景
        ctx.fillStyle = '#0d0d1e'
        ctx.fillRect(0, 0, PW, PH)

        // 装饰圆
        ctx.beginPath()
        ctx.arc(PW * 0.12, PH * 0.06, PW * 0.22, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(233,69,96,0.10)'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(PW * 0.92, PH * 0.90, PW * 0.28, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(15,52,96,0.28)'
        ctx.fill()

        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // 标题
        ctx.fillStyle = '#e94560'
        ctx.font = 'bold 110px Arial'
        ctx.fillText('逢7过', PW / 2, PH * 0.13)

        // 副标题
        ctx.fillStyle = '#444466'
        ctx.font = '32px Arial'
        ctx.fillText('WeChat 小游戏', PW / 2, PH * 0.21)

        // 难度标签
        ctx.fillStyle = '#0f3460'
        ctx.fillRect(PW * 0.35, PH * 0.255, PW * 0.30, 56)
        ctx.fillStyle = '#aaaacc'
        ctx.font = '30px Arial'
        ctx.fillText(cfg.label + ' 难度', PW / 2, PH * 0.255 + 28)

        // 得分标签
        ctx.fillStyle = '#666688'
        ctx.font = '38px Arial'
        ctx.fillText('本局得分', PW / 2, PH * 0.37)

        // 分数数字
        ctx.fillStyle = '#ffffff'
        ctx.font = `bold ${score >= 1000 ? 150 : 190}px Arial`
        ctx.fillText(String(score), PW / 2, PH * 0.49)

        // 最高分 / 新纪录
        if (this.isNewBest) {
            ctx.fillStyle = '#f0c040'
            ctx.font = 'bold 46px Arial'
            ctx.fillText('🏆 新纪录！', PW / 2, PH * 0.61)
        } else {
            ctx.fillStyle = '#444466'
            ctx.font = '36px Arial'
            ctx.fillText(`历史最高 ${displayBest} 分`, PW / 2, PH * 0.61)
        }

        // 关数
        ctx.fillStyle = '#555577'
        ctx.font = '32px Arial'
        ctx.fillText(`到达第 ${level} 关`, PW / 2, PH * 0.68)

        // 分隔线
        ctx.strokeStyle = '#1a1a3a'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(PW * 0.12, PH * 0.74)
        ctx.lineTo(PW * 0.88, PH * 0.74)
        ctx.stroke()

        // 挑袖文字
        ctx.fillStyle = '#e94560'
        ctx.font = 'bold 44px Arial'
        ctx.fillText('你看看你行吗？', PW / 2, PH * 0.80)

        // 小程序入口提示
        ctx.fillStyle = '#444466'
        ctx.font = '28px Arial'
        ctx.fillText('搜索小游戏「逢7过」来挑战', PW / 2, PH * 0.87)

        // 底边色条
        ctx.fillStyle = '#e94560'
        ctx.fillRect(0, PH - 8, PW, 8)

        offCanvas.toTempFilePath({
            success(res) {
                wx.hideLoading()
                wx.showShareImageMenu({
                    path: res.tempFilePath,
                    fail() {
                        wx.showToast({ title: '分享已取消', icon: 'none', duration: 1000 })
                    },
                })
            },
            fail() {
                wx.hideLoading()
                wx.showToast({ title: '海报生成失败', icon: 'none' })
            },
        })
    }

}
