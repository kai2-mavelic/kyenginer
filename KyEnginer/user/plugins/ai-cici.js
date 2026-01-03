import axios from 'axios'
import { sendText, textOnlyMessage } from '#helper'

/**
 * @param {import('../../system/types/plugin').HandlerParams} params
 */
async function handler({ sock, m, q, text, jid, command, prefix }) {
    if (!textOnlyMessage(m)) return
    if (!text) return await sendText(sock, jid, 'Tolong tulis pertanyaanmu setelah command', m)

    try {
        // Panggil API NexRay AI
        const res = await axios.get('https://api.nexray.web.id/ai/cici', {
            params: { text }
        })
        if (res.data && res.data.status) {
            const reply = `🤖 *AI Response:*\n${res.data.result}`
            return await sendText(sock, jid, reply, m)
        } else {
            return await sendText(sock, jid, 'AI sedang error atau tidak merespon', m)
        }
    } catch (err) {
        console.error(err)
        return await sendText(sock, jid, 'Terjadi error saat memanggil AI', m)
    }
}

handler.pluginName = 'ciciAI'
handler.description = 'Tanya AI NexRay Cici'
handler.command = ['cici']
handler.category = ['ai']

handler.meta = {
    fileName: 'ai-cici.js',
    version: '1.0',
    author: 'Kadz',
    note: 'Plugin AI chat NexRay Cici',
}

export default handler