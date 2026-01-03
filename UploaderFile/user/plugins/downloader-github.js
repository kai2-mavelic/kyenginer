import { sendText, tag, botInfo } from '#helper'
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
import archiver from 'archiver';

const execPromise = util.promisify(exec);

async function handler({ sock, m, jid, text }) {
  if (!text) return sendText(sock, jid, 'mana url nya', m);

  const repoUrl = text.trim();
  const tmpFolder = path.join(process.cwd(), 'user/temp');
  const repoName = repoUrl.split('/').pop().replace(/\.git$/, '');
  const repoPath = path.join(tmpFolder, repoName);
  const zipPath = path.join(tmpFolder, `${repoName}.zip`);

  try {
    // buat folder tmp
    if (!fs.existsSync(tmpFolder)) fs.mkdirSync(tmpFolder);

    await sendText(sock, jid, `⏳ Clone repository ${repoName}...`, m);

    // clone repo
    await execPromise(`git clone --depth=1 ${repoUrl} "${repoPath}"`);

    // zip folder
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(output);
      archive.directory(repoPath, false);
      archive.finalize();
      output.on('close', resolve);
      archive.on('error', reject);
    });

    // kirim zip ke user
    await sock.sendMessage(
      jid,
      { document: fs.readFileSync(zipPath), fileName: `${repoName}.zip`, mimetype: 'application/zip' },
      { quoted: m }
    );

    // cleanup
    fs.rmSync(repoPath, { recursive: true, force: true });
    fs.rmSync(zipPath, { force: true });

    await sendText(sock, jid, `✅ Repository ${repoName} berhasil dikirim!\nkak ${tag(m.senderId)} silahkan di rombak 😋`, m);

  } catch (err) {
    console.error(err);
    await sendText(sock, jid, `❌ Error: ${err.message}`, m);
  }
}

handler.pluginName = 'get github repo clone';
handler.command = ['gitclone'];
handler.category = ['downloader']
handler.deskripsi = 'Clone repository Git dan kirim ZIP ke user';
handler.meta = {
fileName: 'downloader-github.js',
version: '1',
author: botInfo.an,
note: 'beskn aja'
}
export default handler;