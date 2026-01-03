import fetch from 'node-fetch'
import { sendText } from '#helper'
import { generateWAMessage, generateWAMessageFromContent, jidNormalizedUser } from 'baileys'
import { randomBytes } from 'crypto'

const ytpost = async (ytpostUrl) => {
  if (!ytpostUrl) throw Error('mana url youtube post nya >:o')
  const response = await fetch(ytpostUrl)
  if (!response.ok) throw Error(`${response.status} ${response.statusText}\n${await response.text() || null}`)
  const html = await response.text()
  const match = html.match(/ytInitialData = (.+?);</)?.[1]
  if (!match) throw Error('tidak menemukan match pada youtube post pastiin link post youtube nya benar.')
  const json = JSON.parse(match)
  let postType = null, images = null, videoShareUrl = null
  const bpr = json?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.backstagePostThreadRenderer?.post?.backstagePostRenderer
  if (!bpr) throw Error('keknya bukan post yang valid')
  const votePost = bpr?.backstageAttachment?.pollRenderer?.choices
  const multipleImagePost = bpr?.backstageAttachment?.postMultiImageRenderer?.images
  const singleImagePost = bpr?.backstageAttachment?.backstageImageRenderer?.image?.thumbnails
  const videoSharePost = bpr?.backstageAttachment?.videoRenderer?.videoId

  if (votePost) {
    let isVoteImage = false
    images = votePost.map(v => {
      const text = v.text.runs[0].text
      let url = v.image?.thumbnails || null
      if (url) { url = url.map(w => w.url).pop(); isVoteImage = true }
      return { text, url }
    })
    postType = isVoteImage ? 'voteImage' : 'voteText'
  } else if (multipleImagePost) {
    postType = 'multipleImages'
    images = multipleImagePost.map(v => ({ url: v.backstageImageRenderer.image.thumbnails.map(w => w.url).pop(), text: null }))
  } else if (singleImagePost) {
    postType = 'singleImage'
    images = [{ url: singleImagePost.map(v => v.url).pop(), text: null }]
  } else if (videoSharePost) {
    postType = 'videoShare'
    videoShareUrl = new URL(response.url).origin + videoSharePost
  } else postType = 'text'

  let tags = json?.microformat?.microformatDataRenderer?.tags || null
  if (tags) tags = tags.join(', ')
  return {
    author: bpr.authorText.runs[0].text,
    authorUrl: new URL(response.url).origin + bpr.authorEndpoint.commandMetadata.webCommandMetadata.url,
    publishTime: bpr.publishedTimeText.runs[0].text,
    publishDate: json.microformat.microformatDataRenderer.publishDate,
    tags,
    text: bpr.contentText.runs.map(v => v.text).join(''),
    like: bpr?.voteCount?.accessibility?.accessibilityData?.label || null,
    images,
    videoShareUrl,
    postUrl: json.microformat.microformatDataRenderer.urlCanonical,
    postType
  }
}

async function handler({ m, text, jid, sock }) {
  if (!text) return sendText(sock, jid, 'Kirim link YouTube Post.', m)
  await sock.sendMessage(jid, { react: { text: '🕓', key: m.key } })
  let post
  try { post = await ytpost(text) } catch (e) { return sendText(sock, jid, 'Gagal ambil YouTube Post.', m) }

  if (post.images?.length) {
    let mediaList = post.images.slice(0, 5).map(img => ({
      image: { url: img.url },
      caption: `👤 ${post.author}\n🔗 ${post.authorUrl}\n🕒 ${post.publishTime}\n❤️ ${post.like}\n\n${post.text}`
    }))
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
  } else if (post.videoShareUrl) sendText(sock, jid, `🎥 Video Share: ${post.videoShareUrl}`, m)
  else sendText(sock, jid, `📝 Post Text:\n${post.text}`, m)
  await sock.sendMessage(jid, { react: { text: null, key: m.key } })
}

handler.pluginName = 'YouTube Post 2'
handler.description = 'Scrape YouTube Post multi media / vote / video share'
handler.command = ['ytpost2']
handler.category = ['downloader']
handler.meta = { fileName: 'ytpost2.js', version: '1.0', author: 'Ky' }

export default handler