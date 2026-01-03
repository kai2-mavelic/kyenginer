import { textOnlyMessage, sendText } from '#helper'

/**
 * @param {import('../types/plugin.js').HandlerParams} params
 */
async function handler({ sock, m, jid }) {
    if (!textOnlyMessage(m)) return

    const q = m.text?.split(' ').slice(1).join(' ')?.trim()
    if (!q) {
        return sendText(sock, jid, "mana link ch nya", m)
    }

    if (!q.includes('https://whatsapp.com/channel/')) {
        return sock.sendMessage(jid, {
            text: '⚠️ Link channel tidak valid!'
        }, { quoted: m })
    }

    try {
       
        const channelCode = q.split('https://whatsapp.com/channel/')[1].trim()

        
        const res = await sock.newsletterMetadata('invite', channelCode)
        if (!res?.id) {
            return sock.sendMessage(jid, {
                text: '❌ Gagal mengambil informasi channel.'
            }, { quoted: m })
        }

        const channelId = res.id

      
        await sock.relayMessage(
            jid,
            {
                interactiveMessage: {
                    body: {
                        text:
                            `✅ *Berhasil mengambil ID Channel!*\n\n` +
                            `🆔 ID:\n${channelId}`
                    },
                    footer: { text: 'Shiroko' },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'Salin ID Channel',
                                    copy_code: channelId
                                })
                            },
                            {
                                name: 'cta_url',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'Buka Channel',
                                    url: q
                                })
                            }
                        ]
                    }
                }
            },
            {
                quoted: m,
                additionalNodes: [
                    {
                        tag: 'biz',
                        attrs: {},
                        content: [
                            {
                                tag: 'interactive',
                                attrs: { type: 'native_flow', v: '1' },
                                content: [
                                    {
                                        tag: 'native_flow',
                                        attrs: { v: '9', name: 'cta_copy' }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        )

    } catch (e) {
        console.error('[cekidch ERROR]', e)
        await sock.sendMessage(jid, {
            text: '⚠️ Terjadi kesalahan saat mengambil informasi channel.'
        }, { quoted: m })
    }
}

handler.pluginName = 'cekidch beton'
handler.command = ['cekidch']
handler.category = ['tools']

handler.meta = {
    fileName: 'tools-cekidch.js',
    version: '1.1.0',
    author: 'Ky',
    note: 'ini testing button jir'
}

export default handler