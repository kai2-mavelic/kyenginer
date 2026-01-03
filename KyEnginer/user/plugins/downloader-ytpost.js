import fetch from 'node-fetch'
import { sendText } from '#helper'
import { generateWAMessage, generateWAMessageFromContent, jidNormalizedUser } from 'baileys'
import { randomBytes } from 'crypto'

async function scrapeYTPost(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36'
    }
  })
  const html = await res.text()
  const match = html.match(/var ytInitialData = (.*?);<\/script>/s)
  if (!match) throw new Error('ytInitialData not found')
  const data = JSON.parse(match[1])
  const post =
    data.contents.twoColumnBrowseResultsRenderer.tabs[0]
      .tabRenderer.content.sectionListRenderer.contents[0]
      .itemSectionRenderer.contents[0]
      .backstagePostThreadRenderer.post.backstagePostRenderer
  const author = post.authorText.runs[0].text
  const authorUrl = 'https://youtube.com' + post.authorEndpoint.commandMetadata.webCommandMetadata.url
  const content = post.contentText?.runs?.map(r => r.text).join('') || ''
  const published = post.publishedTimeText?.runs?.[0]?.text || ''
  const likes = post.voteCount?.simpleText || '0'
  let images = []
  const attachment = post.backstageAttachment
  if (attachment?.postMultiImageRenderer?.images?.length) {
    images = attachment.postMultiImageRenderer.images.map(i => i.backstageImageRenderer.image.thumbnails.at(-1).url)
  } else if (attachment?.backstageImageRenderer?.images?.length) {
    images = attachment.backstageImageRenderer.images.map(i => i.image.thumbnails.at(-1).url)
  } else if (attachment?.backstageImageRenderer?.image?.thumbnails?.length) {
    images = [attachment.backstageImageRenderer.image.thumbnails.at(-1).url]
  }
  return { author, authorUrl, content, published, likes, images }
}

async function handler({ m, text, jid, sock }) {
  if (!text) return sendText(sock, jid, 'Kirim link YouTube Post.', m)
  await sock.sendMessage(jid, { react: { text: '🕓', key: m.key } })

  let post
  try { post = await scrapeYTPost(text) }
  catch (e) { return sendText(sock, 'Gagal ambil YouTube Post.', m) }

  let mediaList = []
  for (const img of post.images) {
    if (mediaList.length >= 5) break
    mediaList.push({
      image: { url: img },
      caption: `👤 ${post.author}\n🔗 ${post.authorUrl}\n🕒 ${post.published}\n❤️ ${post.likes}\n\n${post.content}`
    })
  }

  if (!mediaList.length) return sendText(sock, jid, 'Tidak ada gambar valid.', m)

  const opener = generateWAMessageFromContent(
    jid,
    { messageContextInfo: { messageSecret: randomBytes(32) }, albumMessage: { expectedImageCount: mediaList.length, expectedVideoCount: 0 } },
    { userJid: jidNormalizedUser(sock.user.id), quoted: m, upload: sock.waUploadToServer }
  )
  await sock.relayMessage(jid, opener.message, { messageId: opener.key.id })

  for (const content of mediaList) {
    const msg = await generateWAMessage(jid, content, { upload: sock.waUploadToServer })
    msg.message.messageContextInfo = { messageSecret: randomBytes(32), messageAssociation: { associationType: 1, parentMessageKey: opener.key } }
    await sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
  }

  await sock.sendMessage(jid, { react: { text: null, key: m.key } })
}

handler.pluginName = 'YouTube Post Album'
handler.description = 'Scrape YouTube Post multi-image album'
handler.command = ['ytpost']
handler.category = ['downloader']
handler.meta = {
fileName: 'downloader-ytpost.js', version: '1.0', 
author: 'Ky'
 }

export default handler