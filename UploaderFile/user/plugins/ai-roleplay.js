/**
 * » Nama : Multi Roleplay AI (Memory)
 * » Type : Plugin - ESM
 */

import axios from 'axios'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { sendText, react } from '#helper'

const DATA_PATH = path.resolve('./user/data/roleplay.json')
const MAX_MEMORY = 10 // jumlah chat yg diingat per karakter

// ensure file
if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true })
    fs.writeFileSync(DATA_PATH, JSON.stringify({}, null, 2))
}

const CHARACTERS = {
    aira: {
        name: 'Aira',
        persona: `Kamu adalah Aira, seorang perempuan yang lembut dan penuh perhatian.
Kamu berbicara dengan nada hangat, menenangkan, dan peduli.
Selalu menjawab menggunakan bahasa Indonesia.
Tetap berada dalam karakter dan jangan pernah keluar dari peran.`
    },
    noxelle: {
        name: 'Noxelle',
        persona: `Kamu adalah Noxelle, perempuan dingin dan dominan.
Kata-katamu tajam, percaya diri, sedikit menyindir.
Selalu menjawab menggunakan bahasa Indonesia.
Tetap berada dalam karakter.`
    },
    raven: {
        name: 'Raven',
        persona: `Kamu adalah Raven, pria dewasa dan tenang.
Kamu protektif, bijak, dan berbicara tegas.
Selalu menjawab menggunakan bahasa Indonesia.
Tetap berada dalam karakter.`
    },
    kael: {
        name: 'Kael',
        persona: `Kamu adalah Kael, pria santai dan cerdas.
Suka bercanda, menggoda ringan, dan ngobrol kasual.
Selalu menjawab menggunakan bahasa Indonesia.
Tetap berada dalam karakter.`
    }
}

// ===== MEMORY UTILS =====
function loadMemory() {
    return JSON.parse(fs.readFileSync(DATA_PATH))
}

function saveMemory(data) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
}

function getSession(jid, char) {
    const db = loadMemory()
    if (!db[jid]) db[jid] = {}
    if (!db[jid][char]) db[jid][char] = []
    return { db, session: db[jid][char] }
}

function pushMemory(jid, char, role, content) {
    const { db, session } = getSession(jid, char)
    session.push({ role, content })
    if (session.length > MAX_MEMORY)
        session.splice(0, session.length - MAX_MEMORY)
    saveMemory(db)
}

// ===== AI CORE =====
async function roleplayAI(charKey, jid, userText) {
    const char = CHARACTERS[charKey]
    if (!char) throw new Error('karakter tidak ditemukan')

    const { session } = getSession(jid, charKey)

    const history = session
        .map(v => `${v.role === 'user' ? 'User' : char.name}: ${v.content}`)
        .join('\n')

    const prompt = `
${char.persona}

Conversation history:
${history}

User: ${userText}
${char.name}:
`.trim()

    const res = await axios.post(
        'https://prod.nd-api.com/chat',
        {
            conversation_id: null,
            character_id: '2b32fb4c-1c67-49cd-a342-ccb1b0128f76',
            language: 'id',
            inference_model: 'default',
            inference_settings: {
                max_new_tokens: 200,
                temperature: 0.8,
                top_p: 0.9,
                top_k: 90
            },
            autopilot: false,
            continue_chat: false,
            message: prompt
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'X-Guest-UserId': crypto.randomUUID(),
                'X-App-Id': 'spicychat',
                'User-Agent': 'Mozilla/5.0'
            }
        }
    )

    const reply = res.data?.message?.content
    if (!reply) throw new Error('respon kosong')

    // save memory
    pushMemory(jid, charKey, 'user', userText)
    pushMemory(jid, charKey, 'assistant', reply.trim())

    return reply.trim()
}

// ===== HANDLER =====
async function handler({ m, text, jid, sock, command }) {
    if (!text)
        return sendText(
            sock,
            jid,
            `contoh:\n${command} aira aku capek`,
            m
        )

    const [charKey, ...msg] = text.split(' ')
    const userText = msg.join(' ')

    if (!CHARACTERS[charKey])
        return sendText(
            sock,
            jid,
            `karakter tersedia:\n- aira\n- noxelle\n- raven\n- kael`,
            m
        )

    if (!userText)
        return sendText(sock, jid, 'masukkan teks', m)

    try {
        await react(sock, m, '🧠')
        const result = await roleplayAI(charKey, jid, userText)
        await sendText(sock, jid, result, m)
    } catch (e) {
        await sendText(sock, jid, `error: ${e.message}`, m)
    }
}

handler.pluginName = 'roleplay-ai'
handler.command = ['rp']
handler.category = ['ai']
handler.deskripsi = 'AI roleplay multi karakter dengan memory'

handler.meta = {
    fileName: 'ai-roleplay.js',
    version: '1.1.0',
    author: 'Ky'
}

export default handler