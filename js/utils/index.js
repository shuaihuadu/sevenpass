/**
 * 工具函数集合
 */

/**
 * 判断是否为"逢七过"数字（包含数字7 或是7的倍数）
 * @param {number} n
 * @returns {boolean}
 */
export function isSevenNumber(n) {
    return n % 7 === 0 || String(n).includes('7')
}

/**
 * 计算各位数字之和
 * @param {number} n
 * @returns {number}
 */
export function digitSum(n) {
    return String(Math.abs(n)).split('').reduce((a, c) => a + Number(c), 0)
}

/**
 * 疯狂模式：各位数字之和 包含7 或是7的倍数
 * @param {number} n
 * @returns {boolean}
 */
export function isDigitSumSeven(n) {
    const ds = digitSum(n)
    return ds % 7 === 0 || String(ds).includes('7')
}

/**
 * 检测两个矩形是否碰撞
 * @param {object} r1 { x, y, w, h }
 * @param {object} r2 { x, y, w, h }
 * @returns {boolean}
 */
export function rectCollide(r1, r2) {
    return (
        r1.x < r2.x + r2.w &&
        r1.x + r1.w > r2.x &&
        r1.y < r2.y + r2.h &&
        r1.y + r1.h > r2.y
    )
}

/**
 * 检测两个圆是否碰撞
 * @param {object} c1 { x, y, r }
 * @param {object} c2 { x, y, r }
 * @returns {boolean}
 */
export function circleCollide(c1, c2) {
    const dx = c1.x - c2.x
    const dy = c1.y - c2.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    return dist < c1.r + c2.r
}

/**
 * 生成指定范围内的随机整数
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 线性插值
 * @param {number} a
 * @param {number} b
 * @param {number} t 0~1
 * @returns {number}
 */
export function lerp(a, b, t) {
    return a + (b - a) * t
}

/**
 * 限制数值在 min~max 范围内
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val))
}

/**
 * 格式化分数显示（补零）
 * @param {number} score
 * @param {number} digits
 * @returns {string}
 */
export function formatScore(score, digits = 6) {
    return String(score).padStart(digits, '0')
}

/**
 * 存储本地数据
 * @param {string} key
 * @param {any} value
 */
export function saveData(key, value) {
    wx.setStorageSync(key, value)
}

/**
 * 读取本地数据
 * @param {string} key
 * @param {any} defaultValue
 * @returns {any}
 */
export function loadData(key, defaultValue = null) {
    try {
        const val = wx.getStorageSync(key)
        return val !== '' ? val : defaultValue
    } catch (e) {
        return defaultValue
    }
}
