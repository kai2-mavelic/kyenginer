import fetch from 'node-fetch'
import { fileTypeFromBuffer } from 'file-type'
import { sendText } from '#helper'

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function getBrowserHeaders() {
  return {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache'
  }
}

async function handler({ m, text, jid, sock }) {
  const reply = (msg) => sendText(sock, jid, msg, m)
  const startTime = Date.now()

  // pastikan text selalu string
  const rawText = String(text || m?.text || m?.message?.conversation || '')

  // hapus command di depan
  let input = rawText.trim().replace(/^(get|fetch)\s+/i, '')

  if (!input || !/^https?:\/\//i.test(input)) {
    return reply(
      `Format:\nget <url>\n\nContoh:\nget https://example.com`
    )
  }

  const originalUrl = input

  try {
    const response = await fetch(originalUrl, {
      method: 'GET',
      headers: getBrowserHeaders(),
      redirect: 'follow',
      timeout: 30000
    })

    const fetchTime = Date.now() - startTime
    const finalUrl = response.url
    const redirected = finalUrl !== originalUrl

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      return reply(
        `HTTP ERROR ${response.status}\n\n` +
        `URL: ${originalUrl}\n` +
        `${redirected ? `Final URL: ${finalUrl}\n` : ''}` +
        `Time: ${fetchTime}ms\n\n` +
        errText.slice(0, 300)
      )
    }

    const buffer = await response.buffer()
    let mime = response.headers.get('content-type')?.split(';')[0] || 'application/octet-stream'
    let ext = mime.split('/')[1] || 'bin'

    try {
      const detected = await fileTypeFromBuffer(buffer)
      if (detected) {
        mime = detected.mime
        ext = detected.ext
      }
    } catch {}

    const totalTime = Date.now() - startTime
    const speed = formatBytes(buffer.length / (totalTime / 1000)) + '/s'

    const caption =
      `FETCH REPORT\n\n` +
      `URL: ${originalUrl}\n` +
      `Final URL: ${finalUrl}\n` +
      `Redirected: ${redirected ? 'Yes' : 'No'}\n\n` +
      `Content-Type: ${response.headers.get('content-type')}\n` +
      `Detected MIME: ${mime}\n` +
      `Size: ${formatBytes(buffer.length)}\n\n` +
      `Total Time: ${totalTime}ms\n` +
      `Fetch Time: ${fetchTime}ms\n` +
      `Speed: ${speed}`

    // kirim media sesuai tipe
    if (mime.startsWith('image/')) {
      return await sock.sendMessage(jid, { image: buffer, caption })
    }

    if (mime.startsWith('video/')) {
      return await sock.sendMessage(jid, { video: buffer, caption })
    }

    if (mime.startsWith('audio/')) {
      return await sock.sendMessage(jid, { audio: buffer, mimetype: mime, caption })
    }

    // fallback: kirim sebagai dokumen
    return await sock.sendMessage(jid, { document: buffer, fileName: `result.${ext}`, mimetype: mime, caption })

  } catch (e) {
    reply(
      `FETCH ERROR\n\n` +
      `URL: ${originalUrl}\n` +
      `Type: ${e.name}\n` +
      `Message: ${e.message}\n` +
      `Time: ${Date.now() - startTime}ms`
    )
  }
}


handler.pluginName = 'Fetch Inspector'
handler.command = ['fetch']
handler.category = ['tools']
handler.description = 'buat cek bot respond apa kagak.. simply just type ping'
handler.meta = {
    fileName: 'tools-get.js',
    version: '1',
    author: 'Ky',
    note: 'fetch/get web/url'
}
export default handler