import axios from 'axios'
import { textOnlyMessage, sendText, sendFancyMp3 } from '#helper'

/**
 * @param {import('../types/plugin.js').HandlerParams} params
 */
async function handler({ sock, m, jid }) {
    if (!textOnlyMessage(m)) return

    const q = m.text?.split(' ').slice(1).join(' ')?.trim()
    if (!q) {
        return sendText(
            sock,
            jid,
            'masukin link spotify-nya\ncontoh:\nspotify https://open.spotify.com/track/...',
            m
        )
    }

    // basic validation
    if (!q.includes('open.spotify.com')) {
        return sendText(sock, jid, 'itu bukan link spotify', m)
    }

    try {
        const { data } = await axios.get(
            `https://api.deline.web.id/downloader/spotify?url=${encodeURIComponent(q)}`
        )

        if (!data?.status || !data?.result) {
            return sendText(sock, jid, 'gagal ambil data spotify', m)
        }

        const res = data.result
        const media = res.medias?.find(v => v.type === 'audio')

        if (!media?.url) {
            return sendText(sock, jid, 'audio tidak tersedia', m)
        }

        const title = res.title
        const body = `${res.author} • ${res.duration}`
        const thumb = res.thumbnail

        await sendFancyMp3(
            sock,
            jid,
            media.url,
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

handler.pluginName = 'spotify downloaderv2'
handler.command = ['spotifyv2']
handler.category = ['downloader']

handler.meta = {
    fileName: 'spotify-downloaderv2.js',
    version: '1.1.0',
    author: 'Ky',
    note: 'spotify downloader via url'
}

export default handler