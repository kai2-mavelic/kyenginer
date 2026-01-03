import { sendText, tag } from '#helper'
import { isJidGroup } from 'baileys'

async function handler({ m, jid, text, sock }) {
    if (!isJidGroup(jid)) return sendText(jid, 'khusus grup', m)
    if (!text) return sendText(jid, 'masukkan teks', m)

    const metadata = await sock.groupMetadata(jid)
    const members = metadata.participants.map(v => v.id)

    const tagText = members
        .map(v => tag(v))
        .join('\n')

    return await sock.sendMessage(
        jid,
        {
            text: `Pesan dari ${tag(m.senderId)}\n${text}\n\n${tagText}`,
            mentions: members
        },
        { quoted: m }
    )
}

handler.pluginName = 'tagall'
handler.command = ['tagall']
handler.category = ['group']
handler.deskripsi = 'tag semua member (tag di bawah pesan)'
handler.meta = {
    fileName: 'group-tagall.js',
    version: '1',
    author: 'ky'
}

export default handler