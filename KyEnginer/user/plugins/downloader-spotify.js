import axios from 'axios'
import { textOnlyMessage, sendText, sendFancyMp3, react } from '#helper'
import { delay } from 'baileys'

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
            'masukin link spotify\ncontoh:\nspotify https://open.spotify.com/track/xxxx',
            m
        )
    }

    // validasi link spotify
    if (!/open\.spotify\.com\/track/i.test(q)) {
        return sendText(sock, jid, 'itu bukan link spotify', m)
    }

    try {
        await react(sock, m, '⏳')
        await delay(1500)

        const { data } = await axios.get(
            `https://api.elrayyxml.web.id/api/downloader/spotify?url=${encodeURIComponent(q)}`
        )

        if (!data?.status || !data?.result) {
            await react(sock, m, '❌')
            return sendText(sock, jid, 'gagal ambil data spotify', m)
        }

        const res = data.result
        if (!res.url) {
            await react(sock, m, '❌')
            return sendText(sock, jid, 'audio tidak tersedia', m)
        }

        const title = res.title
        const body = `Spotify • ${res.artist}`
        const thumb = 'https://files.catbox.moe/8d9z5s.png' // optional, bisa diganti

        await delay(1000)
        await react(sock, m, '🎵')

        await sendFancyMp3(
            sock,
            jid,
            res.url,
            title,
            body,
            thumb,
            false,
            m
        )

        await delay(1500)
        await react(sock, m, '✅')

    } catch (e) {
        await react(sock, m, '❌')
        await sendText(sock, jid, `error: ${e.message}`, m)
    }
}

handler.pluginName = 'spotify downloader'
handler.command = ['spotify']
handler.category = ['downloader']

handler.meta = {
    fileName: 'downloader-spotify.js',
    version: '1.0.0',
    author: 'Ky',
    note: 'spotify downloader mp3'
}

export default handler