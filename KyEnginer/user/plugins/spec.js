import { sendText, botInfo, userManager, textOnlyMessage, msToReadableTime } from '#helper'
import os from 'node:os'
import fs from 'node:fs'

/**
 * @param {import('../types/plugin.js').HandlerParams} params
 */
async function handler({ sock, m, jid }) {

    // === TRUST CHECK ===
    if (!userManager.trustedJids.has(m.senderId)) return
    if (!textOnlyMessage(m)) return

    // === CPU INFO ===
    const cpus = os.cpus()
    const cpuModel = cpus[0].model
    const cpuCores = cpus.length

    // === OS INFO ===
    let osName = `${os.platform()} ${os.release()}`
    try {
        const osRelease = fs.readFileSync('/etc/os-release', 'utf8')
        const match = osRelease.match(/^PRETTY_NAME="(.+)"$/m)
        if (match) osName = match[1]
    } catch {}

    const arch = os.arch()

    // === RAM INFO ===
    const ramTotal = os.totalmem()
    const ramFree = os.freemem()
    const ramUsed = ramTotal - ramFree
    const ramPercent = ((ramUsed / ramTotal) * 100).toFixed(1)
    const toGB = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'

    // === DISK INFO ===
    let diskTotal = 0, diskUsed = 0, diskFree = 0, diskPercent = 0
    try {
        const disk = fs.statfsSync('/')
        diskTotal = disk.blocks * disk.bsize
        diskFree = disk.bfree * disk.bsize
        diskUsed = diskTotal - diskFree
        diskPercent = ((diskUsed / diskTotal) * 100).toFixed(1)
    } catch {}

    // === UPTIME ===
    const hostUptime = msToReadableTime(os.uptime() * 1000)
    const nodeUptime = msToReadableTime(process.uptime() * 1000)

    // === BUILD OUTPUT ===
    const bullet = '- '
    const output =
`🌐 *NODE STATISTICS*
by ${botInfo.an}

*hardware*
${bullet}CPU Model : ${cpuModel}
${bullet}CPU Cores : ${cpuCores}
${bullet}RAM Total : ${toGB(ramTotal)}
${bullet}RAM Used  : ${toGB(ramUsed)} (${ramPercent}%)

*software*
${bullet}OS      : ${osName}
${bullet}Arch    : ${arch}
${bullet}Node    : ${process.version}

*system*
${bullet}Host Uptime : ${hostUptime}
${bullet}Node Uptime : ${nodeUptime}
${bullet}Disk Usage  : ${toGB(diskUsed)} / ${toGB(diskTotal)} (${diskPercent}%)
`

    return await sendText(sock, jid, output)
}

handler.pluginName = 'spec'
handler.description = 'lihat spesifikasi hardware / node server'
handler.command = ['spec', 'spec']
handler.category = ['tools']

handler.meta = {
    fileName: 'spec.js',
    version: '1',
    author: botInfo.an,
    note: 'gabungan spec original + botInfo style'
}

export default handler