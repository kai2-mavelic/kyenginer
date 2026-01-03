import { sendText, tag, textOnlyMessage } from '#helper'

async function handler({ sock, jid, m, q, command }) {

   
    if (!textOnlyMessage(m)) return
    if (!q) return sendText(sock, jid, 'reply command ' + command + ' ke pesan sekali lihat', m)
    const legitRvo = q.message[q.type].viewOnce
    if (!legitRvo) return sendText(sock, jid, `hmm.. bukan pesan sekali liat ini mah ${tag(m.senderId)}`, q)
    q.message[q.type].viewOnce = false
    return sock.sendMessage(jid, { forward: q, contextInfo: { isForwarded: false } }, { quoted: q })
}

handler.pluginName = 'read view once'
handler.command = ['rvo']
handler.category = ['tools']
handler.deskripsi = 'melihat pesan view once'
handler.meta = {
fileName: 'tools-rvo.js',
version: '1',
author: 'ky'
}
export default handler