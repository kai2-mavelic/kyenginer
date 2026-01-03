import axios from 'axios'
import FormData from 'form-data'
import { delay } from 'baileys'
import {
  sendText,
  getBuff,
  tag,
  react
} from '#helper'

/**
 * @param {Buffer} buffer
 * @param {string} ext
 */
const uploadCloudKu = async (buffer, ext) => {
  const form = new FormData()
  form.append('file', buffer, { filename: `file.${ext}` })

  const res = await axios.post(
    'https://cloudkuimages.guru/upload.php',
    form,
    { headers: form.getHeaders() }
  )

  const url = res.data?.data?.url
  if (!url) throw new Error('CloudKu upload gagal')
  return url
}

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, q, jid, sock }) {
  const target = q || m
  const msg = target.message

  const isImage = msg?.imageMessage
  const isVideo = msg?.videoMessage
  const isSticker = msg?.stickerMessage

  if (!isImage && !isVideo && !isSticker) {
    return sendText(sock, jid, 'mana media nya', m)
  }

  let ext = 'bin'
  if (isImage) ext = 'png'
  else if (isVideo) ext = 'mp4'
  else if (isSticker) ext = 'webp'

  try {
    await react(sock, m, '🕒')

    const buffer = await getBuff(target)
    const url = await uploadCloudKu(buffer, ext)

    await sock.relayMessage(
      jid,
      {
        interactiveMessage: {
          body: {
            text:
              `✅ *yeyy berhasilll ><*\n\n` +
              `📄 File: ${ext}\n` +
              `🔗 ${url}`
          },
          footer: { text: "Shiroko" },
          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "salin nih kalo males mencet link",
                  copy_code: url
                })
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "liyat media nya mau? :v",
                  url: url
                })
              }
            ]
          }
        }
      },
      {
        quoted: m,
        additionalNodes: [
          {
            tag: "biz",
            attrs: {},
            content: [
              {
                tag: "interactive",
                attrs: { type: "native_flow", v: "1" },
                content: [
                  {
                    tag: "native_flow",
                    attrs: { v: "9", name: "cta_copy" }
                  }
                ]
              }
            ]
          }
        ]
      }
    )

    await delay(1500)
    await react(sock, m, '✅')
  } catch (e) {
    await sendText(sock, jid, e.message, m)
  }
}

handler.pluginName = 'cloudku upload'
handler.description = 'upload image / video / sticker ke CloudKu'
handler.command = ['cloudku']
handler.category = ['uploader']

handler.meta = {
  fileName: 'upload-cloudku.js',
  version: '1',
  author: 'Ky',
  note: 'pakai q untuk reply, support img/vid/sticker'
}

export default handler