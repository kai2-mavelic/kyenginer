import axios from 'axios'
import { sendText } from '#helper'

    /**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */

async function handler({ sock, m, jid, text }) {
    if (!text) {
        return sendText(
            sock,
            jid,
            'contoh:\n.ngl https://ngl.link/username pesan',
            m
        )
    }

    const args = text.split('|').map(v => v.trim())
    const url = args[0]
    const message = args[1]

    if (!url || !message) {
        return sendText(
            sock,
            jid,
            'format salah.\ncontoh:\n.ngl https://ngl.link/username | halo',
            m
        )
    }

  
    if (!/^https?:\/\/(www\.)?ngl\.link\//i.test(url)) {
        return sendText(sock, jid, 'link ngl tidak valid', m)
    }

   
    const { data } = await axios.get(
        'https://api.deline.web.id/tools/spamngl',
        {
            params: {
                url,
                message
            },
            timeout: 15000
        }
    )

    if (!data?.status) {
        return sendText(sock, jid, 'request gagal', m)
    }

    const r = data.result
    await sendText(
        sock,
        jid,
        `✅ selesai
target : ${r.username_target}
pesan  : ${r.pesan_terkirim}
total  : ${r.total_percobaan}
berhasil : ${r.berhasil_dikirim}
gagal : ${r.gagal_dikirim}`,
        m
    )
    
}

handler.pluginName = 'nglspam'
handler.description = 'spam'
handler.command = ['nglspam']
handler.category = ['tools']

handler.meta = {
    fileName: 'tools-ngl.js',
    version: '0.0.1',
    author: 'ky',
    note: 'nhaor'
}

export default handler