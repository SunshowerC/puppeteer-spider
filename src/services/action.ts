import puppeteer, { Page, Browser, DirectNavigationOptions } from 'puppeteer'
import { Connection } from 'typeorm'
import { ResourceEntity } from '../../config/entities/resouce.entity'
import { IpEntity } from '../../config/entities/ip.entity'
import { generateUserAgent } from './generate-ua'
import { getOneIp, deleteIpById } from './ip.service'
import { sleep } from '../utils/common'
import logger from './logger'

const noProxy = process.argv.some((item) => item === '--no-proxy')

const goOpt: DirectNavigationOptions = {
  waitUntil: 'domcontentloaded',
  timeout: 20000
}

const getAvaliableIp = async (connection: Connection): Promise<IpEntity> => {
  const ipObj = await getOneIp(connection)
  if (!ipObj) {
    // 没有 ip, 休息一下，等 ip 来
    await sleep(2 * 3600 * 1000)
    throw new Error('Ip 没了')
  }

  // 默认认为 ip 有效，不再继续校验 ip
  // const validResult = await testIp(ipObj.addr)
  // if (!validResult) {
  //   await deleteIpById(connection, ipObj.id)
  //   logger.info(`删除无效 ip: ${ipObj.addr}`, {
  //     ipObj
  //   })
  //   return getAvaliableIp(connection)
  // }

  return ipObj
}

export class Action {
  browser: Browser
  ipObj: IpEntity
  page: Page

  ip?: string // 指定 ip 代理，如果未指定，自行去数据库取一个
  noProxy?: boolean // 是否使用代理
  panUrl?: string // 网盘下载页
  referer?: string // 来源页
  target: ResourceEntity

  constructor(
    public readonly connection: Connection,
    public option: {
      target: ResourceEntity
      ip?: string
      noProxy?: boolean
    }
  ) {
    Object.assign(this, option || {})
    this.panUrl = option.target.link
    this.referer = option.target.from
  }

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
      headless: !process.argv.some((item) => item === '--debug'),
      // devtools: true,
      // slowMo: 300,
      ignoreHTTPSErrors: true,
      args: [noProxy || this.noProxy ? '' : `--proxy-server=${this.ipObj.addr}`]
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
    return this.page.goto(this.referer!, goOpt).catch(this.errorHandler.bind(this))
  }

  private async go2PanImmediately() {
    const response = await this.page
      .goto(this.panUrl!, {
        ...goOpt,
        referer: this.referer
      })
      .catch(this.errorHandler.bind(this))

    return this.click2Download(response)
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

    return this.click2Download(response)
  }

  private async click2Download(response: any) {
    if (response) {
      logger.info('成功访问网盘')
    } else {
      logger.warn('失败访问网盘')
      return false
    }
    const downloadSelector = `#main-content > div > div > div:nth-child(5) > div:nth-child(1) > div.card-body.position-relative > button`
    // await sleep(30 * 1000)

    await this.page.waitForSelector(downloadSelector)
    await sleep(3000 + Math.random() * 3000)

    // 点击下载
    await this.page.click(downloadSelector)
    await sleep(10000 + Math.random() * 10000)
    return true
  }

  // 刷新页面
  async reloadPage(i: number) {
    await this.init()

    const ua = generateUserAgent()

    await this.page.emulate({
      viewport: {
        width: 1000,
        height: 600
      },
      userAgent: ua
    })

    await this.go2Blog()

    while (i--) {
      await this.page.reload(goOpt)
      await sleep(1000)
    }

    await this.browser.close()
  }

  // 执行程序
  async run() {
    await this.init()

    const ua = generateUserAgent()

    await this.page.emulate({
      viewport: {
        width: 1000,
        height: 600
      },
      userAgent: ua
    })

    let panResult: boolean | void

    // 直接访问网盘
    if (this.panUrl) {
      panResult = await this.go2PanImmediately().catch((e) => {
        logger.error('go2PanImmediately error ', {
          error: e,
          ip: this.ipObj.addr
        })
        return this.errorHandler(e)
      })
    }

    if (panResult) {
      const resRepo = await this.connection.getRepository(ResourceEntity)

      // 如果是周一，且 weekly_download 不为0，复位 weekly_download
      // 其他时间同时 weekly_download+1

      if (new Date().getDay() === 1) {
        this.target.weeklyDownload = 0
      } else {
        this.target.weeklyDownload += 1
      }

      this.target.download += 1

      await resRepo.save(this.target)

      logger.info(`任务完成！`, {
        name: this.target.name,
        ip: this.ipObj.addr
      })

      // 成功了，也删除 ip
      await deleteIpById(this.connection, this.ipObj.id)
    }
    await this.browser.close()

    return !!panResult
  }
}
