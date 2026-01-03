import axios from 'axios'
import { textOnlyMessage, sendText, sendFile } from '#helper'

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
            'masukin link sfile\ncontoh:\nsfile https://sfile.mobi/xxxx',
            m
        )
    }

    // validasi link sfile
    if (!/sfile\.mobi/i.test(q)) {
        return sendText(sock, jid, 'itu bukan link sfile', m)
    }

    try {
        const { data } = await axios.get(
            `https://api.deline.web.id/downloader/sfile?url=${encodeURIComponent(q)}`
        )

        if (!data?.status || !data?.download) {
            return sendText(sock, jid, 'gagal ambil data sfile', m)
        }

        const meta = data.metadata || {}
        const fileName = meta.file_name || 'sfile-download'
        const mime = meta.mimetype || 'application/octet-stream'

        const caption = `
📁 *SFILE DOWNLOADER*

• Nama: ${meta.file_name || '-'}
• Author: ${meta.author_name || '-'}
• Upload: ${meta.upload_date || '-'}
• Download: ${meta.download_count || '-'}
`.trim()

        await sendFile(
            sock,
            jid,
            data.download,
            fileName,
            caption,
            m,
            false,
            { mimetype: mime }
        )

    } catch (e) {
        await sendText(sock, jid, `error: ${e.message}`, m)
    }
}

handler.pluginName = 'sfile'
handler.command = ['sfile']
handler.category = ['downloader']

handler.meta = {
    fileName: 'downloader-sfile.js',
    version: '1.0.0',
    author: 'Ky',
    note: 'sfile.mobi downloader'
}

export default handler