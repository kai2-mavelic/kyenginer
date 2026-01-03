import axios from 'axios'
import {
  sendText
} from '#helper'
import {
  generateWAMessage,
  generateWAMessageFromContent,
  jidNormalizedUser
} from 'baileys'
import { randomBytes } from 'crypto'

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
  Referer: 'https://www.pixiv.net/',
  'Accept-Language': 'en-US,en;q=0.9'
}

// search
const pixivSearch = async (query, mode = 'all') => {
  try {
    const { data } = await axios.get(
      `https://www.pixiv.net/ajax/search/artworks/${encodeURIComponent(query)}?word=${encodeURIComponent(
        query
      )}&order=date_d&mode=${mode}&p=1&csw=0&s_mode=s_tag&type=illust&lang=en`,
      { headers }
    )
    return data.body?.illustManga?.data?.filter(v => v.id) || []
  } catch {
    return []
  }
}

// detail
const pixivDetail = async id => {
  try {
    const { data } = await axios.get(
      `https://www.pixiv.net/ajax/illust/${id}/pages?lang=en`,
      { headers }
    )
    return data.body.map(v =>
      v.urls.original.replace('i.pximg.net', 'i.pixiv.re')
    )
  } catch {
    return []
  }
}

// random
const pixiv = async (query, mode) => {
  const list = await pixivSearch(query, mode)
  if (!list.length) return null
  const pick = list[Math.floor(Math.random() * list.length)]
  const images = await pixivDetail(pick.id)
  return {
    title: pick.title,
    author: pick.userName,
    images
  }
}

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, text, jid, sock, prefix, command }) {
  if (!text) {
    return sendText(
      sock,
      jid,
      `pakai:\n${prefix||"" + command} <query> [all|safe|r18]\ncontoh:\n${prefix||"" + command} nahida safe`,
      m
    )
  }

  const args = text.split(' ')
  const mode = ['all', 'safe', 'r18'].includes(args.at(-1))
    ? args.pop()
    : 'all'
  const query = args.join(' ')

  await sock.sendMessage(jid, {
    react: { text: '🕓', key: m.key }
  })

  const result = await pixiv(query, mode)
  if (!result || !result.images.length) {
    return sendText(sock, jid, 'artwork tidak ditemukan.', m)
  }

  const images = result.images.slice(0, 5)

  // album opener
  const opener = generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: { messageSecret: randomBytes(32) },
      albumMessage: {
        expectedImageCount: images.length,
        expectedVideoCount: 0
      }
    },
    {
      userJid: jidNormalizedUser(sock.user.id),
      quoted: m,
      upload: sock.waUploadToServer
    }
  )

  await sock.relayMessage(jid, opener.message, {
    messageId: opener.key.id
  })

  for (let i = 0; i < images.length; i++) {
    const buffer = Buffer.from(
      (await axios.get(images[i], { responseType: 'arraybuffer' })).data
    )

    const msg = await generateWAMessage(
      jid,
      {
        image: buffer,
        caption:
          i === 0
            ? `Pixiv Result\n\nJudul: ${result.title}\nAuthor: ${result.author}\nMode: ${mode}`
            : ''
      },
      { upload: sock.waUploadToServer }
    )

    msg.message.messageContextInfo = {
      messageSecret: randomBytes(32),
      messageAssociation: {
        associationType: 1,
        parentMessageKey: opener.key
      }
    }

    await sock.relayMessage(jid, msg.message, {
      messageId: msg.key.id
    })
  }

  await sock.sendMessage(jid, {
    react: { text: null, key: m.key }
  })
}

handler.pluginName = 'pixiv'
handler.description = 'search artwork dari pixiv'
handler.command = ['pixiv']
handler.category = ['search']
handler.meta = {
  fileName: 'search-pixiv.js',
  version: '1.0.0',
  author: 'Ky',
  note: 'pixiv random search + album'
}

export default handler