import axios from 'axios'
import {
  sendText,
  textOnlyMessage,
  react
} from '#helper'

/**
 * @param {import('../../system/types/plugin').HandlerParams} params
 */
async function handler({ sock, m, text, jid }) {
  if (!textOnlyMessage(m)) return
  if (!text) {
    return sendText(
      sock,
      jid,
      'contoh:\n.mediafire https://www.mediafire.com/file/xxxx/file',
      m
    )
  }

  try {
    await react(sock, m, '⏳')

    const api = `https://api.deline.web.id/downloader/mediafire?url=${encodeURIComponent(text)}`
    const { data } = await axios.get(api, { timeout: 30000 })

    if (!data.status) {
      return sendText(sock, jid, 'gagal mengambil data mediafire', m)
    }

    const { fileName, downloadUrl } = data.result

    const caption =
`📥 *MEDIAFIRE DOWNLOADER*

📄 nama file : ${fileName}
🔗 link       : ${downloadUrl}

sedang mengirim file...`

    // kirim dulu info
    await sendText(sock, jid, caption, m)

    // kirim file
    await sock.sendMessage(
      jid,
      {
        document: { url: downloadUrl },
        fileName,
        mimetype: 'application/octet-stream'
      },
      { quoted: m }
    )

    await react(sock, m, '✅')

  } catch (err) {
    await react(sock, m, '❌')
    await sendText(sock, jid, 'error: ' + err.message, m)
  }
}

handler.pluginName = 'mediafire downloader'
handler.description = 'download file dari mediafire'
handler.command = ['mediafire', 'mf']
handler.category = ['downloader']

handler.meta = {
  fileName: 'downloader-mediafire.js',
  version: '1.0.0',
  author: 'ky',
  note: 'mediafire downloader via deline api',
}

export default handler