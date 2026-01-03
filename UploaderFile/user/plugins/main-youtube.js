import axios from 'axios'
import { delay } from 'baileys'
import { textOnlyMessage, sendText, sendFancyMp3, react } from '#helper'

/**
 * @param {import('../types/plugin.js').HandlerParams} params
 */
async function handler({ sock, m, jid }) {
    if (!textOnlyMessage(m)) return

    // ambil query dari pesan (hapus command di awal)
    const q = m.text?.split(' ').slice(1).join(' ')?.trim()
    if (!q) return sendText(sock, jid, 'query atau judulnya?', m)
await react(sock, m, "🕛")
    try {
        const { data } = await axios.get(
            `https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(q)}`
        )

        if (!data?.status || !data?.result)
            return sendText(sock, jid, 'tidak ada hasil', m)

        const { title, thumbnail, dlink } = data.result

        await sendFancyMp3(sock, jid, dlink, title, 'Shiroko', thumbnail)

    } catch (e) {
        await sendText(sock, jid, `error: ${e.message}`, m)
    }
    await react(sock, m, "✅")
}

handler.pluginName = 'youtube play'
handler.command = ['play']
handler.category = ['main']

handler.meta = {
    fileName: 'ytplay.js',
    version: '1.0.0',
    author: 'Ky',
    note: 'plugin youtube play'
}

export default handler