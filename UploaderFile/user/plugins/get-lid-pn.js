import { store, sendText, botInfo, tag } from '#helper';
import { generateWAMessage, generateWAMessageContent, generateWAMessageFromContent } from 'baileys';

/**
 * @param {import('../../system/types/plugin').HandlerParams} params
 */

async function handler({ sock, m, q, text, jid, command, prefix }) {

    const gm = await store.getGroupMetadata(jid)
    if (!gm) return await sendText(sock, jid, `store belum siap, coba lagi`, m)
    const mese = q || m

    const lookupPn = (gm, lid) => gm.participants.find(p => p.id === lid)?.phoneNumber
    const pn = lookupPn(gm, mese.senderId)

    const wmc = generateWAMessageFromContent(jid, {
        interactiveMessage: {
            contextInfo: { mentionedJid: [mese.senderId] },
            body: {
                text:
                    `name\n${mese.pushName || '(unknown)'}\n` +
                    `tag : ${tag(mese.senderId)}`

            },
            footer: { text: 'use button below to copy' },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "cta_copy",
                        buttonParamsJson: JSON.stringify({
                            display_text: "Copy LID",
                            copy_code: mese.senderId
                        })
                    },
                    {
                        name: "cta_copy",
                        buttonParamsJson: JSON.stringify({
                            display_text: "Copy PN",
                            copy_code: pn
                        })
                    },
                ]

            },
        },
    }, { quoted: m })

    return await sock.relayMessage(
        jid,
        wmc.message,
        {

            additionalNodes: [
                {
                    tag: "biz",
                    attrs: {},
                    content: [
                        {
                            tag: "interactive",
                            attrs: { type: "native_flow", v: "1" },
                            content: [
                                {
                                    tag: "native_flow",
                                    attrs: { v: "9", name: "cta_copy" }
                                }
                            ]
                        }
                    ]
                }
            ],
            messageId : wmc.key.id

        }
    );
}

handler.pluginName = 'get lid'
handler.description = 'get lid by typing command or quoted'
handler.command = ['lid', 'pn']
handler.category = ['get']

handler.meta = {
    fileName: 'get-lid-pn.js',
    version: '1',
    author: 'wolep',
    note: 'lid lid lid',
}
export default handler