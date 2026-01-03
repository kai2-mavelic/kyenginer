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
            'masukin link youtube-nya\ncontoh:\nytmp3 https://youtu.be/xxxx',
            m
        )
    }

    // validasi link youtube
    if (!/(youtube\.com|youtu\.be)/i.test(q)) {
        return sendText(sock, jid, 'itu bukan link youtube', m)
    }

    try {
        const { data } = await axios.get(
            `https://api.deline.web.id/downloader/ytmp3?url=${encodeURIComponent(q)}`
        )

        if (!data?.status || !data?.result) {
            return sendText(sock, jid, 'gagal ambil data youtube', m)
        }

        const res = data.result
        if (!res.dlink) {
            return sendText(sock, jid, 'audio tidak tersedia', m)
        }

        const title = res.youtube.title
        const body = `YouTube • ${res.pick.quality} • ${res.pick.size}`
        const thumb = res.youtube.thumbnail

        await sendFancyMp3(
            sock,
            jid,
            res.dlink,
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

handler.pluginName = 'ytmp3'
handler.command = ['ytmp3']
handler.category = ['downloader']

handler.meta = {
    fileName: 'downloader-ytmp3.js',
    version: '1.0.0',
    author: 'Ky',
    note: 'youtube downloader mp3/audio nya aja'
}

export default handler