import {
  sendText,
  userManager,
  textOnlyMessage,
  botInfo
} from '#helper'

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
export function getSecondNow() {
    return Math.floor(Date.now() / 1000)
}

 export async function setBotLabel(sock, jid, label) {
    const payload = {
        "protocolMessage": {
            "type": 30,
            "memberLabel": {
                "label": label,
                "labelTimestamp": getSecondNow()
            }
        }
    }
    return await sock.relayMessage(jid, payload, {})
}
async function handler({ sock, m, jid, text }) {

  // owner only
  if (!userManager.trustedJids.has(m.senderId)) return
  if (!textOnlyMessage(m)) return
  if (!text?.trim())
    return await sendText(sock, jid, 'contoh: label bot ganteng', m)

  try {
    await setBotLabel(sock, jid, text.trim())

    return await sendText(
      sock,
      jid,
      `✅ label bot berhasil diubah\n\n🏷️ ${text.trim()}`,
      m
    )

  } catch (err) {
    console.error(err)
    return await sendText(
      sock,
      jid,
      `❌ gagal set label\n\n${err.message}`,
      m
    )
  }
}

handler.pluginName = 'set bot label'
handler.description = 'mengatur label bot'
handler.command = ['label']
handler.category = ['owner']

handler.meta = {
  fileName: 'owner-set-label.js',
  version: '1.0.0',
  author: botInfo.an,
  note: 'protocolMessage type 30'
}

export default handler