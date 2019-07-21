import puppeteer from 'puppeteer'
import { createConnection, Connection } from 'typeorm'
import { ormconfig } from 'config/ormconfig'
import { AvaliableEnum, IpEntity } from 'config/entities/ip.entity'
import { sleep } from './utils/common'
import { generateUserAgent } from './services/generate-ua'
import logger from './services/logger'
import { getOneIp, deleteIpById } from './services/ip.service'
import { testIp } from './utils/test-ip'

// 'http://control.blog.sina.com.cn/blog_rebuild/blog/controllers/setpage.php?uid=2964255930&status=pageset',
// 'https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=ip&rsv_pq=e085262200095771&rsv_t=df15%2Fsr0YRk9EFJpxBkKbLZbYB%2B3J33bcG8n1WWYyZSnyRASnjcw5pzv2vE&rqlang=cn&rsv_enter=1&rsv_sug3=2&rsv_sug1=1&rsv_sug7=100',

const url = 'http://blog.sina.com.cn/s/blog_b0aef4ba0102yft3.html'
// `http://httpbin.org/ip`,

const getAvaliableIp = async (connection: Connection): Promise<IpEntity> => {
  const ipObj = await getOneIp(connection)
  if (!ipObj) throw new Error('Ip 没了')
  const validResult = await testIp(ipObj.addr)
  if (validResult.avaliable === AvaliableEnum.False) {
    await deleteIpById(connection, ipObj.id)
    logger.info(`删除无效 ip: ${ipObj.addr}`, {
      ipObj
    })
    return getAvaliableIp(connection)
  }
  return ipObj
}

const mainProcess = async (connection: Connection) => {
  const ipObj = await getAvaliableIp(connection)

  logger.info(`当前代理 ip: ${ipObj.addr}`)
  const browser = await puppeteer.launch({
    headless: false,
    // devtools: true,
    // slowMo: 300,
    args: [`--proxy-server=${ipObj.addr.slice(7)}`],
    defaultViewport: {
      width: 1200,
      height: 800
    }
  })

  const page = await browser.newPage()
  // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
  const ua = generateUserAgent()

  logger.info(`ua: ${ua}`)

  await page.setUserAgent(ua)

  await page
    .goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    })
    .catch((e) => {
      logger.warn('page.goto net work error', {
        code: e.code
      })

      return browser.close().then(() => {
        return mainProcess(connection)
      })
    })
}

async function main() {
  const connection = await createConnection(ormconfig)

  await mainProcess(connection)

  // let i = 50
  // while (i--) {
  // await page.reload({
  //   waitUntil: 'networkidle2',
  //   timeout: 20000
  // })
  // }

  await sleep(20000)

  logger.info('本次任务完成！')
}

main()
