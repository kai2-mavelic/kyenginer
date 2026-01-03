/*
📌 Name : MathGPT - GptAi
🏷️ Type : -
📦 Channel : https://whatsapp.com/channel/0029Vb4HHTJFCCoYgkMjn93K
📑 Note : streaming response
🔗 Base Url : https://math-gpt.org
👤 Creator : Hazel (adapted by Ky)
*/

import axios from 'axios'
import crypto from 'crypto'
import { sendText, react } from '#helper'

async function mathGPT(message) {
    if (!message) throw new Error('Message is required')

    const response = await axios.post(
        'https://math-gpt.org/api/v2/chat/completions',
        {
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: message }
                    ]
                }
            ],
            reasoningEnabled: false,
            conversationId: crypto.randomUUID()
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'x-topic': 'math'
            },
            responseType: 'stream'
        }
    )

    return new Promise((resolve, reject) => {
        let result = ''

        response.data.on('data', chunk => {
            const lines = chunk.toString().split('\n')

            for (const line of lines) {
                if (!line.startsWith('data:')) continue

                const payload = line.replace(/^data:\s*/, '')
                if (payload === '[DONE]') continue

                try {
                    const json = JSON.parse(payload)
                    const delta = json?.choices?.[0]?.delta?.content
                    if (delta) result += delta
                } catch {}
            }
        })

        response.data.on('end', () => resolve(result.trim()))
        response.data.on('error', reject)
    })
}

async function handler({ m, text, jid, sock }) {
    if (!text)
        return sendText(sock, jid, 'masukkan soal matematika', m)

    if (text.includes('~'))
        return sendText(sock, jid, 'karakter ~ tidak diperbolehkan', m)

    try {
        await react(sock, m, '⏳')

        const hasil = await mathGPT(text)

        if (!hasil)
            return sendText(sock, jid, 'tidak ada hasil', m)

        await sendText(sock, jid, hasil, m)
        await react(sock, m, '✅')

    } catch (e) {
        await sendText(
            sock,
            jid,
            `terjadi kesalahan: ${e.message}`,
            m
        )
        await react(sock, m, '⚠️')
    }
}

handler.pluginName = 'mathgpt'
handler.command = ['mathgpt']
handler.category = ['ai']
handler.deskripsi = 'AI matematika (math-gpt.org)'

handler.meta = {
    fileName: 'ai-mathgpt.js',
    version: '1.0.0',
    author: 'Ky',
    note: 'streaming response'
}

export default handler