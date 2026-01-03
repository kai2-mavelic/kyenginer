/**
 * » Nama : DEEP AI (chat-deep.ai)
 * » Type : Plugin - ESM
 * » Author : Ky (adapted)
 */

import axios from 'axios'
import FormData from 'form-data'
import { sendText, react } from '#helper'

async function getNonce() {
    try {
        const res = await axios.get('https://chat-deep.ai/deepseek-chat/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
            }
        })
        const html = res.data
        const match = html.match(/nonce["']?\s*[:=]\s*["']([^"']+)["']/i)
        return match ? match[1] : null
    } catch {
        return null
    }
}

async function deepAI(text) {
    const nonce = await getNonce()
    if (!nonce) throw new Error('gagal mengambil nonce')

    const form = new FormData()
    form.append('action', 'deepseek_chat')
    form.append('message', text)
    form.append('model', 'deepseek-chat')
    form.append('nonce', nonce)
    form.append('save_conversation', '0')
    form.append('session_only', '1')

    const res = await axios.post(
        'https://chat-deep.ai/wp-admin/admin-ajax.php',
        form,
        {
            headers: {
                ...form.getHeaders(),
                'Origin': 'https://chat-deep.ai',
                'Referer': 'https://chat-deep.ai/deepseek-chat/',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
            }
        }
    )

    if (!res.data?.success) {
        throw new Error(res.data?.data?.message || 'respon gagal')
    }

    let output = res.data.data.response || ''
    output = output.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
    return output
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
        return sendText(
            sock,
            jid,
            'karakter ~ tidak diperbolehkan',
            m
        )

    try {
        await react(sock, m, '☕')

        const result = await deepAI(text)
        await sendText(sock, jid, result, m)

    } catch (e) {
        await sendText(
            sock,
            jid,
            `terjadi kesalahan: ${e.message}`,
            m
        )
    }
}

handler.pluginName = 'deep-ai'
handler.command = ['deepai', 'deep']
handler.category = ['ai']
handler.deskripsi = 'chat ai dari chat-deep.ai'

handler.meta = {
    fileName: 'ai-deep.js',
    version: '1.0.0',
    author: 'Ky',
    note: 'nonce based'
}

export default handler