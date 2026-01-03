import { sendText, userManager } from '../../system/helper.js'

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, text, jid, sock }) {
  // cek apakah sender trusted
  if (!userManager.trustedJids.has(m.senderId))
    return await sendText(sock, jid, 'khusus kado jir my lope my life my heart, lah lu siapa?')

  const newName = text?.trim()
  if (!newName) {
    return await sendText(sock, jid, '❌ Kirim nama baru untuk bot, misal: setname MyBot', m)
  }

  try {
    await sock.updateProfileName(newName) // ganti nama profil bot
    await sendText(sock, jid, `✅ Nama profil bot berhasil diubah menjadi: ${newName}`, m)
  } catch (err) {
    console.error(err)
    await sendText(sock, jid, '❌ Gagal mengubah nama profil bot.', m)
  }
}

handler.pluginName = 'ganti nama bot'
handler.command = ['setname']
handler.category = ['owner']
handler.deskripsi = 'Ubah nama profil bot.'
handler.meta = {
  fileName: 'owner-setnamebot.js',
  version: '1',
  author: 'Ky'
}

export default handler