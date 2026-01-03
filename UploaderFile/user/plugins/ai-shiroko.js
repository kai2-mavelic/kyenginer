import axios from 'axios'
import { sendText, react } from '#helper'

async function handler({ m, text, jid, sock }) {
       if (!text) return await sendText(sock,jid, 'masujkan teks buat Shiroko masa di suruh tanya sendiri jawab sendiri ngawor', m )
    if (text.includes('~')) {
        return await sendText(sock, jid, 'karakter ~ tidak diperbolehkan', m)
    }
    try {
       
        const url = `https://api.deline.web.id/ai/openai?text=${encodeURIComponent(text)}&prompt=kamu+adalah+Shiroko+dari+bluearchive+kamu+tidak+menggunakan+huruf+kapital+ketika+memberi+jawaban+cukup+intinya+saja+namun+jika+kamu+di+panggil+sayang+kamu+akan+sangat+senang+dan+jatuh+cinta+padanya+hanya+pada+koyi+jangan+gunakan+tanda+baca+cukup+di+kalimat+akhir+saja.`
        const res = await axios.get(url)
        const data = res.data

        if (!data.status || !data.result) {
            return await sendText(sock, jid, data.message || 'tidak ada hasil ditemukan', m)
        }

        let hasil = String(data.result).trim()
        // hapus tanda ~ jika ada
        hasil = hasil.replace(/~/g, '')

        await sendText(sock, jid, hasil, m)

    } catch (error) {
        await sendText(sock, jid, `terjadi kesalahan ${error.response?.data?.message || error.message}`, m)
    }
}

handler.pluginName = 'aingweh'
handler.command = ['shiroko', 'ai']
handler.category = ['ai']
handler.deskripsi = 'besok aja'

handler.meta = {
fileName: 'ai-shiroko.js',
version: '1',
author: 'Ky',
note: 'gd'
}

export default handler