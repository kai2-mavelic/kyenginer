import axios from 'axios'
import FormData from 'form-data'
import * as cheerio from 'cheerio'
import {
  getBuff,
  sendText,
tag
} from '#helper'

const cookie = 'PHPSESSID=l0pkhh77ohv96iockf2me4ttg9'

async function upload(buffer) {
  const form = new FormData()
  form.append('upload[]', buffer, 'file.jpg')

  const res = await axios.post(
    'https://8upload.com/upload/mt/',
    form,
    {
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://8upload.com',
        'Referer': 'https://8upload.com/',
        'Cookie': cookie
      }
    }
  )

  return 'https://8upload.com' + String(res.data).replace(/"/g, '')
}

async function getDirect(pageUrl) {
  const res = await axios.get(pageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'text/html',
      'Referer': 'https://8upload.com/',
      'Cookie': cookie
    }
  })

  const $ = cheerio.load(res.data)

  let direct = ''
  $('input#lname').each((_, el) => {
    const val = $(el).val()
    if (typeof val === 'string' && val.includes('/image/')) {
      direct = val
    }
  })

  return direct
}

/**
 * @param {import('../../system/types/plugin.js').HandlerParams} params
 */
async function handler({ m, q, jid, sock, command }) {
  const target = q || m

  if (!target.message?.imageMessage) {
    return sendText(
      sock,
      jid,
      `reply / kirim gambar dengan ${command}`,
      m
    )
  }

  try {
    const buffer = await getBuff(target)
    const pageUrl = await upload(buffer)
    const direct = await getDirect(pageUrl)

    await sendText(
      sock,
      jid,
      `nih kak ${tag(m.senderId)}\n${direct}` || '(gagal)',
      target
    )
  } catch (e) {
    await sendText(sock, jid, e.message, m)
  }
}

handler.pluginName = '8upload'
handler.description = 'upload image ke 8upload (direct link)'
handler.command = ['8up']
handler.category = ['uploader']

handler.meta = {
  fileName: 'upload-8upload.js',
  version: '1',
  author: 'Ky',
  note: 'upload ke 8up'
}

export default handler