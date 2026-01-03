import { sendText } from '#helper'
import { isJidGroup } from 'baileys'

async function handler({ m, q, text, jid, sock }) {
    if (!isJidGroup(jid)) {
        return sendText(sock, jid, 'khusus grup', m)
    }

    let target = null

   
    if (q?.senderId) {
        target = q.senderId
    }

    else if (text) {
        const num = text.replace(/[^0-9]/g, '')
        if (!num) {
            return sendText(sock, jid, 'nomor tidak valid', m)
        }
        target = num + '@s.whatsapp.net'
    }

    if (!target) {
        return sendText(sock, jid, 'reply pesan / add 628xxxx', m)
    }

    try {
        await sock.groupParticipantsUpdate(
            jid,
            [target],
            'add'
        )

        return sendText(
            sock,
            jid,
            'berhasil di add',
            m
        )

    } catch (e) {
        try {
           
            const invite = await sock.groupInviteCode(jid)
            const link = `https://chat.whatsapp.com/${invite}`

            await sock.sendMessage(
                target,
                {
                    text:
                        `kamu diundang ke grup:\n\n` +
                        `${link}`
                }
            )

            return sendText(
                sock,
                jid,
                'gagal add, invite dikirim ke private',
                m
            )
        } catch (err) {
            return sendText(sock, jid, err.toString(), m)
        }
    }
}

handler.pluginName = 'add'
handler.command = ['add']
handler.category = ['group']
handler.deskripsi = 'add member'
handler.meta = {
    fileName: 'group-add.js',
    version: '1.2',
    author: 'ky'
}

export default handler