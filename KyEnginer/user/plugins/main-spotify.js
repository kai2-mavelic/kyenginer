import axios from 'axios'
import { textOnlyMessage, sendText, sendFancyMp3 } from '#helper'

/**
 * @param {import('../types/plugin.js').HandlerParams} params
 */
async function handler({ sock, m, jid }) {
    if (!textOnlyMessage(m)) return
    const q = m.text?.split(' ').slice(1).join(' ')?.trim()
    if (!q) return sendText(sock, jid, 'query atau judulnya?', m)

    try {
        const { data } = await axios.get(
            `https://api.deline.web.id/downloader/spotifyplay?q=${encodeURIComponent(q)}`
        )

        if (!data?.status || !data?.result)
            return sendText(sock, jid, 'tidak ada hasil', m)

        const { metadata, dlink } = data.result
        if (!dlink) return sendText(sock, jid, 'audio tidak tersedia', m)

        const title = metadata.title
        const body = `${metadata.artist} • ${metadata.duration}`
        const thumb = metadata.cover

        await sendFancyMp3(
            sock,
            jid,
            dlink,
            title,
            body,
            thumb,
            false,
            m
        )

    } catch (e) {
        await sendText(sock, jid, `error: ${e.message}`, m)
    }
}

handler.pluginName = 'spotify play'
handler.command = ['splay']
handler.category = ['main']

handler.meta = {
    fileName: 'main-spotify.js',
    version: '1.0.0',
    author: 'Ky',
    note: 'ini masih testing olis'
}

export default handler