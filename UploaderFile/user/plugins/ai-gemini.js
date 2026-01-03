import axios from 'axios'
import { sendText, react } from '#helper'

const SESSION = new Map()

async function geminiAI({ message, instruction = '', sessionId = null }) {
  if (!message) throw new Error('message kosong')

  let resumeArray = null
  let cookie = null
  let savedInstruction = instruction

  if (sessionId) {
    try {
      const parsed = JSON.parse(
        Buffer.from(sessionId, 'base64').toString()
      )
      resumeArray = parsed.resumeArray
      cookie = parsed.cookie
      savedInstruction = parsed.instruction || instruction
    } catch {}
  }

  if (!cookie) {
    const init = await axios.post(
      'https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc',
      'f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&',
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
      }
    )
    cookie = init.headers['set-cookie']?.[0]?.split('; ')[0] || ''
  }

  const requestBody = [
    [message, 0, null, null, null, null, 0],
    ['en-US'],
    resumeArray || ['', '', '', null, null, null, null, null, null, ''],
    null,
    null,
    null,
    [1],
    1,
    null,
    null,
    1,
    0,
    null,
    null,
    null,
    null,
    null,
    [[0]],
    1,
    null,
    null,
    null,
    null,
    null,
    [
      '',
      '',
      savedInstruction,
      null,
      null,
      null,
      null,
      null,
      0,
      null,
      1,
      null,
      null,
      null,
      []
    ]
  ]

  const payload = [null, JSON.stringify(requestBody)]

  const { data } = await axios.post(
    'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate',
    new URLSearchParams({ 'f.req': JSON.stringify(payload) }).toString(),
    {
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        cookie
      }
    }
  )

  const blocks = Array.from(data.matchAll(/^\d+\n(.+?)\n/gm))
  if (!blocks.length) throw new Error('response kosong')

  let parsed = null

  for (const block of blocks.reverse()) {
    try {
      const raw = JSON.parse(block[1])
      if (raw?.[0]?.[2]) {
        parsed = JSON.parse(raw[0][2])
        break
      }
    } catch {}
  }

  if (!parsed) throw new Error('gagal parsing response')

  const newResume = [...parsed[1], parsed[4][0][0]]
  const text = parsed[4][0][1][0]
    .replace(/\*\*(.+?)\*\*/g, '*$1*')

  const newSessionId = Buffer.from(
    JSON.stringify({
      resumeArray: newResume,
      cookie,
      instruction: savedInstruction
    })
  ).toString('base64')

  return { text, sessionId: newSessionId }
}

async function handler({ m, text, jid, sock }) {
  if (!text)
    return sendText(sock, jid, 'masukkan teks', m)

  try {
    await react(sock, m, '⏳')

    const userId = m.senderId
    const lastSession = SESSION.get(userId)

    const result = await geminiAI({
      message: text,
      instruction:
        'Kamu adalah Shiroko, asisten AI yang ceria, ramah, dan penuh semangat. ' +
        'Gunakan bahasa Indonesia santai, hangat, dan enak dibaca. ' +
        'Jawaban harus jelas, informatif, dan friendly. ' +
        'Sesekali boleh pakai emoji ringan yang relevan 😊✨',
      sessionId: lastSession
    })

    if (!result?.text)
      return sendText(sock, jid, 'tidak ada respon', m)

    SESSION.set(userId, result.sessionId)

    await sendText(sock, jid, result.text, m)
    await react(sock, m, '✅')
  } catch (e) {
    await sendText(sock, jid, `error: ${e.message}`, m)
    await react(sock, m, '⚠️')
  }
}

handler.pluginName = 'gemini ai'
handler.command = ['gemini']
handler.category = ['ai']
handler.deskripsi = 'Gemini AI dengan session panjang (fixed parsing)'

handler.meta = {
  fileName: 'ai-gemini.js',
  version: '1.0.1',
  author: 'Ky',
  note: 'stable parsing + long session'
}

export default handler