import axios from 'axios';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { sendText, getBuff, react } from '#helper'
import sharp from 'sharp';


const uploadCloudKu = async (buffer, ext) => {
  const form = new FormData();
  form.append('file', buffer, { filename: `file.${ext}` });

  const res = await axios.post(
    'https://cloudkuimages.guru/upload.php',
    form,
    { headers: form.getHeaders() }
  );

  const url = res.data?.data?.url;
  if (!url) throw new Error('CloudKu upload gagal');
  return url;
};


async function handler({ m, sock, text, jid }) {
  if (!text)
    return sendText(sock, jid, 'Reply gambar + teks\nContoh:\n.smeme atas|bawah', m);
await react(sock, m, "💀")
  try {
    const q = m.q || m;
    const mese = q;

    const mime = mese?.message?.[mese.type]?.mimetype || '';
    if (!mime || !mime.startsWith('image/')) {
      return sendText(sock, jid, 'Reply atau kirim gambar.', m);
    }

    const text = m.text
  ?.replace(/^(\S+)\s*/, '')
  .trim();

const EMPTY = '‎';

let top = EMPTY;
let bottom = EMPTY;

if (text) {
  if (text.includes('|')) {
    const [t, b] = text.split('|');

    if (t && t.trim()) top = t.trim();
    if (b && b.trim()) bottom = b.trim();
  } else {
    top = text.trim();
  }
}




 
    let buffer = await getBuff(q);
let ext = mime.split('/')[1];


if (ext === 'webp') {
  buffer = await sharp(buffer).png().toBuffer();
  ext = 'png';
}

    
    const imageUrl = await uploadCloudKu(buffer, ext);

    
    const encode = t =>
      encodeURIComponent(t.replace(/-/g, '--').replace(/_/g, '__'));

    const memeUrl =
      `https://api.memegen.link/images/custom/` +
      `${encode(top)}/${encode(bottom)}.png` +
      `?background=${encodeURIComponent(imageUrl)}`;

    
    const memeRes = await fetch(memeUrl);
    if (!memeRes.ok) throw new Error('Gagal generate meme');

    const memeBuffer = Buffer.from(await memeRes.arrayBuffer());

    
    const sticker = new Sticker(memeBuffer, {
      pack: '',
      author: 'Shiroko',
      type: StickerTypes.FULL,
      quality: 80
    });

    const stickerBuffer = await sticker.toBuffer();

  
    await sock.sendMessage(
      jid,
      { sticker: stickerBuffer },
      { quoted: m }
    );
  } catch (e) {
    console.error(e);
    await sendText(sock, jid, `❌ Error:\n${e.message}`, m);
  }
}

handler.pluginName = 'bikin gambar ada anu nya wkwk';
handler.command = ['smeme'];
handler.category = ['maker']
handler.deskripsi = 'Buat meme dari gambar (stiker)\nFormat: smeme atas | bawah';
handler.meta = {
fileName: 'maker-smeme.js',
version: '1',
author: 'ky',
note: 'gd'
}

export default handler;