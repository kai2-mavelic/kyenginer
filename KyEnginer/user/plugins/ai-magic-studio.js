import axios from 'axios'
import { sendImage, sendText, tag, react } from '#helper'
import { delay } from 'baileys'

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, text, jid, sock }) {
  const prompt = text
  if (!prompt) return sendText(sock, jid, 'masukkan promptnya kak', m)

  try {
    await react(sock, m, '🕒')

    const url = `https://api.elrayyxml.web.id/api/ai/magicstudio?prompt=${encodeURIComponent(prompt)}`

    // fetch image sebagai buffer
    const res = await axios.get(url, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(res.data, 'binary')

    await sendImage(sock, jid, buffer, `nih kak ${tag(m.senderId)} udah jadi ><`, m)

    await delay(1000)
    await react(sock, m, '✅')
  } catch (e) {
    await sendText(sock, jid, `gagal generate gambar: ${e.message}`, m)
  }
}

handler.pluginName = 'magicstudio txt2img'
handler.description = 'Generate gambar anime dari text prompt, langsung kirim ke user'
handler.command = ['ms']
handler.category = ['ai']

handler.meta = {
  fileName: 'ai-magic-studio.js',
  version: '1.0',
  author: 'Ky',
  note: 'pakai q untuk prompt'
}

export default handler