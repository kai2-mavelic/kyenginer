import fs from 'fs'
import path from 'path'
import {
  sendText,
  userManager,
  textOnlyMessage,
  botInfo
} from '#helper'

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ sock, m, jid }) {

  
  if (!userManager.trustedJids.has(m.senderId))
    return await sendText(
      sock,
      jid,
      'khusus kado jir my lope my life my heart, lah lu siapa?',
      m
    )

  if (!textOnlyMessage(m)) return

  const sessionPath = path.join(process.cwd(), 'auth')
  const credsFile = 'creds.json'

  // helper format size
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`
  }

  try {
    if (!fs.existsSync(sessionPath)) {
      return await sendText(
        sock,
        jid,
        '❌ folder auth / session tidak ditemukan',
        m
      )
    }

    const files = fs.readdirSync(sessionPath)
    let total = 0
    let totalSize = 0

    for (const file of files) {
      if (file === credsFile) continue

      const filePath = path.join(sessionPath, file)
      const stat = fs.statSync(filePath)

      totalSize += stat.size
      fs.rmSync(filePath, { recursive: true, force: true })
      total++
    }

    const result =
      `✅ *CLEAR SESSION BERHASIL*\n\n` +
      `📁 file dihapus : *${total}*\n` +
      `🗑️ ukuran       : *${formatSize(totalSize)}*\n` +
      `🔐 creds.json   : *AMAN*\n\n` +
      `🤖 ${botInfo.dn}`

    return await sendText(sock, jid, result, m)

  } catch (err) {
    console.error(err)
    return await sendText(
      sock,
      jid,
      `❌ gagal clear session\n\n${err.message}`,
      m
    )
  }
}

handler.pluginName = 'owner clear auth'
handler.description = 'membersihkan folder auth/session kecuali creds.json'
handler.command = ['csesi']
handler.category = ['owner']

handler.config = {
  systemPlugin: true,
  antiDelete: true,
}

handler.meta = {
  fileName: 'owner-clear-auth.js',
  version: '1.0.0',
  author: botInfo.an,
  note: 'clear auth kecuali creds.json',
}

export default handler