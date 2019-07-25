import { Page } from 'puppeteer'
import { Connection } from 'typeorm'
import { sleep } from '../utils/common'
import logger from '../services/logger'
import { saveAvaliableIps } from '../utils/test-ip'

const getIpPage = (num: number) => `https://www.xicidaili.com/nn/${num}`

export async function getIpFromXici(page: Page, connection: Connection) {
  // 自增页码
  let i = 0
  while (true) {
    i++
    await page
      .goto(getIpPage(i), {
        waitUntil: 'networkidle2'
      })
      .catch((e) => {
        console.log('打开 xici 错误', e)
      })

    // 爬取得到当前页面所有 ip
    const ips: any[] = await page.evaluate(() => {
      /* eslint-disable */
      const ipTds = Array.from(
        document.querySelectorAll(`#ip_list > tbody > tr td:nth-child(2)`)
      )
      const portTds = Array.from(
        document.querySelectorAll(`#ip_list > tbody > tr td:nth-child(3)`)
      )

      const protocolTds = Array.from(
        document.querySelectorAll(`#ip_list > tbody > tr td:nth-child(6)`)
      )
      /* eslint-enable */

      const ipsFromElem = ipTds.map((td, index) => {
        return `${protocolTds[
          index
        ].textContent!.toLocaleLowerCase()}://${td.textContent!.trim()}:${portTds[
          index
        ].textContent!.trim()}`
      })
      return ipsFromElem
    })

    const avaliableLen = await saveAvaliableIps(connection, ips)

    // 有效 ip 太少，别爬了
    if (avaliableLen === 0) {
      logger.info(`爬取西刺代理完毕， 总共 ${i} 页！`)
      break
    }

    await sleep(1000)
  }
}
