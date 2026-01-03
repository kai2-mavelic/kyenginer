import axios from 'axios'
import { tag, sendText, sendImage } from '#helper'

async function handler({ jid, m, text, sock }) {
    if (!text)
        return sendText(
            sock,
            jid,
            'pakai: nsfw <1-69>\ncontoh: nsfw 1',
            m
        )

    const cat = parseInt(text)
    if (isNaN(cat) || cat < 1 || cat > 69)
        return sendText(
            sock,
            jid,
            'kategori harus angka 1 - 69',
            m
        )

    try {
        const { data } = await axios.get(
            `https://api.deline.web.id/nsfw?cat=${cat}`
        )

        if (!data?.status || !data?.url)
            return sendText(
                sock,
                jid,
                'gagal ambil data nsfw',
                m
            )

        return await sendImage(
            jid,
            data.url,
            `ini nsfw kategori *${cat}* kak ${tag(m.senderId)}`,
            m
        )

    } catch (e) {
        return sendText(
            sock,
            jid,
            String(e.message),
            m
        )
    }
}

handler.pluginName = 'random nsfw by category'
handler.command = ['nsfw']
handler.category = ['random']
handler.deskripsi = 'random nsfw image by category (1-69)'
handler.meta = {
  fileName: 'random-nsfw.js',
  version: '1',
  author: 'Ky',
  note: 'selamat ngocok yh'
}

export default handler