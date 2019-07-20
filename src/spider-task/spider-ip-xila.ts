import puppeteer from 'puppeteer'
import { sleep } from 'src/utils/common'
import { createConnection } from 'typeorm'
import { ormconfig } from 'config/ormconfig'
import logger from 'src/services/logger'
import { saveIps } from '../services/ip.service'

const getIpPage = (num) => `http://www.xiladaili.com/gaoni/${num}/`

export async function getIpFromXila() {
  const connection = await createConnection(ormconfig)

  const browser = await puppeteer.launch({
    headless: true,
    devtools: true,
    slowMo: 300
  })

  const page = await browser.newPage()
  const pages = 10
  let i = 1
  while (i < pages) {
    i++
    await page.goto(getIpPage(i), {
      waitUntil: 'networkidle2'
    })
    const ips: any[] = await page.evaluate(() => {
      // eslint-disable-next-line
      const tds = document.querySelectorAll('.fl-table tr td:first-child')
      const ipsFromElem = Array.from(tds).map((td) => td.textContent)
      return ipsFromElem
    })

    logger.info(`ips`, ips.length, ips)

    saveIps(connection, ips.map((item) => ({ addr: item })))

    await sleep(1000)
  }

  await browser.close()
}
