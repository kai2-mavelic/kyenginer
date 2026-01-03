import { tag, sendText, textOnlyMessage, pluginManager, userManager } from '#helper'

/**
 * @param {import('../../system/types/plugin').HandlerParams} params
 */

async function handler({ sock, m, q, text, jid, command, prefix }) {
if(!userManager.trustedJids.has(m.senderId)) return
    await pluginManager.loadPlugins()
    pluginManager.buildMenu()
    return await sock.sendMessage(jid, {text: 'Puraguin no rōdo ni seikō shimashita'},{quoted: m})
}

handler.pluginName = 'load plugin'
handler.description = 'load plugin'
handler.command = ['r']
handler.category = ['owner']

handler.meta = {
    fileName: 'owner-load-plugin.js',
    version: '1',
    author: 'ky',
    note: 'dirty quick reload plugin',
}
export default handler