import puppeteer from 'puppeteer'
import { createConnection } from 'typeorm'
import { ormconfig } from 'config/ormconfig'
import { sleep } from '../utils/common'
import logger from '../services/logger'
import { saveAvaliableIps } from '../utils/test-ip'

const getIpPage = (num) => `http://www.xiladaili.com/gaoni/${num}/`

export async function getIpFromXila() {
  const connection = await createConnection(ormconfig)

  const browser = await puppeteer.launch({
    // headless: false,
    // devtools: true,
    // slowMo: 300
  })

  const page = await browser.newPage()
  const pages = 20
  let i = 0
  while (i < pages) {
    i++
    await page.goto(getIpPage(i), {
      waitUntil: 'networkidle2'
    })

    // 爬取得到当前页面所有 ip
    const ips: any[] = await page.evaluate(() => {
      // eslint-disable-next-line
      const tds = document.querySelectorAll('.fl-table tr td:first-child')
      const ipsFromElem = Array.from(tds).map((td) => td.textContent)
      return ipsFromElem
    })

    const avaliableLen = await saveAvaliableIps(connection, ips)

    // 有效 ip 太少，别爬了
    if (avaliableLen < 5) {
      logger.info('爬取西拉代理完毕！')
      break
    }

    await sleep(1000)
  }

  await browser.close()
}
