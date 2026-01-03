import axios from 'axios'
import { sendText, tag, botInfo } from '#helper'

async function handler({ m, text, jid, sock }) {
    if (!text) return await sendText(sock, jid, '⚠️ Masukkan URL untuk dijadikan short url', m)
    if (!/^https?:\/\//.test(text)) return await sendText(sock, jid, 'Format URL salah! Harus diawali http:// atau https://', m)

    try {
        const apiUrl = `https://api.alwaysdym.my.id/tools/tinyurl?url=${encodeURIComponent(text)}`
        const { data } = await axios.get(apiUrl)

        if (data.status && data.result) {
            await sendText(sock, jid, `✅ Selesai ${tag(m.senderId)}\n\n${data.result}`, m)
        } else {
            await sendText(sock, jid, `Gagal membuat TinyURL.`, m)
        }
    } catch (err) {
        await sendText(sock, jid, `Terjadi kesalahan: ${err.message}`, m)
    }
}

handler.pluginName = 'tinyurl'
handler.command = ['tinyurl', 'shortlink']
handler.category = ['tools']
handler.deskripsi = 'Membuat link pendek dari URL menggunakan TinyURL.'
handler.meta = {
fileName: 'tools-shortlink.js',
version: '1',
author: botInfo.an,
note: 'gada'
}

export default handler