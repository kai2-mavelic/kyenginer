import { sendText, tag } from '#helper'
import { isJidGroup } from 'baileys'

async function handler({ m, q, jid, sock }) {
    if (!isJidGroup(jid)) {
        return sendText(sock, jid, 'khusus grup', m)
    }

    const { participants } = await sock.groupMetadata(jid)

    let target

  
    if (q?.senderId) {
        target = q.senderId
    }
   
    else if (m?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
    }

    if (!target) {
        return sendText(sock, jid, 'infokan hama nya', m)
    }

    const member = participants.find(v => v.id === target)
    if (!member) {
        return sendText(sock, jid, 'member tidak ditemukan', m)
    }

    if (member.admin) {
        return sendText(sock, jid, 'astaga beliau bangsawan gabisa di kick', m)
    }

    await sock.groupParticipantsUpdate(jid, [target], 'remove')

    return sock.sendMessage(
        jid,
        {
            text: `${tag(target)} ( hama ) berhasil di kick`,
            mentions: [target]
        },
        { quoted: m }
    )
}

handler.pluginName = 'kick'
handler.command = ['kick']
handler.category = ['group']
handler.deskripsi = 'kick member (reply / tag)'
handler.meta = {
    fileName: 'group-kick.js',
    version: '1.3',
    author: 'ky'
}

export default handler