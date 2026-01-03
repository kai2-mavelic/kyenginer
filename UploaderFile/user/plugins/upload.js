import fs from 'fs'
import path from 'path'
import {
  sendText,
  getBuff,
  react
} from '#helper'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

function scanUpload() {
  return fs.readdirSync(__dirname)
    .filter(v => v.startsWith('upload-') && v.endsWith('.js'))
    .map(v => v.replace('upload-', '').replace('.js', ''))
}
/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
 async function handler({ sock, m, q, jid }) {

  if (!q) {
    const list = scanUpload()
      .map((v, i) => `${i + 1}. ${v}`)
      .join('\n')

    return sendText(
      sock,
      jid,
      `📤 *Upload Server*\n\n${list}\n\ncontoh:\nupload cloudku`,
      m
    )
  }

  const server = q.toLowerCase()
  const file = `./upload-${server}.js`

  try {
    const mod = await import(file)

    const quoted = m.quoted || m
    const msg = quoted.message

    let ext = 'bin'
    if (msg?.imageMessage) ext = 'jpg'
    else if (msg?.videoMessage) ext = 'mp4'
    else if (msg?.stickerMessage) ext = 'webp'
    else return sendText(sock, jid, 'reply media dulu', m)

    await react(sock, m, '🕒')

    const buffer = await getBuff(quoted)
    const url = await mod.upload(buffer, ext)

    // 🔥 PAKAI UI CLOUDKU
    if (mod.sendUploadResult) {
      await mod.sendUploadResult({ sock, jid, m, url, ext })
    } else {
      await sendText(sock, jid, url, m)
    }

    await react(sock, m, '✅')

  } catch (e) {
    return sendText(sock, jid, 'server upload tidak tersedia', m)
  }
}

handler.pluginName = 'upload'
handler.command = ['upload']
handler.category = ['uploader']
handler.meta = {
fileName: 'upload.js',
version: '2.0',
author: 'ky'
}
export default handler