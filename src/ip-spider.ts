import { createConnection } from 'typeorm'
import puppeteer from 'puppeteer'
import { ormconfig } from 'config/ormconfig'
import { getIpFromXila } from './spider-task/spider-ip-xila'
import { getIpFromKuai } from './spider-task/spider-ip-kuai'

async function main() {
  const connection = await createConnection(ormconfig)
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 300

    // devtools: true,
  })

  const xilaPage = await browser.newPage()

  const kuaiPage = await browser.newPage()

  await Promise.all([getIpFromXila(xilaPage, connection), getIpFromKuai(kuaiPage, connection)])

  browser.close()
}

main()
