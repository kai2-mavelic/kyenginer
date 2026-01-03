import axios from 'axios'
import sharp from 'sharp'
import { sendText } from '#helper'

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, text, jid, sock }) {
  if (!text) return sendText(sock, jid, 'masukkan teks', m)

  const url = 'https://api.deline.web.id/maker/brat?text=' + encodeURIComponent(text)


  const res = await axios.get(url, {
    responseType: 'stream',
    timeout: 30_000
  })

  const webp = await new Promise((resolve, reject) => {
    const chunks = []

    res.data
      .pipe(
        sharp()
          .resize(512, 512, { fit: 'contain' })
          .webp({ quality: 80 })
      )
      .on('data', c => chunks.push(c))
      .on('end', () => resolve(Buffer.concat(chunks)))
      .on('error', reject)
  })

  await sock.sendMessage(
    jid,
    { sticker: webp },
    { quoted: m }
  )
}

handler.pluginName = 'brat'
handler.description = 'buat stiker brat (axios stream)'
handler.command = ['brat']
handler.category = ['maker']

handler.meta = {
  fileName: 'maker-brat.js',
  version: '1.2',
  author: 'Ky',
  note: 'axios stream'
}

export default handler