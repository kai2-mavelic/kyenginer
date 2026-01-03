import axios from 'axios'
import { sendText, tag, botInfo } from '#helper'
import * as cheerio from 'cheerio'

class ShortUrl {
    async isgd(url) {
        try {
            if (!url.includes('https://')) throw new Error('Invalid url.')

            const { data } = await axios.post(
                'https://cors.caliph.my.id/https://is.gd/create.php',
                new URLSearchParams({ url, shorturl: '', opt: 0 }).toString(),
                {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        origin: 'https://is.gd',
                        referer: 'https://is.gd/',
                        'user-agent': 'Mozilla/5.0'
                    }
                }
            )

            const $ = cheerio.load(data)
            const result = $('input#short_url').attr('value')
            if (!result) throw new Error('No result found.')
            return result
        } catch (err) {
            throw new Error(err.message)
        }
    }

    async tinube(url, suffix = '') {
        try {
            if (!url.includes('https://')) throw new Error('Invalid url.')

            const { data } = await axios.post(
                'https://tinu.be/en',
                [{ longUrl: url, urlCode: suffix }],
                {
                    headers: {
                        'next-action': '74b2f223fe2b6e65737e07eeabae72c67abf76b2',
                        'next-router-state-tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22(site)%22%2C%7B%22children%22%3A%5B%5B%22lang%22%2C%22en%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
                        origin: 'https://tinu.be',
                        referer: 'https://tinu.be/en',
                        'user-agent': 'Mozilla/5.0'
                    }
                }
            )

            const result = JSON.parse(
                data.split('\n').find(line => line.startsWith('1:')).substring(2)
            ).data.urlCode

            if (!result) throw new Error('No urlCode found or suffix already used.')
            return 'https://tinu.be/' + result
        } catch (err) {
            throw new Error(err.message)
        }
    }
}

async function handler({ m, text, jid, sock }) {
    if (!text) return await sendText(sock, jid, '⚠️ Masukkan URL untuk dijadikan short url', m)
    if (!/^https?:\/\//.test(text)) return await sendText(sock, jid, 'Format URL salah! Harus diawali http:// atau https://', m)

    const s = new ShortUrl()
    try {
        let shorted

        if (text.includes('tinu.be')) {
            shorted = await s.tinube(text)
        } else {
            shorted = await s.isgd(text)
        }

        await sendText(sock, jid, `✅ Selesai ${tag(m.senderId)}\n\n${shorted}`, m)
    } catch (err) {
        await sendText(sock, jid, `Terjadi kesalahan: ${err.message}`, m)
    }
}

handler.pluginName = 'ShortUrl Custom'
handler.command = ['isgd', 'tinube']
handler.category = ['tools']
handler.deskripsi = 'Membuat link pendek dari URL menggunakan is.gd atau tinu.be'
handler.meta = {
    fileName: 'tools-shortlink2.js',
    version: '1.1',
    author: botInfo.an,
    note: 'support is.gd & tinu.be'
}

export default handler