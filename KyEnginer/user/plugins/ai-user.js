import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { sendText } from '#helper'

const DB_DIR = path.join('user','data')
const DB_FILE = path.join(DB_DIR,'userAi.json')

function loadDB() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR,{recursive:true})
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE,'{}')
  return JSON.parse(fs.readFileSync(DB_FILE))
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data,null,2))
}

async function handler({ m, text, command, sock, jid }) {
  const db = loadDB()
  const userId = m.senderId
  if (!db[userId]) db[userId] = { prompt:'' }

  if (command === 'setprompt') {
    if (!text) return sendText(sock,jid,'masukkan prompt misal: setprompt kamu lucu dan ramah', m)
    db[userId].prompt = text
    saveDB(db)
    return sendText(sock,jid,`✅ Prompt berhasil di set untuk kamu`, m)
  }

  if (command === 'ai') {
    if (!text) return sendText(sock,jid,'tulis sesuatu dulu', m)
    let finalPrompt = db[userId].prompt || 'kamu dingin dan singkat'
    if (userId === '61478765875329@lid') finalPrompt += ' sangat mencintai pacar banyak emoji love 💖😍🥰'

    try {
      const url = `https://api.deline.web.id/ai/openai?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(finalPrompt)}`
      const res = await axios.get(url)
      const data = res.data
      if (!data.status || !data.result) return sendText(sock,jid,'tidak ada hasil', m)
      await sendText(sock,jid,String(data.result).replace(/~/g,'').trim(), m)
    } catch(e) {
      await sendText(sock,jid,`❌ Error: ${e.response?.data?.message || e.message}`, m)
    }
  }
}

handler.command = ['setprompt','ai']
handler.category = ['ai']
handler.deskripsi = 'AI chat per user berdasarkan prompt dari setprompt'
handler.pluginName = 'userAI'
handler.meta = {
  fileName: 'ai-user.js',
  version: '3',
  author: 'Ky',
  note: 'single command ai per user'
}

export default handler