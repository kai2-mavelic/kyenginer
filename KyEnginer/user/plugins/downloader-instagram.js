import axios from 'axios'
import FormData from 'form-data'
import {
  textOnlyMessage,
  sendText,
  sendVideo,
  sendImage
} from '#helper'

/**
 * @param {import('../types/plugin.js').HandlerParams} params
 */
async function handler({ sock, m, jid }) {
  if (!textOnlyMessage(m)) return

  const q = m.text?.split(' ').slice(1).join(' ')?.trim()
  if (!q) {
    return sendText(
      sock,
      jid,
      'masukin link instagram\ncontoh:\nig https://www.instagram.com/reel/xxxx',
      m
    )
  }

  if (!/instagram\.com/i.test(q)) {
    return sendText(sock, jid, 'itu bukan link instagram', m)
  }

  try {
    const urls = await snapSave(q)

    if (!urls.length) {
      return sendText(sock, jid, 'media tidak ditemukan', m)
    }

    for (const url of urls) {
      if (/\.(mp4|mkv)|dl=1/i.test(url)) {
        await sendVideo(sock, jid, url, 'Instagram Downloader', m)
      } else {
        await sendImage(sock, jid, url, 'Instagram Downloader', m)
      }
    }

  } catch (e) {
    return sendText(sock, jid, `error: ${e.message}`, m)
  }
}

/* ================= SCRAPER TANPA VM ================= */

async function snapSave(targetUrl) {
  const form = new FormData()
  form.append('url', targetUrl)

  const { data } = await axios.post(
    'https://snapsave.app/id/action.php?lang=id',
    form,
    {
      headers: {
        ...form.getHeaders(),
        origin: 'https://snapsave.app',
        referer: 'https://snapsave.app/id/download-video-instagram',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }
  )

  if (typeof data !== 'string') return []

  // ambil semua link rapidcdn
  const matches = data.match(/https:\/\/d\.rapidcdn\.app\/v2\?[^"'\\s]+/g) || []

  // bersihin HTML entity & duplikat
  return [...new Set(
    matches.map(v =>
      v
        .replace(/&amp;/g, '&')
        .replace(/\\u0026/g, '&')
        .replace(/\\/g, '')
    )
  )]
}

/* ================= META ================= */

handler.pluginName = 'instagram downloader'
handler.command = ['ig', 'instagram']
handler.category = ['downloader']

handler.meta = {
  fileName: 'downloader-instagram.js',
  version: '1.1.0',
  author: 'Ky',
  note: 'download instagram without vm'
}

export default handler