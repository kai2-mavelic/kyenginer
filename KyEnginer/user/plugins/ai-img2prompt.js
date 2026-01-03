import axios from 'axios'
import { delay } from 'baileys'
import { sendText, getBuff, tag, react } from '#helper'

async function imgtoprompt(buffer) {
  try {
    const base64 = buffer.toString('base64')
    const r = await axios.post(
      'https://imageprompt.org/api/ai/prompts/image',
      {
        base64Url: `data:image/webp;base64,${base64}`,
        imageModelId: 0,
        language: 'en'
      },
      {
        headers:{
          'User-Agent':'Mozilla/5.0 (Linux; Android 10)',
          'Content-Type':'application/json',
          origin:'https://imageprompt.org',
          referer:'https://imageprompt.org/image-to-prompt'
        }
      }
    )
    return { prompt: r.data.prompt, generatedAt: r.data.generatedAt }
  } catch(e) {
    return { status:'error', msg: e.message }
  }
}

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, q, jid, sock }) {
  const target = q || m
  const msg = target.message

  const isImage = msg?.imageMessage
  const isSticker = msg?.stickerMessage

  if (!isImage && !isSticker) {
    return sendText(sock, jid, 'hanya bisa image atau sticker', m)
  }

  try {
    await react(sock, m, '🕒')

    const buffer = await getBuff(target)
    const result = await imgtoprompt(buffer)

    if (result.status === 'error') {
      await sendText(sock, jid, `Gagal generate prompt: ${result.msg}`, m)
    } else {
      await sendText(
        sock,
        jid,
        `${tag(m.senderId)} Prompt AI berhasil dibuat:\n\n${result.prompt}\n\nGenerated At: ${result.generatedAt}`,
        target
      )
    }

    await delay(1500)
    await react(sock, m, '✅')
  } catch (e) {
    await sendText(sock, jid, e.message, m)
  }
}

handler.pluginName = 'img2prompt'
handler.description = 'Generate prompt AI dari image/sticker saja'
handler.command = ['toprompt']
handler.category = ['ai']

handler.meta = {
  fileName: 'ai-img2prompt.js',
  version: '1.0',
  author: 'Ky',
  note: 'reply/q ke media, hanya support image/sticker'
}

export default handler