import { sendText, downloadBuffer } from '#helper'
import { Sticker } from 'wa-sticker-formatter'
import fs from 'fs'
import path from 'path'
import os from 'os'

async function handler({ m, text, jid, sock }) {
    if (!text) return sendText(sock, jid, 'masukkan teks', m)

    try {
        
        const tempFile = path.join(os.tmpdir(), `bratvid_${Date.now()}.mp4`)

        
        const mp4Buffer = await downloadBuffer('https://api.deline.web.id/maker/bratvid?text=' + encodeURIComponent(text))
        await fs.promises.writeFile(tempFile, mp4Buffer)

      
        const sticker = new Sticker(tempFile, {
            pack: '',
            author: 'Ky',
            animated: true,
            quality: 70
        })

        const webp = await sticker.toBuffer()
        await sock.sendMessage(jid, { sticker: webp }, { quoted: m })

        
        await fs.promises.unlink(tempFile)
    } catch (e) {
        console.error(e)
        sendText(sock, jid, 'gagal bikin brat video', m)
    }
}

handler.pluginName = 'brat type video'
handler.description = 'buat stiker brat tapi video kalo gapaham gausah'
handler.command = ['bratvid']
handler.category = ['maker']

handler.meta = {
    fileName: 'maker-brat-video.js',
    version: '1.1',
    author: 'Ky',
    note: 'versi hemat RAM & auto-clear temp',
}
export default handler