import puppeteer, { Page, Browser, DirectNavigationOptions } from 'puppeteer'
import { createConnection, Connection } from 'typeorm'
import { ormconfig } from '../config/ormconfig'
import { IpEntity } from '../config/entities/ip.entity'
import { sleep } from './utils/common'
import { generateUserAgent } from './services/generate-ua'
import logger from './services/logger'
import { getOneIp, deleteIpById } from './services/ip.service'
import { testIp } from './utils/test-ip'

const goOpt: DirectNavigationOptions = {
  waitUntil: 'domcontentloaded',
  timeout: 30000
}
// 'http://control.blog.sina.com.cn/blog_rebuild/blog/controllers/setpage.php?uid=2964255930&status=pageset',
// 'https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=ip&rsv_pq=e085262200095771&rsv_t=df15%2Fsr0YRk9EFJpxBkKbLZbYB%2B3J33bcG8n1WWYyZSnyRASnjcw5pzv2vE&rqlang=cn&rsv_enter=1&rsv_sug3=2&rsv_sug1=1&rsv_sug7=100',

const url = 'http://blog.sina.com.cn/s/blog_b0aef4ba0102yft3.html'
// url = `https://qiannianhupo.pipipan.com/fs/167219-386955156`
// const url = `https://www.baidu.com`
// `http://httpbin.org/ip`,

const getAvaliableIp = async (connection: Connection): Promise<IpEntity> => {
  const ipObj = await getOneIp(connection)
  if (!ipObj) throw new Error('Ip 没了')
  const validResult = await testIp(ipObj.addr)
  if (!validResult) {
    await deleteIpById(connection, ipObj.id)
    logger.info(`删除无效 ip: ${ipObj.addr}`, {
      ipObj
    })
    return getAvaliableIp(connection)
  }
  return ipObj
}

class Action {
  browser: Browser
  ipObj: IpEntity
  page: Page

  constructor(public readonly connection: Connection, public ip?: string) {}

  private async init() {
    if (this.ip) {
      this.ipObj = new IpEntity({
        addr: this.ip
      })
    } else {
      this.ipObj = await getAvaliableIp(this.connection)
    }

    logger.info(`current ip:${this.ipObj.addr}`)
    this.browser = await puppeteer.launch({
      headless: false,
      // devtools: true,
      // slowMo: 300,
      ignoreHTTPSErrors: true,
      args: [`--proxy-server=${this.ipObj.addr}`]
      // args: [`--proxy-server=http://114.55.236.62:3128`]
    })

    this.page = await this.browser.newPage()
    // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
  }

  private async errorHandler(e) {
    logger.warn(' page.goto net work error', {
      code: e.code,
      ip: this.ipObj.addr
    })
    await deleteIpById(this.connection, this.ipObj.id)
    await this.browser.close()
  }

  // 打开 博客
  private async go2Blog() {
    logger.info('正在访问 blog...')
    return this.page.goto(url, goOpt).catch(this.errorHandler.bind(this))
  }

  // 打开 网盘
  private async go2Pan() {
    const link = `#sina_keyword_ad_area2  a[href*="pipipan"]`

    const panUrl = await this.page.evaluate((passLink) => {
      const elems = document.querySelectorAll<HTMLElement>(passLink)
      if (elems && elems.length > 0) {
        const randomIndex = Math.floor(Math.random() * elems.length)

        return elems[randomIndex].getAttribute('href')
      }
      return ''
    }, link)

    if (!panUrl) {
      logger.warn('查不到网盘url, 可能是代理挂了.')
      return this.browser.close()
    }

    logger.info(`正在访问网盘: ${panUrl}`)

    const [response] = await Promise.all([
      this.page.waitForNavigation(goOpt).catch(this.errorHandler.bind(this)),
      this.page.click(`#sina_keyword_ad_area2  a[href="${panUrl}"]`)
    ])

    // const response = await this.page.goto(panUrl, goOpt).catch(this.errorHandler.bind(this))

    if (response) {
      logger.info('成功访问网盘')
    } else {
      logger.warn('失败访问网盘')
      return false
    }

    await this.page.waitForSelector(`#free_down_link`)
    await sleep(3000 + Math.random() * 3000)

    // 点击下载
    await this.page.click(`#free_down_link`)
    await sleep(10000 + Math.random() * 10000)
    return true
  }

  // 刷新页面
  private async reloadPage(i = 50) {
    while (i--) {
      await this.page.reload(goOpt)
    }
  }

  // 执行程序
  async run() {
    await this.init()

    const ua = generateUserAgent()

    logger.info(`ua: ${ua}`)

    await this.page.emulate({
      viewport: {
        width: 1000,
        height: 600
      },
      userAgent: ua
    })

    const result = await this.go2Blog()
    // 访问失败
    if (!result) {
      logger.warn('访问博客失败', {
        result
      })
      return null
    }
    const panResult = await this.go2Pan()

    await sleep(3000 + Math.random() * 3000)

    panResult && logger.info('任务完成！\n\n')
    await this.browser.close()
  }
}

;(async () => {
  const connection = await createConnection(ormconfig)
  let action: Action
  let times = 10
  while (times--) {
    action = new Action(connection)
    await action.run()
  }

  // await sleep(5000)

  logger.info('全部任务完成！')
})()
