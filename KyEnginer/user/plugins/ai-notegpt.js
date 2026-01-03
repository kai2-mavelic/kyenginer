import axios from 'axios'
import { sendText, react } from '#helper'

async function notegptAI(message) {
    if (!message) throw new Error('Message is required')

    const response = await axios.post(
        'https://notegpt.io/api/v2/chat/stream',
        {
            message: message,
            language: 'ace',
            model: 'deepseek-reasoner',
            tone: 'default',
            length: 'moderate',
            conversation_id: '641eed40-0865-4dcf-9b90-39c868e4b710'
        },
        {
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'stream'
        }
    )

    return new Promise((resolve, reject) => {
        let resultText = ''

        response.data.on('data', chunk => {
            const lines = chunk.toString().split('\n')
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const payload = line.replace(/^data:\s*/, '')
                    if (payload === '[DONE]') continue

                    try {
                        const parsed = JSON.parse(payload)
                        if (parsed.text) resultText += parsed.text
                    } catch {}
                }
            }
        })

        response.data.on('end', () => resolve(resultText.trim()))
        response.data.on('error', reject)
    })
}

async function handler({ m, text, jid, sock }) {
    if (!text)
        return sendText(
            sock,
            jid,
            'masukkan teks',
            m
        )

    if (text.includes('~'))
        return sendText(sock, jid, 'karakter ~ tidak diperbolehkan', m)

    try {
        await react(sock, m, '⏳')

        const hasil = await notegptAI(text)

        if (!hasil)
            return sendText(sock, jid, 'tidak ada hasil', m)

        await sendText(sock, jid, hasil.replace(/~/g, ''), m)
        await react(sock, m, '✅')

    } catch (error) {
        await sendText(
            sock,
            jid,
            `terjadi kesalahan ${error.message}`,
            m
        )
        await react(sock, m, "⚠️")
    }
}

handler.pluginName = 'notegpt'
handler.command = ['notegpt']
handler.category = ['ai']
handler.deskripsi = 'deepseek r1 via notegpt'

handler.meta = {
    fileName: 'ai-notegpt.js',
    version: '1.0.0',
    author: 'Ky',
    note: 'streaming response'
}

export default handler