import { vString } from './general-helper.js'
import fetch from 'node-fetch'
import {
    downloadMediaMessage, getContentType } from 'baileys'
import crypto from 'crypto'
import axios from 'axios'
/**
 * @param {Object} sock
 * @param {string} chatId - jid / m.chatId
 * @param {Object} media - groupStatusMessageV2.message
 * @param {Object} quoted - message reply (optional)
 */
export async function gsm(sock, chatId, media, quoted = null) {
  if (!media) throw new Error('gsm: media kosong')

  return await sock.relayMessage(
    chatId,
    media,
    quoted ? { quoted } : {}
  )
}

/**
 * @param {import('baileys').WASocket} sock
 * @param {string} jid 
 */
export async function getProfilePicture(sock, jid) {
    try {
        // sock.profilePictureUrl sudah ada di WA MD terbaru
        const url = await sock.profilePictureUrl(jid).catch(() => null)
        return url || 'https://i.ibb.co/8cF7jR3/default-pp.jpg'
    } catch (e) {
        return 'https://i.ibb.co/8cF7jR3/default-pp.jpg'
    }
}
/**
 * Kirim file dari URL / Buffer
 * @param {import('baileys').WASocket} sock
 * @param {string} jid
 * @param {string|Buffer} input
 * @param {string} fileName
 * @param {string} caption
 * @param {object} quoted
 * @param {boolean} ptt
 * @param {object} extra
 */
export async function sendFile(
    sock,
    jid,
    input,
    fileName = 'file',
    caption = '',
    quoted = null,
    ptt = false,
    extra = {}
) {
    let buffer, mime

    // kalau input URL
    if (typeof input === 'string') {
        const res = await axios.get(input, {
            responseType: 'arraybuffer'
        })
        buffer = res.data
        mime = res.headers['content-type']
    } else {
        buffer = input
        mime = extra.mimetype || 'application/octet-stream'
    }

    const type = getContentType({ mimetype: mime }) || 'document'

    const message = {
        [type]: buffer,
        mimetype: mime,
        fileName,
        caption,
        ...extra
    }

    return await sock.sendMessage(jid, message, { quoted })
}

export function genAppleId() {
  return (
    '3A' +   crypto.randomBytes(9).toString('hex').toUpperCase()
  );
}
export function vSingleEmoji(inputString) {
    if (!/^(?:\p{RGI_Emoji}|\s*)$/v.test(inputString)) {
        throw Error(`${inputString} invalid emoji, 1 emoji ajah.`)
    }
}
export async function getBuff(m) {
    return await downloadMediaMessage(m, "buffer")
}
export async function react(sock, m, text) {
    if (!m?.key) throw Error('param 1 invalid. type nya message.')
    vSingleEmoji(text)
    return await sock.sendMessage(m.key.remoteJid, {
        react: {
            text: text,
            key: m.key
        }
    })
}
export async function downloadBuffer(url) {
    const r = await fetch(url)
    if (!r.ok) throw Error(`${r.status} ${r.statusText} pas donlot buffer`)
    const ab = await r.arrayBuffer()
    const buffer = Buffer.from(ab)
    return buffer
}
export function resolveContent(input) {
    if (!input) throw new Error('resolveContent: input undefined')
    if (Buffer.isBuffer(input)) return input
    if (typeof input === 'string') return { url: input }
    return input
}
export async function sendImage(sock, jid, urlOrBuffer, caption, replyTo) {
    vString(jid, "param 1 jid")
    let content = null
    if (Buffer.isBuffer(urlOrBuffer)) {
        content = urlOrBuffer
    } else {
        vString(urlOrBuffer, "param 2 url")
        content = { url: urlOrBuffer }
    }

    return await sock.sendMessage(jid, {
        image: content,
        caption
    }, { quoted: replyTo })
}

export async function sendVideo(sock, jid, urlOrBuffer, caption, replyTo) {
    vString(jid, "param 1 jid")
    let content = null
    if (Buffer.isBuffer(urlOrBuffer)) {
        content = urlOrBuffer
    } else {
        vString(urlOrBuffer, "param 2 url")
        content = { url: urlOrBuffer }
    }

    return await sock.sendMessage(jid, {
        video: content,
        caption
    }, { quoted: replyTo })
}
export async function sendFancyMp3(
  sock,
  jid,
  audioInput,
  title = '(empty)',
  body = '(empty)',
  thumbnailUrlOrBuffer = '',
  renderSmallThumbnail = false,
  replyTo
) {
  vString(jid, "param 1 jid")

  if (!audioInput) {
    throw new Error('sendFancyMp3: audioInput is undefined or null')
  }

  const content = resolveContent(audioInput)

  let thumbnailContent = {}
  if (Buffer.isBuffer(thumbnailUrlOrBuffer)) {
    thumbnailContent = { thumbnail: thumbnailUrlOrBuffer }
  } else {
    thumbnailContent = { thumbnailUrl: thumbnailUrlOrBuffer || '' }
  }

  const externalAdReply = {
    title,
    body,
    mediaType: 1,
    renderLargerThumbnail: !renderSmallThumbnail,
    ...thumbnailContent
  }

  return sock.sendMessage(
    jid,
    {
      audio: content,
      mimetype: 'audio/mpeg',
      contextInfo: { externalAdReply }
    },
    { quoted: replyTo }
  )
}

export async function sendText(sock, jid, text, replyTo) {
  return await sock.sendMessage(
    jid,
    { text },
    {
      quoted: replyTo,
      messageId: genAppleId()
    }
  )
}

export async function editText(sock, jid, m, text) {
    vString(jid, "param jid")
    vString(jid, "param text")
    return await sock.sendMessage(jid, {
        text,
        edit: m.key
    })
}

// thumbnail
export async function sendFancyText(sock, jid, opts = {thumbnailUrlOrBuffer, renderLargerThumbnail, title, body, text, replyTo}) {
    vString(jid, "param jid")

    const {
        thumbnailUrlOrBuffer = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj8Jf0AJ4g-4_jHICkPf_9EpaUHjZowQnx-WNJBPgJbuAJoZf0S8prMdhsF4EiB5PeVZ52o2y7oiTMN7NVuAkkMQzVMXKBzGt1-5eGb2oWyW4sKrVHZBrzVMd-CMdHszvH9QRCDhoeQe5qqD2AJVMQUEmISh2VjAphGLpXvoaEsOmjZT7hv7zlwIgoLTXc/s16000/angelina_thumbnail_480p.webp',
        renderLargerThumbnail = true,
        title = 'title',
        body = 'subtitle',
        text = 'message',
    } = opts


    // resolve (thumbnail)

    let thumbnailContent = {}
    if (Buffer.isBuffer(thumbnailUrlOrBuffer)) {
        thumbnailContent = { thumbnail: thumbnailUrlOrBuffer }
    } else {
        const url = thumbnailUrlOrBuffer || value.thumbnailUrl
        thumbnailContent = { thumbnailUrl: url }
    }

    let externalAdReply = {
        title,
        body,
        mediaType: 1,
        renderLargerThumbnail,
    }

    externalAdReply = Object.assign(externalAdReply, thumbnailContent)

    return await sock.sendMessage(jid, {
        text: text,
        contextInfo: { externalAdReply }
    }, { quoted: opts?.replyTo })
}