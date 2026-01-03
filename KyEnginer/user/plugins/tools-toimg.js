import sharp from 'sharp'
import { sendText, getBuff, tag } from '#helper'

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */

async function handler({ m, jid, sock }) {

  const q = m.q ? m.q : m
  const msg = q.message

  if (!msg)
    return sendText(sock, jid, 'reply gambar / stiker', m)

  const isImage = !!msg.imageMessage
  const isSticker = !!msg.stickerMessage

  if (!isImage && !isSticker)
    return sendText(sock, jid, 'mana stiker nya', m)


  const buffer = await getBuff(q)
  if (!buffer)
    return sendText(sock, jid, '❌ gagal ambil media', m)


  let output
  try {
    output = await sharp(buffer)
      .png()
      .toBuffer()
  } catch (e) {
    return sendText(sock, jid, ' gagal convert', m)
  }

  // kirim hasil
  return await sock.sendMessage(jid, {
    image: output,
    caption: `✅ selesai kak ${tag(m.senderId)}`
  }, { quoted: m })
}

handler.pluginName = 'toimg'
handler.command = ['toimg']
handler.category = ['tools']
handler.deskripsi = 'convert stiker ke image'
handler.meta = {
fileName: 'tools-toimg.js',
version: '1',
author: 'Ky',
note: 'gada'
}
export default handler