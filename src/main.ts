import puppeteer from 'puppeteer'
import { sleep } from './utils/common'
import { generateUserAgent } from './services/generate-ua'

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    slowMo: 300,
    args: ['--proxy-server=60.205.229.126:80']
  })
  const page = await browser.newPage()
  // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
  const ua = generateUserAgent()
  console.log('ua', ua)
  await page.setUserAgent(ua)

  await page.goto(
    // 'http://control.blog.sina.com.cn/blog_rebuild/blog/controllers/setpage.php?uid=2964255930&status=pageset',
    'https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=ip&rsv_pq=e085262200095771&rsv_t=df15%2Fsr0YRk9EFJpxBkKbLZbYB%2B3J33bcG8n1WWYyZSnyRASnjcw5pzv2vE&rqlang=cn&rsv_enter=1&rsv_sug3=2&rsv_sug1=1&rsv_sug7=100',
    {
      waitUntil: 'networkidle2'
    }
  )

  // await page.screenshot({path: 'example.png'});

  await sleep(10000)
  // await browser.close();
}

main()
