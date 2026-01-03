import axios from 'axios'
import FormData from 'form-data'
import { delay } from 'baileys'
import {
  sendText,
  getBuff,
  react,
  tag
} from '#helper'

const uploadApiElrayy = async (buffer, ext) => {
  const form = new FormData()
  form.append('file', buffer, { filename: `file.${ext}` })

  const res = await axios.post(
    'https://api.elrayyxml.web.id/upload',
    form,
    { headers: form.getHeaders(), timeout: 15000 }
  )

  return (
    res.data?.url ||
    res.data?.data?.url ||
    res.data?.result?.url ||
    null
  )
}

const uploadSElrayy = async (buffer, ext) => {
  const form = new FormData()
  form.append('elrayyxml', buffer, { filename: `file.${ext}` })
  form.append('duration', '10m')

  const res = await axios.post(
    'https://s.elrayyxml.my.id/upload',
    form,
    { headers: form.getHeaders(), timeout: 15000 }
  )

  return res.data?.url || res.data?.data?.url || null
}

async function handler({ m, q, jid, sock }) {
  const target = q || m
  const msg = target.message

  const isImage = msg?.imageMessage
  const isVideo = msg?.videoMessage
  const isSticker = msg?.stickerMessage

  if (!isImage && !isVideo && !isSticker) {
    return sendText(sock, jid, 'mana media nya', m)
  }

  let ext = 'bin'
  if (isImage) ext = 'png'
  else if (isVideo) ext = 'mp4'
  else if (isSticker) ext = 'webp'

  try {
    await react(sock, m, '🕒')
    const buffer = await getBuff(target)

    const [link1, link2] = await Promise.all([
      uploadApiElrayy(buffer, ext).catch(() => null),
      uploadSElrayy(buffer, ext).catch(() => null)
    ])

    if (!link1 && !link2) {
      throw new Error('upload gagal')
    }

    let text = `✅ ${tag(m.senderId)} berhasil\n\n📄 File: ${ext}\n\n`
    text += `rinku dai-ichi:\n${link1 || '-'}\n\n`
    text += `rinku dai-ni:\n${link2 || '-'}`

    await sendText(sock, jid, text, m)

    await delay(1000)
    await react(sock, m, '✅')
  } catch (e) {
    await sendText(sock, jid, e.message, m)
  }
}

handler.pluginName = 'elrayy upload'
handler.description = 'upload media ke api.elrayy & s.elrayy'
handler.command = ['elrayy']
handler.category = ['uploader']
handler.meta = {
  fileName: 'upload-elrayy.js',
  version: '1',
  author: 'Ky'
}

export default handler