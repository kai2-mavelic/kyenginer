import { sendText, tag } from '#helper'
import { isJidGroup } from 'baileys'

async function handler({ m, jid, text, sock }) {
    if (!isJidGroup(jid)) return sendText(jid, 'khusus grup', m)
    if (!text) return sendText(jid, 'masukkan teks', m)

    const metadata = await sock.groupMetadata(jid)
    const members = metadata.participants.map(v => v.id)

    return await sock.sendMessage(
        jid,
        {
            text: `dari ${tag(m.senderId)}\n${text}`,
            mentions: members
        },
        { quoted: m }
    )
}

handler.pluginName = 'hidetag'
handler.command = ['h']
handler.category = ['group']
handler.deskripsi = 'mention semua member tanpa terlihat'
handler.meta = {
    fileName: 'group-hidetag.js',
    version: '1',
    author: 'ky'
}

export default handler