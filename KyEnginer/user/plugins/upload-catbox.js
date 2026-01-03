import axios from 'axios'
import FormData from 'form-data'
import { delay } from 'baileys'
import {
  sendText,
  getBuff,
  tag,
  react
} from '#helper'

async function upload(buffer, filename) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('userhash', '')
  form.append('fileToUpload', buffer, filename)

  const res = await axios.post(
    'https://catbox.moe/user/api.php',
    form,
    { headers: form.getHeaders() }
  )

  return res.data
}

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, q, jid, sock }) {
  const target = q || m
  const msg = target.message

  const isImage = msg?.imageMessage
  const isVideo = msg?.videoMessage
  const isSticker = msg?.stickerMessage

  if (!isImage && !isVideo && !isSticker) {
    return sendText(sock, jid, 'mana media nya', m)
  }

  let filename = 'file'
  if (isImage) filename += '.png'
  else if (isVideo) filename += '.mp4'
  else if (isSticker) filename += '.webp'

  try {
    await react(sock, m, '🕒')

    const buffer = await getBuff(target)
    const url = await upload(buffer, filename)

    await sendText(
      sock,
      jid,
      `${tag(m.senderId)} Done ygy\n${url || '(gagal)'}`,
      target
    )

    await delay(1500)
    await react(sock, m, '✅')
  } catch (e) {
    await sendText(sock, jid, e.message, m)
  }
}

handler.pluginName = 'catbox upload'
handler.description = 'upload image / video / sticker ke catbox.moe'
handler.command = ['catbox']
handler.category = ['uploader']

handler.meta = {
  fileName: 'upload-catbox.js',
  version: '3',
  author: 'Ky',
  note: 'pakai q untuk reply, support img/vid/sticker'
}

export default handler