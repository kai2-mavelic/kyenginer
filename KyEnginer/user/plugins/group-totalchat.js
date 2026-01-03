import { sendText, tag } from '#helper'
import { isJidGroup } from 'baileys'

async function handler({ sock, m, jid }) {

    if (!isJidGroup(jid)) {
        return sendText(sock, jid, 'khusus group.', m)
    }

    const data = global.chatCounter?.groups?.[jid]
    if (!data) {
        return sendText(sock, jid, 'belum ada data chat group ini.', m)
    }

    const { total, users } = data

    const topUsers = Object.entries(users)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    let text = `📊 *TOTAL CHAT GROUP*\n\n`
    text += `🧮 Total Chat: ${total}\n\n`

    text += `👤 *Top 5 User Group Ini*\n`
    topUsers.forEach(([uid, count], i) => {
        text += `${i + 1}. ${tag(uid)} — ${count} chat\n`
    })

    await sendText(sock, jid, text, m)
}

handler.command = ['totalchat']
handler.category = ['group']
handler.description = 'statistik chat per group'
handler.pluginName = 'total chat group'
handler.meta = {
fileName: 'group-totalchat.js',
version: '1.2',
author: 'ky'
}
export default handler