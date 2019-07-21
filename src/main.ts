import puppeteer from 'puppeteer'
import { createConnection } from 'typeorm'
import { ormconfig } from 'config/ormconfig'
import { sleep } from './utils/common'
import { generateUserAgent } from './services/generate-ua'
import logger from './services/logger'
import { getOneIp } from './services/ip.service'

// 'http://control.blog.sina.com.cn/blog_rebuild/blog/controllers/setpage.php?uid=2964255930&status=pageset',
// 'https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=ip&rsv_pq=e085262200095771&rsv_t=df15%2Fsr0YRk9EFJpxBkKbLZbYB%2B3J33bcG8n1WWYyZSnyRASnjcw5pzv2vE&rqlang=cn&rsv_enter=1&rsv_sug3=2&rsv_sug1=1&rsv_sug7=100',

const url = 'http://blog.sina.com.cn/s/blog_b0aef4ba0102yft3.html'
// `http://httpbin.org/ip`,

async function main() {
  const connection = await createConnection(ormconfig)

  const ipObj = await getOneIp(connection)
  if (!ipObj) throw new Error('Ip 没了')

  const browser = await puppeteer.launch({
    // headless: false,
    // devtools: true,
    // slowMo: 300,
    // args: [`--proxy-server=${ipObj.addr}`]
  })

  const page = await browser.newPage()
  // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
  const ua = generateUserAgent()

  logger.info(`ua: ${ua}`)

  await page.setUserAgent(ua)

  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 20000
  })

  let i = 50
  while (i--) {
    await page.reload({
      waitUntil: 'networkidle2',
      timeout: 20000
    })
  }

  // await page.screenshot({path: 'example.png'});

  await sleep(1000)
  await browser.close()

  logger.info('本次任务完成！')
}

main()
