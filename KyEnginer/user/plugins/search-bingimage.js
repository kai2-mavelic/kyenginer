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

const TTL_MS = 3 * 60 * 1000
const CACHE = new Map()
const BOOKMARK = new Map()

async function fetchText(url) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 15000)

  const res = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      'accept-language': 'id,en;q=0.9',
      'cache-control': 'no-cache'
    },
    signal: controller.signal
  })

  clearTimeout(t)
  if (!res.ok) throw Error(`HTTP ${res.status}`)
  return res.text()
}

function htmlUnescape(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function attrPick(tag, name) {
  const r = new RegExp(`${name}=["']([^"']+)["']`, 'i')
  return r.exec(tag)?.[1] || null
}

function guessImageName(url) {
  try {
    const u = new URL(url)
    return decodeURIComponent(u.pathname.split('/').pop())
  } catch {
    return 'image'
  }
}

async function scrapeBingPage(query, start) {
  const q = encodeURIComponent(query)
  const url = `https://www.bing.com/images/search?q=${q}&FORM=HDRSC2${start ? `&first=${start}` : ''}`
  const html = await fetchText(url)
  const out = []

  const tagRe = /<a[^>]*class=["'][^"']*\biusc\b[^"']*["'][^>]*>/gi
  for (const tag of html.match(tagRe) || []) {
    try {
      const mAttr = attrPick(tag, 'm')
      if (!mAttr) continue
      const m = JSON.parse(htmlUnescape(mAttr))
      const img = m.murl || m.imgurl
      if (!img) continue

      out.push({
        url: img,
        preview: m.turl || img,
        name: guessImageName(img)
      })
    } catch {}
  }
  return out
}

async function getBingImages(query, limit = 30) {
  const results = []
  let start = 0

  for (let i = 0; i < 3 && results.length < limit; i++) {
    const chunk = await scrapeBingPage(query, start)
    for (const r of chunk) {
      if (!results.some(v => v.url === r.url)) {
        results.push(r)
        if (results.length >= limit) break
      }
    }
    start += 35
  }
  return results
}

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, text, jid, sock }) {
  if (!text) {
    return sendText(sock, jid, 'contoh: bingimage anime girl', m)
  }

  await sock.sendMessage(jid, {
    react: { text: '🕓', key: m.key }
  })

  try {
    const query = text.trim()
    const cacheKey = `bing:${query}`
    const markKey = `${m.senderId}:${query}`
    const now = Date.now()

    let results
    const cached = CACHE.get(cacheKey)
    if (cached && now - cached.ts < TTL_MS) {
      results = cached.data
    } else {
      results = await getBingImages(query, 30)
      if (!results.length) throw Error('gambar tidak ditemukan')
      CACHE.set(cacheKey, { ts: now, data: results })
    }

    const page = BOOKMARK.get(markKey) || 0
    const limit = 5
    const slice = results.slice(page * limit, page * limit + limit)

    if (!slice.length) {
      BOOKMARK.set(markKey, 0)
      return sendText(sock, jid, 'tidak ada gambar lagi', m)
    }

    const mediaList = slice.map(img => ({
      image: { url: img.preview },
      caption: img.name
    }))

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

    BOOKMARK.set(markKey, page + 1)
  } catch (e) {
    await sendText(sock, jid, e.message, m)
  } finally {
    await sock.sendMessage(jid, {
      react: { text: null, key: m.key }
    })
  }
}

handler.pluginName = 'Bing Image Album'
handler.description = 'Cari gambar dari Bing (album)'
handler.command = ['bingimage']
handler.category = ['search']

handler.meta = {
  fileName: 'search-bingimage.js',
  version: '1',
  author: 'Ky',
  note: 'bing scraper'
}

export default handler