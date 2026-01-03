import {
tag,
sendImage,
botInfo
} from '#helper'

async function handler({ sock, jid, m }) {
    const api = 'https://www.ikyiizyy.my.id/random/nsfw?apikey=new'
    return await sendImage(sock, jid, api, `shiroko ga tanggung dosa ya`, m)
}

handler.pluginName = 'random nsfw'
handler.command = ['rnsfw']
handler.category = ['random']
handler.deskripsi = 'random image nsfw using api'
handler.meta = {
    fileName: 'random-image-nsfw.js',
    version: '1',
    author: botInfo.an,
    note: 'ngentod'
}
export default handler