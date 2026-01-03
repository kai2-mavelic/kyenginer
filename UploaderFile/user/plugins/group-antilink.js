import { sendText } from '#helper'
import { isJidGroup } from 'baileys'

async function handler({ m, text, jid, sock }) {
    if (!isJidGroup(jid)) {
        return sendText(sock, jid, 'khusus grup', m)
    }

    global.db ??= { data: { chats: {} } }
    global.db.data.chats ??= {}
    global.db.data.chats[jid] ??= {}

    const opt = (text || '').toLowerCase()

    if (opt === 'on') {
        global.db.data.chats[jid].antilink = true
        return sendText(sock, jid, '✅ anti link aktif', m)
    }

    if (opt === 'off') {
        global.db.data.chats[jid].antilink = false
        return sendText(sock, jid, '❌ anti link mati', m)
    }

    return sendText(
        sock,
        jid,
        'pakai:\nantilink on\nantilink off',
        m
    )
}

handler.pluginName = 'antilink'
handler.command = ['antilink']
handler.category = ['group']
handler.deskripsi = 'toggle anti link'
handler.meta = {
    fileName: 'group-antilink.js',
    version: '1.1',
    author: 'gwehj'
}

export default handler