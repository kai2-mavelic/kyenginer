import { store, sendText, botInfo, tag } from '#helper';

/**
 * @param {import('../../system/types/plugin').HandlerParams} params
 */

async function handler({ sock, m, q, text, jid, command, prefix }) {

    const gm = await store.getGroupMetadata(jid)
    if (!gm) return await sendText(sock, jid, `store belum siap, coba lagi`, m)
    const mese = q || m

    const lookupPn = (gm, lid) => gm.participants.find(p => p.id === lid)?.phoneNumber
    const pn = lookupPn(gm, mese.senderId)

    return await sock.relayMessage(
        jid,
        {
            interactiveMessage: {
                body: {
                    text:
                        `Namae:\n${mese.pushName || '(unknown)'}\nTag: ${tag(mese.senderId)}`

                },
                footer: { text: 'Izureka no botan o kurikku shite kopī shite kudasai' },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({
                                display_text: "LID o shutoku suru",
                                copy_code: mese.senderId
                            })
                        },
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({
                                display_text: "PN o shutoku suru",
                                copy_code: pn
                            })
                        },
                    ]

                },
            },

        },
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
            ]

        }
    );
}

handler.pluginName = 'get lid'
handler.description = 'get lid by typing command or quoted'
handler.command = ['me']
handler.category = ['tools']

handler.meta = {
    fileName: 'tools-lid-pn.js',
    version: '1',
    author: 'ky',
    note: 'lid lid lid',
}
export default handler