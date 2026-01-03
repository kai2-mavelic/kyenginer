import axios from 'axios'
import { delay } from 'baileys'
import {
  getBuff,
  sendText,
  tag,
  react
} from '#helper'

const IMGBB_API_KEY = '7a039f3cbd0d6ac882c6f7d4d1f22197'

async function uploadImgBB(buffer) {
  const base64 = buffer.toString('base64')
  const params = new URLSearchParams()
  params.append('image', base64)

  const res = await axios.post(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    params
  )

  if (res.data?.data?.url) return res.data.data.url
  throw new Error('Upload gagal')
}

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, q, jid, sock }) {
  const target = q || m
  const msg = target.message

  if (!msg?.imageMessage) {
    return sendText(sock, jid, 'mana media nya', m)
  }

  try {
    await react(sock, m, '🕒')

    const buffer = await getBuff(target)
    const url = await uploadImgBB(buffer)

    await sendText(
      sock,
      jid,
      `${tag(m.senderId)} Done ygy\n${url}`,
      target
    )

    await delay(1500)
    await react(sock, m, '✅')
  } catch (e) {
    await sendText(sock, jid, e.message, m)
  }
}

handler.pluginName = 'imgbb upload'
handler.description = 'upload image ke imgbb'
handler.command = ['imgbb']
handler.category = ['uploader']

handler.meta = {
  fileName: 'upload-imgbb.js',
  version: '1',
  author: 'Ky',
  note: 'struktur baru, reply pakai q'
}

export default handler