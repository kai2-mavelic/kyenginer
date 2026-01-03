import fetch from 'node-fetch'
import {
  sendText
} from '#helper'
import {
  generateWAMessage,
  generateWAMessageFromContent,
  jidNormalizedUser
} from 'baileys'
import { randomBytes } from 'crypto'

async function googleSearchImage(query) {
  if (!query) throw Error('kata pencarian tidak boleh kosong')

  const usp = {
    as_st: 'y',
    as_q: query,
    imgsz: 'l',
    imgtype: 'jpg',
    udm: '2'
  }

  const headers = {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
  }

  const res = await fetch(
    'https://www.google.com/search?' +
      new URLSearchParams(usp).toString(),
    { headers }
  )

  if (!res.ok)
    throw Error(`gagal hit api ${res.status}`)

  const html = await res.text()
  const match = html.match(/var m=(.*?);var a=m/)?.[1]
  if (!match) throw Error('no match found')

  const json = JSON.parse(match)

  const images = Object.entries(json)
    .filter(v => v[1]?.[1]?.[3]?.[0])
    .map(v => ({
      title: v[1]?.[1]?.[25]?.[2003]?.[3] || '-',
      url: v[1][1][3][0],
      height: v[1][1][3][1],
      width: v[1][1][3][2]
    }))
    .filter(v => typeof v.url === 'string' && v.url.startsWith('http'))

  if (!images.length)
    throw Error(`hasil pencarian "${query}" kosong`)

  return images
}

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, text, jid, sock }) {
  if (!text) {
    return sendText(
      sock,
      jid,
      'contoh: gimage boboiboy',
      m
    )
  }

  await sock.sendMessage(jid, {
    react: { text: '🕓', key: m.key }
  })

  let images
  try {
    images = await googleSearchImage(text)
  } catch (e) {
    return sendText(sock, jid, e.message, m)
  }

  const mediaList = []
  for (const img of images) {
    if (mediaList.length >= 5) break
    mediaList.push({
      image: { url: img.url },
      caption: `*${img.title}*\n📐 ${img.width}x${img.height}`
    })
  }

  if (!mediaList.length) {
    return sendText(sock, jid, 'Tidak ada gambar valid.', m)
  }

  // album opener
  const opener = generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: {
        messageSecret: randomBytes(32)
      },
      albumMessage: {
        expectedImageCount: mediaList.length,
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

  for (const content of mediaList) {
    const msg = await generateWAMessage(jid, content, {
      upload: sock.waUploadToServer
    })

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

handler.pluginName = 'Google Image Album'
handler.description = 'Cari gambar Google'
handler.command = ['gimage']
handler.category = ['search']

handler.meta = {
  fileName: 'search-gimage-album.js',
  version: '1',
  author: 'Ky',
  note: 'gatau'
}

export default handler