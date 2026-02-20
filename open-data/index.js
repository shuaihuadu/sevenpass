// 开放数据域 - 好友排行榜（逢7过）
// 注意：运行在开放数据域，不支持 import/export，wx 关系链 API 只能在此调用

const SCORE_KEY = 'sevenpass_score'
const sharedCanvas = wx.getSharedCanvas()

wx.onMessage(function (msg) {
    if (!msg) return
    if (msg.type === 'setScore') {
        wx.setUserCloudStorage({
            KVDataList: [{ key: SCORE_KEY, value: String(msg.score || 0) }],
        })
    } else if (msg.type === 'render') {
        const w = msg.width || 750
        const h = msg.height || 500
        sharedCanvas.width = w
        sharedCanvas.height = h
        renderRankList(w, h)
    }
})

function renderRankList(w, h) {
    wx.getFriendCloudStorage({
        keyList: [SCORE_KEY],
        success: function (res) {
            const users = (res.data || [])
                .filter(function (u) { return u.KVDataList && u.KVDataList.length > 0 })
                .map(function (u) {
                    return {
                        nickname: u.nickname || '微信用户',
                        avatarUrl: u.avatarUrl || '',
                        score: parseInt(u.KVDataList[0].value, 10) || 0,
                    }
                })
                .sort(function (a, b) { return b.score - a.score })
            drawList(w, h, users)
        },
        fail: function () {
            drawList(w, h, [])
        },
    })
}

function drawList(w, h, users) {
    var ctx = sharedCanvas.getContext('2d')
    ctx.clearRect(0, 0, w, h)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    if (users.length === 0) {
        ctx.fillStyle = '#555577'
        ctx.font = 'bold 32px Arial'
        ctx.fillText('暂无好友数据', w / 2, h / 2 - 28)
        ctx.fillStyle = '#444466'
        ctx.font = '26px Arial'
        ctx.fillText('邀请好友一起玩逢7过！', w / 2, h / 2 + 28)
        return
    }

    var maxRows = Math.min(users.length, 8)
    var rowH = Math.floor(h / maxRows)
    var rankColors = ['#f0c040', '#c8c8c8', '#c87040']

    for (var i = 0; i < maxRows; i++) {
        var user = users[i]
        var ry = i * rowH
        var cy = ry + rowH / 2

        // 行背景
        ctx.fillStyle = i % 2 === 0 ? '#1e1e3a' : '#161630'
        ctx.fillRect(0, ry, w, rowH)

        // 名次
        ctx.fillStyle = i < 3 ? rankColors[i] : '#666688'
        ctx.font = 'bold ' + Math.round(rowH * 0.42) + 'px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(String(i + 1), Math.round(w * 0.05), cy)

        // 头像背景圆
        var avR = Math.round(rowH * 0.35)
        var avX = Math.round(w * 0.12)
        ctx.beginPath()
        ctx.arc(avX, cy, avR, 0, Math.PI * 2)
        ctx.fillStyle = '#0f3460'
        ctx.fill()

        // 头像图片（异步加载）
        if (user.avatarUrl) {
            ; (function (imgSrc, x, y, r) {
                var img = wx.createImage()
                img.onload = function () {
                    ctx.save()
                    ctx.beginPath()
                    ctx.arc(x, y, r, 0, Math.PI * 2)
                    ctx.clip()
                    ctx.drawImage(img, x - r, y - r, r * 2, r * 2)
                    ctx.restore()
                }
                img.src = imgSrc
            })(user.avatarUrl, avX, cy, avR)
        }

        // 昵称
        var name = user.nickname.length > 8 ? user.nickname.slice(0, 8) + '…' : user.nickname
        ctx.fillStyle = '#ccccdd'
        ctx.font = Math.round(rowH * 0.32) + 'px Arial'
        ctx.textAlign = 'left'
        ctx.fillText(name, Math.round(w * 0.20), cy)

        // 分数
        ctx.fillStyle = '#e94560'
        ctx.font = 'bold ' + Math.round(rowH * 0.35) + 'px Arial'
        ctx.textAlign = 'right'
        ctx.fillText(user.score + ' 分', w - Math.round(w * 0.03), cy)
    }
}
