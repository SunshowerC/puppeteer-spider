import { Page, FrameBase } from 'puppeteer'
import { Connection } from 'typeorm'
import { sleep } from '../utils/common'
import logger from '../services/logger'
import { saveAvaliableIps } from '../utils/test-ip'

interface SpiderIpOpt {
  page: Page
  connection: Connection
  getIpPage: (num: number) => string
  label: string
  evaluate: FrameBase['evaluate']
}

export async function getIpByPuppeteer(option: SpiderIpOpt) {
  const page = option.page
  const connection = option.connection
  const getIpPage = option.getIpPage
  const evaluate = option.evaluate

  // 自增页码
  let i = 0
  while (true) {
    i++
    await page.goto(getIpPage(i), {
      waitUntil: 'networkidle2'
    })

    // 爬取得到当前页面所有 ip
    const ips: any[] = await page.evaluate(evaluate)

    const avaliableLen = await saveAvaliableIps(connection, ips)

    // 有效 ip 太少，别爬了
    if (avaliableLen === 0) {
      logger.info(`爬取 ${option.label} 完毕， 总共 ${i} 页！`)
      break
    }

    await sleep(1000)
  }
}
