import {
tag,
sendImage,
botInfo
} from '#helper'

async function handler({ sock, jid, m }) {
    const api = 'https://api.deline.web.id/random/ba'
    return await sendImage(sock, jid, api, `ini blue archive nya kak ${tag(m.senderId)}`, m)
}

handler.pluginName = 'random blue archive'
handler.command = ['ba']
handler.category = ['random']
handler.deskripsi = 'random image blue archive using api'
handler.meta = {
    fileName: 'random-blue-archive.js',
    version: '1',
    author: botInfo.an,
    note: 'ngentod'
}
export default handler