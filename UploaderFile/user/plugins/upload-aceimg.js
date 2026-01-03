import FormData from 'form-data'
import axios from 'axios'
import {
  sendText,
  getBuff
} from '#helper'

async function uploadAceImg(buffer, filename = 'file') {
  const form = new FormData()
  form.append('file', buffer, filename)

  const res = await axios.post(
    'https://api.aceimg.com/api/upload',
    form,
    { headers: form.getHeaders() }
  )

  const data = res.data
  if (data?.status && data?.link) {
    const match = data.link.match(/f=([^\s]+)/)
    const name = match?.[1]
    if (name) return `https://cdn.aceimg.com/${name}`
  }

  throw new Error('Upload gagal, tidak ada link tersedia')
}

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, q, jid, sock }) {
  const target = q || m
  const msg = target.message

  const isImage = msg?.imageMessage
  const isVideo = msg?.videoMessage
  const isAudio = msg?.audioMessage

  if (!isImage && !isVideo && !isAudio) {
    return sendText(sock, jid, 'mana medianya', m)
  }

  let filename = 'file'
  if (isImage) filename += '.jpg'
  else if (isVideo) filename += '.mp4'
  else if (isAudio) filename += '.mp3'

  try {
    const buffer = await getBuff(target)
    const link = await uploadAceImg(buffer, filename)

    await sendText(
      sock,
      jid,
      `✅ Upload berhasil!\n${link}`,
      m
    )
  } catch (err) {
    await sendText(sock, jid, `❌ Error: ${err.message}`, m)
  }
}

handler.pluginName = 'aceimg'
handler.description = 'upload image / video / audio ke AceImg'
handler.command = ['aceimg']
handler.category = ['uploader']

handler.meta = {
  fileName: 'upload-aceimg.js',
  version: '1',
  author: 'Ky',
  note: 'struktur baru, logika asli'
}

export default handler