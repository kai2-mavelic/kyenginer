import axios from 'axios'
import FormData from 'form-data'
import { delay } from 'baileys'
import {
  getBuff,
  sendText,
  tag,
  react
} from '#helper'

async function getToken() {
  const { data } = await axios.get(
    'https://removal.ai/wp-admin/admin-ajax.php?action=ajax_get_webtoken&security=1cf5632768'
  )
  return data?.data?.webtoken
}

async function removeBg(buffer) {
  const form = new FormData()
  form.append('image_file', buffer, {
    filename: 'image.png'
  })

  const token = await getToken()

  const { data } = await axios.post(
    'https://api.removal.ai/3.0/remove',
    form,
    {
      headers: {
        ...form.getHeaders(),
        'user-agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N)',
        'origin': 'https://removal.ai',
        'accept': '*/*',
        'web-token': token
      }
    }
  )

  return data
}

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, q, jid, sock }) {
  const target = q || m
  const msg = target.message

  if (!msg?.imageMessage) {
    return sendText(sock, jid, 'reply / kirim gambar', m)
  }

  try {
    await react(sock, m, '🕒')

    const buffer = await getBuff(target)
    const res = await removeBg(buffer)

    if (!res?.url) throw new Error('gagal remove background')

    await sock.sendMessage(
      jid,
      {
        image: { url: res.url },
        caption: `${tag(m.senderId)} done`
      },
      { quoted: target }
    )

    await delay(1500)
    await react(sock, m, '✅')
  } catch (e) {
    await sendText(sock, jid, e.message, m)
  }
}

handler.pluginName = 'remove background'
handler.description = 'hapus background gambar'
handler.command = ['removebg']
handler.category = ['tools']

handler.meta = {
  fileName: 'tools-remove-bg.js',
  version: '1.0.0',
  author: 'Ky',
  note: 'removal.ai skrep'
}

export default handler