// source by CodeGood
// share boleh, source jangan dihapus 🙏

import axios from 'axios'
import qs from 'qs'
//import * as cheerio from 'cheerio'
import { load } from 'cheerio'
import FormData from 'form-data'
import { delay } from 'baileys'
import {
  sendText,
  getBuff,
  tag,
  react
} from '#helper'
import { CookieJar } from 'tough-cookie'
import { wrapper } from 'axios-cookiejar-support'

/* ================= CONFIG ================= */
const PASSWORD = 'bagusapi2134'
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'

const jar = new CookieJar()
const client = wrapper(
  axios.create({
    jar,
    withCredentials: true,
    timeout: 30000,
    headers: { 'User-Agent': UA }
  })
)

/* ================= UTILS ================= */
const sleep = ms => new Promise(r => setTimeout(r, ms))
const rand = (n = 6) => Math.random().toString(36).slice(2, 2 + n)
const random5 = () => Math.random().toString(36).slice(2, 7)
const genEmail = () => `${rand()}@baguss.xyz`

/* ================= MEDIAFIRE CORE ================= */
async function getSecurity() {
  const res = await client.get(
    'https://www.mediafire.com/upgrade/registration.php?pid=free'
  )
  const $ = load(res.data)
  const security = $('input[name="security"]').val()
  if (!security) throw new Error('security token not found')
  return security
}

async function registerAccount(security, email) {
  const payload = qs.stringify({
    security,
    reg_first_name: 'Antwan',
    reg_last_name: 'Frami',
    reg_email: email,
    reg_display: '',
    reg_pass: PASSWORD,
    agreement: '3.25',
    pid: 'free',
    signup_continue: 'Create Account & Continue'
  })

  const res = await client.post(
    'https://www.mediafire.com/dynamic/register_gopro.php',
    payload,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  if (res.data?.status !== 'success')
    throw new Error('register gagal')

  return res.data.session_token
}

async function uploadMediaFire(buffer, filename, sessionToken) {
  const form = new FormData()
  form.append('filename', buffer, filename)
  form.append('uploadapi', 'yes')
  form.append('response_format', 'json')

  const init = await axios.post(
    `https://www.mediafire.com/api/upload/upload.php?session_token=${encodeURIComponent(sessionToken)}`,
    form,
    { headers: { ...form.getHeaders(), 'User-Agent': UA } }
  )

  const raw =
    typeof init.data === 'string'
      ? init.data
      : JSON.stringify(init.data)

  const key = raw.match(/<key>(.*?)<\/key>/i)?.[1]
  if (!key) throw new Error('upload key tidak ditemukan')

  while (true) {
    const poll = await axios.post(
      `https://www.mediafire.com/api/upload/poll_upload.php?session_token=${encodeURIComponent(sessionToken)}`,
      new URLSearchParams({
        key,
        response_format: 'json'
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    const data = poll?.data?.response?.doupload
    if (data?.status === '99') {
      const qk = data.quickkey || key
      return `https://www.mediafire.com/file/${qk}/${encodeURIComponent(filename)}`
    }
    await sleep(1500)
  }
}

/* ================= HANDLER ================= */
/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, q, jid, sock }) {
  const target = q || m
  const msg = target.message

  const isImage = msg?.imageMessage
  const isVideo = msg?.videoMessage
  const isSticker = msg?.stickerMessage
  const isDoc = msg?.documentMessage

  if (!isImage && !isVideo && !isSticker && !isDoc) {
    return sendText(sock, jid, 'mana media nya', m)
  }

  let filename = 'file'
  if (isImage) filename += '.png'
  else if (isVideo) filename += '.mp4'
  else if (isSticker) filename += '.webp'
  else if (isDoc) filename = msg.documentMessage.fileName || 'document'

  try {
    await react(sock, m, '🕒')

    const buffer = await getBuff(target)

    const email = genEmail()
    const security = await getSecurity()
    const session = await registerAccount(security, email)
    const url = await uploadMediaFire(buffer, filename, session)

    await sendText(
      sock,
      jid,
      `${tag(m.senderId)} upload selesai ✅
📁 ${filename}
🔗 ${url}

— CodeGood`,
      target
    )

    await delay(1200)
    await react(sock, m, '✅')
  } catch (e) {
    await sendText(sock, jid, `error: ${e.message}`, m)
    await react(sock, m, '❌')
  }
}

/* ================= META ================= */
handler.pluginName = 'mediafire upload'
handler.description = 'upload image / video / sticker / document ke mediafire'
handler.command = ['upmf']
handler.category = ['uploader']

handler.meta = {
  fileName: 'upload-mediafire.js',
  version: '1.0.0',
  author: 'ky',
  note: 'auto akun mediafire, support document'
}

export default handler