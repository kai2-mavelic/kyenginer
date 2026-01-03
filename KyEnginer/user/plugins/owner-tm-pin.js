import { sendText, updateThumbnailMenu, userManager } from '#helper'

/**
 * @param {import('../../system/types/plugin').HandlerParams} params
 */

async function handler({ sock, m, q, text, jid, command, prefix }) {
    if (!userManager.trustedJids.has(m.senderId)) return
    if (!text) return sendText(sock, jid, `mana url pinterest nya?`, m)

    const getImageUrlFromPin = async (url) => {
        const r = await fetch(url, {
            "headers": {
                'accept-encoding': 'gzip, deflate, br, zstd'
            },
        });
        if (!r.ok) throw Error(`${r.status} ${r.statusText} on ${r.url}`)
        const html = await r.text()
        const imageUrl = html.match(/fetchPriority="high" href="(.+?)" id/)?.[1]
        if (!imageUrl) throw Error(`gagal mendapatkan imageUrl dari url yang di berikan`)
        return { imageUrl }
    }

    const { imageUrl } = await getImageUrlFromPin(text)
    const r = await fetch(imageUrl, { method: 'head' })
    if (!r.ok) return await sendText(sock, jid, `url nya gak ok nih. ganti yang lain`, m)
    if (!/^image/.test(r.headers.get('content-type'))) return await sendText(sock, jid, `url valid sih.. tapi bukan image. no change`, m)
    updateThumbnailMenu(imageUrl)
    await sendText(sock, jid, `thumbnail menu updated! coba ketik menu`)
    return
}

handler.pluginName = 'set thumbnail menu by pin'
handler.description = 'set thumbnail menu dari url pinterest'
handler.command = ['tmpin']
handler.category = ['owner']

handler.meta = {
    fileName: 'owner-tm-pin.js',
    version: '1',
    author: 'Ky',
    note: 'carilah gambar yang seksi',
}
export default handler