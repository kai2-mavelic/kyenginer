import {
sendText,
downloadBuffer
} from '#helper'
import { Sticker } from 'wa-sticker-formatter'

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
 
async function handler({ m, text, jid, sock }) {
    if (!text) return sendText(sock, jid, 'masukkan teks', m)

    const url = 'https://api.deline.web.id/maker/attp?text=' + encodeURIComponent(text)
    const mp4 = await downloadBuffer(url)

    const sticker = new Sticker(mp4, {
        pack: 'Shiroko',
        author: 'Ky',
        animated: true,
        quality: 70
    })

    const webp = await sticker.toBuffer()
    await sock.sendMessage(jid, { sticker: webp }, { quoted: m })
}

handler.pluginName = 'attp'
handler.description = 'buat stiker attp tapi video kalo gapaham gausah'
handler.command = ['attp']
handler.category = ['maker']

handler.meta = {
    fileName: 'maker-attp.js',
    version: '1',
    author: 'Ky',
    note: 'gatau',
}
export default handler