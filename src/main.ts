import puppeteer from 'puppeteer'
import { sleep } from './utils/common'
import { generateUserAgent } from './services/generate-ua'

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    slowMo: 300,
    args: []
  })
  const page = await browser.newPage()
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

  await page.setUserAgent(generateUserAgent())

  await page.goto(
    'http://control.blog.sina.com.cn/blog_rebuild/blog/controllers/setpage.php?uid=2964255930&status=pageset',
    {
      waitUntil: 'networkidle2'
    }
  )

  // await page.screenshot({path: 'example.png'});

  await sleep(10000)
  // await browser.close();
}

main()
