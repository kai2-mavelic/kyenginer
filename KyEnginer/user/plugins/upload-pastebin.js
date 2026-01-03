import axios from 'axios'
import {
  sendText,
  tag
} from '#helper'

const API_DEV_KEY = 'qr6DNjA3qEzwwgH6kPh6FT-oDj2qcfCL' // ambil di pastebin.com/api

/**
 * ambil text dari message apapun (conversation / extended / caption)
 */
function getTextFromMessage(msg) {
  return (
    msg?.conversation ||
    msg?.extendedTextMessage?.text ||
    msg?.imageMessage?.caption ||
    msg?.videoMessage?.caption ||
    ''
  )
}

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, q, jid, sock }) {
  // prioritas: reply (q), fallback ke message sendiri
  const target = q || m
  const text = getTextFromMessage(target.message)

  if (!text) {
    return sendText(
      sock,
      jid,
      'Reply code / text yang mau diupload',
      m
    )
  }

  try {
    const params = new URLSearchParams()
    params.append('api_dev_key', API_DEV_KEY)
    params.append('api_option', 'paste')
    params.append('api_paste_code', text)
    params.append('api_paste_name', 'Code from WhatsApp')
    params.append('api_paste_format', 'text')
    params.append('api_paste_private', '1')
    params.append('api_paste_expire_date', '10M')

    const res = await axios.post(
      'https://pastebin.com/api/api_post.php',
      params
    )

    if (typeof res.data === 'string' && res.data.startsWith('http')) {
      return sendText(
        sock,
        jid,
        `${tag(m.senderId)} Done!\nLink paste:\n${res.data}`,
        m
      )
    }

    throw new Error(res.data)
  } catch (e) {
    return sendText(
      sock,
      jid,
      `Error: ${e.message}`,
      m
    )
  }
}

handler.pluginName = 'pastebin upload'
handler.description = 'upload code / text ke pastebin.com'
handler.command = ['utp']
handler.category = ['uploader']

handler.meta = {
  fileName: 'upload-pastebin.js',
  version: '1',
  author: 'Ky',
  note: 'reply text/code, struktur baru'
}

export default handler