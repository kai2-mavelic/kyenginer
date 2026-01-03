
/**
 * @param {import('../../system/types/plugin').HandlerParams} params
 */

async function handler({ sock, m, q, text, jid, command, prefix }) {
    if (!text) return await sock.sendMessage(jid, { text: `mau puter musik apa ${m.pushName}?` }, { quoted: m })

    // skrep ytsearch
    const youtubeSearch = async (query) => {
        if (typeof (query) !== "string" || query.length === 0) throw Error(`invalid query`)

        const headers = {
            "Accept-Encoding": "gzip, deflate, br, zstd"
        }

        const body = JSON.stringify({
            "context": {
                "client": {
                    "hl": "en", // ubah ke id kalau mau result bahasa indo
                    "gl": "ID",
                    "clientName": "WEB",
                    "clientVersion": "2.20250701.09.00",
                },
            },
            "params": "EgIQAQ%3D%3D",
            query
        });

        const response = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', { headers, body, "method": "post" })
        if (!response.ok) throw Error(`${response.status} ${response.statusText}\n${await response.text()}`)
        const json = await response.json()

        const result = json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents
            .filter(v => v?.videoRenderer?.lengthText?.simpleText).map(v => {
                const vr = v.videoRenderer
                const videoId = vr.videoId
                const obj = {
                    videoId,
                    title: vr.title.runs[0].text,
                    channel: vr.ownerText.runs[0].text,
                    url: `https://youtu.be/${videoId}`,
                    thumbnail: vr.thumbnail.thumbnails[1]?.url || vr.thumbnail.thumbnails[0]?.url,
                    duration: vr.lengthText.simpleText,
                    datePassed: vr.publishedTimeText?.simpleText || null,
                    views: vr.shortViewCountText.simpleText
                }
                return obj
            })

        if (result.length === 0) throw Error(`tidak bisa menemukan video dari keyword ${query}`)
        return result

    }

    // skrep download audio from yt
    const download = async (videoId, format = "mp3") => {
        const headers = {
            "accept-encoding": "gzip, deflate, br, zstd",
            "origin": "https://ht.flvto.online",
        }
        const body = JSON.stringify({
            "id": videoId,
            "fileType": format
        })
        const response = await fetch(`https://ht.flvto.online/converter`, { headers, body, method: "post" })
        if (!response.ok) throw Error(`${response.status} ${response.statusText}\n${await response.text()}`)
        const json = await response.json()
        return json
    }

    // your logic
    const youtubeResult = await youtubeSearch(text)

    // pick first result from yts
    const { videoId, title, channel, thumbnail, views } = youtubeResult[0]
    // get download audio url
    const { link } = await download(videoId)

    // kasih react dulu
    await sock.sendMessage(jid, { react: {key: m.key, text: '✌️'} })
    // send it
    await sock.sendMessage(jid, {
        audio: { url: link },
        mimetype: 'audio/mpeg',
        contextInfo: {
            externalAdReply: {
                renderLargerThumbnail: true,
                mediaType: 1,
                thumbnailUrl: thumbnail,
                title: title,
                body: `${channel} | ${views}`
            }
        }
    })
    await sock.sendMessage(jid, { react: {key: m.key, text: '✅'} })
    return 
}

handler.pluginName = 'youtube play'
handler.description = 'puter musik dari youtube search'
handler.command = ['ytp']
handler.category = ['main']

handler.meta = {
    fileName: 'youtube-play.js',
    version: '1',
    author: 'wolep',
    note: 'terima kasih kepada yt dan random website yang saya skrepkan T^T',
}
export default handler