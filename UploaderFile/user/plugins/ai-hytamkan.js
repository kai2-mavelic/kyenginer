import axios from 'axios'
import FormData from 'form-data'
import { delay } from 'baileys'
import {
  sendText,
  getBuff,
  react
} from '#helper'

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, q, jid, sock }) {
  const target = q || m
  const msg = target.message
  const isImage = msg?.imageMessage

  if (!isImage) {
    return sendText(sock, jid, 'reply/kirim gambar.', m)
  }

  const prompt =
    'buat karakter di dalam gambar menjadi berkulit sangat hitam harus rapi jangan terkena objek lain cukup warna kulitnya saja'

  try {
    await react(sock, m, '🕒')

    // ambil buffer langsung
    const buffer = await getBuff(target)

    // form-data (tanpa simpan file)
    const form = new FormData()
    form.append('image', buffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg'
    })
    form.append('param', prompt)

    // POST ke API
    const res = await axios.post(
      'https://api.elrayyxml.web.id/api/ai/nanobanana',
      form,
      {
        headers: form.getHeaders(),
        responseType: 'arraybuffer'
      }
    )

    // kirim hasil
    await sock.sendMessage(
      jid,
      {
        image: Buffer.from(res.data),
        caption: '✅ selesai diproses'
      },
      { quoted: m }
    )

    await delay(1500)
    await react(sock, m, '✅')
  } catch (e) {
    console.error(e)
    await sendText(sock, jid, '❌ gagal memproses gambar.', m)
  }
}

handler.pluginName = 'Nanobanana Image Edit'
handler.description = 'Edit gambar via Nanobanana AI'
handler.command = ['hytamkan']
handler.category = ['ai']

handler.meta = {
  fileName: 'ai-hytamkan.js',
  version: '1.1.0',
  author: 'Ky',
  note: 'beosk aja'
}

export default handler