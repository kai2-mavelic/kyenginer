import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import { sendText, userManager, textOnlyMessage } from '#helper'

const ROOT = process.cwd()
const TMP_DIR = path.join(ROOT, 'tmp')
const ZIP_NAME = 'backup.zip'
const ZIP_PATH = path.join(TMP_DIR, ZIP_NAME)

const files = [
  'LICENSE',
  'README.md',
  'index.js',
  'launcher.js',
  'package.json',
  'package-lock.json'
]

const dirs = [
  'system',
  'user'
]

async function makeBackup() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR)
  if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH)

  const output = fs.createWriteStream(ZIP_PATH)
  const archive = archiver('zip', { zlib: { level: 9 } })

  archive.pipe(output)

  for (const file of files) {
    const p = path.join(ROOT, file)
    if (fs.existsSync(p)) archive.file(p, { name: file })
  }

  for (const dir of dirs) {
    const p = path.join(ROOT, dir)
    if (fs.existsSync(p)) archive.directory(p, dir)
  }

  await archive.finalize()

  return new Promise((resolve, reject) => {
    output.on('close', () => resolve(ZIP_PATH))
    archive.on('error', reject)
  })
}

/**
 * @param {import('../types/plugin.js').HandlerParams} params
 */
async function handler({ sock, m, q, text, jid }) {
  if (!userManager.trustedJids.has(m.senderId)) return
  if (!textOnlyMessage(m)) return
  if (q || text) return

  try {
    const zip = await makeBackup()
    await sock.sendMessage(
      jid,
      {
        document: fs.readFileSync(zip),
        fileName: ZIP_NAME,
        mimetype: 'application/zip'
      },
      { quoted: m }
    )
  } catch (e) {
    await sendText(sock, jid, e.message, m)
  }
}

handler.pluginName = 'backup'
handler.description = 'backup project ke zip'
handler.command = ['backup']
handler.category = ['owner']

handler.config = {
  systemPlugin: true
}

handler.meta = {
  fileName: 'owner-backup.js',
  version: '1',
  author: 'ky'
}

export default handler