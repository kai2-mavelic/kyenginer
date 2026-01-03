import { Sticker } from 'wa-sticker-formatter'
import { sendText, getBuff } from '#helper'
import fs from 'fs'
import path from 'path'
import os from 'os'

async function handler({ m, sock, jid }) {
  const med = m.q ? m.q : m
  const medImage = med.message?.imageMessage
  const medVideo = med.message?.videoMessage

  if (!medImage && !medVideo) return sendText(sock, jid, 'Reply/Kirim gambar atau video.', m)

  try {
    const buffer = await getBuff(med)
    const tempFile = path.join(os.tmpdir(), `sticker_${Date.now()}`)

    await fs.promises.writeFile(tempFile, buffer)

    const sticker = new Sticker(tempFile, {
      pack: 'Shiroko',
      author: 'Ky',
      type: 'full',
      quality: 100
    })

    const stickerBuffer = await sticker.toBuffer()
    await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: m })

    await fs.promises.unlink(tempFile)
  } catch (e) {
    console.error(e)
    sendText(jid, e.message, m)
  }
}

handler.pluginName = 'Image/Video to Sticker'
handler.command = ['s']
handler.category = ['maker']
handler.deskripsi = 'Convert Image/Video ke sticker (webp).'
handler.meta = {
  fileName: 'maker-sticker.js',
  version: '1.1',
  author: 'Ky'
}
export default handler