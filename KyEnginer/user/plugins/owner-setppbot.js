import { sendText, getBuff, userManager } from '../../system/helper.js'

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
 
async function handler({ m, q, jid, sock }) {
if (!
userManager.trustedJids.has(m.senderId))
return await sendText(sock, jid, 'khusus kado jir my lope my life my heart, lah lu siapa?')

   const img = m.q ? m.q : m

   if (!img) {
      return await sendText(
         jid,
         'mana gambar nya',
         m
      )
   }

   try {
      
      const buffer = await getBuff(img)

    
      await sock.updateProfilePicture(sock.user.id, buffer)

      await sendText(sock, jid, '✅ Foto profil bot berhasil diubah.', m)
   } catch (err) {
      console.error(err)
      await sendText(sock, jid, ' Gagal mengubah foto profil bot.', m)
   }
}

handler.pluginName = 'ganti pp bot'
handler.command = ['setpp']
handler.category = ['owner']
handler.deskripsi = 'Ubah foto profil bot dengan kirim atau reply gambar.'
handler.meta = {
fileName: 'owner-setppbot.js',
version: '1',
author: 'Ky'
}

export default handler