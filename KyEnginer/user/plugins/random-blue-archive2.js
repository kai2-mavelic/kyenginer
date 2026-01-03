/**
 * @param {import('../../system/types/plugin').HandlerParams} params
 */

async function handler({ sock, m, q, text, jid, command, prefix }) {
    return await sock.sendMessage(jid, {
        image: { url: "https://www.ikyiizyy.my.id/random/ba?apikey=new" },
        caption: 'ini kak ' + m.pushName
    }, {
        quoted: m
    })
}

handler.pluginName = 'random blue archive'
handler.description = 'get random blue archive image. thanks to https://www.ikyiizyy.my.id'
handler.command = ['rba']
handler.category = ['random']

handler.meta = {
    fileName: 'random-blue-archive2.js',
    version: '2',
    author: 'ky',
    note: 'jangan di pakai coli',
}
export default handler