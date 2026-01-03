import axios from 'axios'
import FormData from 'form-data'
import { delay } from 'baileys'
import {
  sendText,
  getBuff,
  react
} from '#helper'

const upscaleImage = async (buffer, mime) => {
  const form = new FormData()
  form.append('scale', '2')
  form.append('image', buffer, {
    filename: 'image.png',
    contentType: mime
  })

  const res = await axios.post(
    'https://api2.pixelcut.app/image/upscale/v1',
    form,
    {
      headers: {
        ...form.getHeaders(),
        'x-client-version': 'web'
      },
      responseType: 'arraybuffer'
    }
  )

  return Buffer.from(res.data)
}

async function handler({ m, q, jid, sock }) {
  const target = q || m
  const msg = target.message
  const img = msg?.imageMessage

  if (!img) return sendText(sock, jid, 'reply / kirim gambar nya', m)

  const mime = img.mimetype || ''
  if (!/^image\/(jpe?g|png|webp)$/i.test(mime)) {
    return sendText(sock, jid, 'format ga support (jpg/png/webp)', m)
  }

  try {
    await react(sock, m, '🕒')

    const buffer = await getBuff(target)
    if (!buffer?.length) throw 'gambar kosong'

    const upscaled = await upscaleImage(buffer, mime)

    await sock.sendMessage(
      jid,
      {
        image: upscaled,
        caption: '✅ berhasil di HD kan (2x)'
      },
      { quoted: m }
    )

    await delay(1000)
    await react(sock, m, '✅')
  } catch (e) {
    await sendText(sock, jid, e.toString(), m)
  }
}

handler.pluginName = 'image upscale'
handler.description = 'HD-in gambar (2x)'
handler.command = ['hd']
handler.category = ['tools']
handler.meta = {
  fileName: 'tools-upscale.js',
  version: '1.0.0',
  author: 'Ky',
  note: 'khusus image'
}

export default handler