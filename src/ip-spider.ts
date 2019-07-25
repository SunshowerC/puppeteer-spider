import { createConnection } from 'typeorm'
import puppeteer from 'puppeteer'
import { ormconfig } from 'config/ormconfig'
import { getIpFromXila } from './spider-task/spider-ip-xila'
import { getIpFromKuai } from './spider-task/spider-ip-kuai'
import { getIpFromXici } from './spider-task/spider-ip-xici'
import { getIpFromQiyun } from './spider-task/spider-ip-qiyun'
import logger from './services/logger'

async function main() {
  const connection = await createConnection(ormconfig)
  const browser = await puppeteer.launch({
    // headless: false,
    // slowMo: 300,
    defaultViewport: {
      width: 1200,
      height: 800
    }
    // devtools: true
  })

  const xilaPage = await browser.newPage()
  const kuaiPage = await browser.newPage()
  const xiciPage = await browser.newPage()
  const qiyunPage = await browser.newPage()

  logger.info('已打开页面')

  await Promise.all([
    getIpFromXila(xilaPage, connection),
    getIpFromKuai(kuaiPage, connection),
    getIpFromXici(xiciPage, connection),
    getIpFromQiyun(qiyunPage, connection)
  ])

  logger.info('全网站爬取完毕')
  browser.close()
}

main()
