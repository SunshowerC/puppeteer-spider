import { Page } from 'puppeteer'
import { Connection } from 'typeorm'
import { sleep } from '../utils/common'
import logger from '../services/logger'
import { saveAvaliableIps } from '../utils/test-ip'

const getIpPage = (num: number) => `http://www.qydaili.com/free/?action=china&page=${num}`

export async function getIpFromQiyun(page: Page, connection: Connection) {
  // 自增页码
  let i = 0
  while (true) {
    i++
    await page.goto(getIpPage(i), {
      waitUntil: 'networkidle2'
    })

    sleep(2000)
    // 爬取得到当前页面所有 ip
    const ips: any[] = await page.evaluate(() => {
      /* eslint-disable */
      const ipTds = Array.from(
        document.querySelectorAll(`#content > section > div.container > table > tbody > tr td:nth-child(1)`)
      )
      const portTds = Array.from(
        document.querySelectorAll(`#content > section > div.container > table > tbody > tr td:nth-child(2)`)
      )

      const secureTds = Array.from(
        document.querySelectorAll(`#content > section > div.container > table > tbody > tr td:nth-child(3)`)
      )

      /* eslint-enable */

      const ipsFromElem = ipTds
        .map((td, index) => {
          if (secureTds[index].textContent!.trim() === '匿名度高匿')
            return `http://${td.textContent!.trim().slice(2)}:${portTds[index]
              .textContent!.trim()
              .slice(4)}`

          return null
        })
        .filter(Boolean)
      return ipsFromElem
    })

    const avaliableLen = await saveAvaliableIps(connection, ips)

    // 有效 ip 太少，别爬了
    if (avaliableLen === 0) {
      logger.info(`爬取齐云代理完毕， 总共 ${i} 页！`)
      break
    }

    await sleep(1000)
  }
}
