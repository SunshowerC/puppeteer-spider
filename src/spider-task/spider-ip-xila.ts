import { Page } from 'puppeteer'
import { Connection } from 'typeorm'
import { sleep } from '../utils/common'
import logger from '../services/logger'
import { saveAvaliableIps } from '../utils/test-ip'

// 全是国外的 ip ???
const getIpPage = (num) => `http://www.xiladaili.com/gaoni/${num}/`

export async function getIpFromXila(page: Page, connection: Connection) {
  // 自增页码
  let i = 0
  while (true) {
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
    if (avaliableLen === 0) {
      logger.info(`爬取西拉代理完毕 总共 ${i} 页！！`)
      break
    }

    await sleep(1000)
  }
}
