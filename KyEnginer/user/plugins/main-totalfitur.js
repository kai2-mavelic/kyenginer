import { pluginManager, sendText, botInfo } from '../../system/helper.js'

function countTotalFitur() {
    let total = 0
    for (const cmds of pluginManager.mapCatWithCmdArray.values()) {
        total += cmds.length
    }
    return total
}

/**
 * @param {import('../types/plugin.js').HandlerParams} params
 */
async function handler({ sock, jid }) {
    const total = countTotalFitur()

    return sendText(
        sock,
        jid,
        `Total Fitur ${botInfo.dn} saat ini: *${total}*`
    )
}

handler.pluginName = 'total fitur'
handler.description = 'menampilkan total seluruh fitur bot'
handler.command = ['totalfitur']
handler.category = ['main']

handler.meta = {
    fileName: 'main-totalfitur.js',
    version: '1',
    author: botInfo.an
}

export default handler