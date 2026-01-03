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

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, text, jid, sock, prefix, command }) {
  if (!text) {
    return sendText(
      sock,
      jid,
      `mau cari siapa?`,
      m
    )
  }

  await sock.sendMessage(jid, {
    react: { text: '🕓', key: m.key }
  })

  let urls = []
  try {
    const url =
      'https://www.pinterest.com/resource/BaseSearchResource/get/?data=' +
      encodeURIComponent(
        JSON.stringify({
          options: { query: encodeURIComponent(text) }
        })
      )

    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'screen-dpr': '4',
        'x-pinterest-pws-handler': 'www/search/[scope].js'
      }
    })

    if (!res.ok) throw new Error(`Error ${res.status}`)

    const linkHeader = res.headers.get('Link')
    if (!linkHeader) throw new Error(`Hasil kosong untuk "${text}"`)

    urls = [...linkHeader.matchAll(/<(.*?)>/gm)].map(v => v[1])
  } catch (e) {
    return sendText(sock, jid, String(e.message), m)
  }

  const mediaList = []
  for (let url of urls) {
    if (mediaList.length >= 5) break
    try {
      const r = await fetch(url, { redirect: 'follow' })
      const type = r.headers.get('content-type') || ''
      if (!type.startsWith('image/')) continue

      const buffer = Buffer.from(await r.arrayBuffer())
      mediaList.push({
        image: buffer,
        caption: `Pinterest Result\nQuery: ${text}`
      })
    } catch {}
  }

  if (!mediaList.length) {
    return sendText(sock, jid, 'Tidak ada gambar valid.', m)
  }

  // album opener
  const opener = generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: { messageSecret: randomBytes(32) },
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

  // kirim isi album
  for (let content of mediaList) {
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

handler.pluginName = 'pinterest'
handler.description = 'search gambar dari pinterest'
handler.command = ['pin']
handler.category = ['search']

handler.meta = {
  fileName: 'search-pinterest.js',
  version: '1',
  author: 'Ky',
  note: 'cari gambar'
}

export default handler