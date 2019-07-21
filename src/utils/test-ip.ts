import request from 'request'
import logger from 'src/services/logger'
import { AvaliableEnum, IpEntity } from 'config/entities/ip.entity'
import { saveIps } from 'src/services/ip.service'
import { Connection } from 'typeorm'

export type TestResult = Pick<IpEntity, 'addr' | 'avaliable' | 'origin'>

// const testPath = `http://icanhazip.com/`
// const testPath = `http://httpbin.org/ip`
// const testPath = `http://www.ip.cn`
const testPath = `http://200019.ip138.com/`

export const testIp = async (proxyAddr: string): Promise<TestResult> => {
  const ip = proxyAddr.startsWith('http') ? proxyAddr : `http://${proxyAddr}`
  return new Promise((resolve) => {
    request.get(
      testPath,
      {
        proxy: ip.trim(),
        timeout: 20000
      },
      (error, response, body) => {
        let avaliable = AvaliableEnum.False
        let origin = ''

        // console.log('bobey', body)
        if (error) {
          logger.warn(`${ip} testIp failed`, {
            error: error.code
          })
          resolve({
            avaliable: AvaliableEnum.False,
            addr: ip,
            origin: ''
          })
        } else {
          // `http://icanhazip.com/`
          // const valid = ip.includes(body.trim()) ? AvaliableEnum.True : AvaliableEnum.False
          // logger.info(`${ip} validate result:${valid}`)
          // resolve({
          //   avaliable: valid,
          //   addr: ip
          // })

          // http://200019.ip138.com/
          const matchResult = body.match(/您的IP地址是：\[(.*)\] 来自：(.*)\s/)
          if (matchResult) {
            avaliable = ip.includes(matchResult[1]) ? AvaliableEnum.True : AvaliableEnum.False
            origin = matchResult[2]
          }
          logger.info(`${origin} ${ip} validate result:${avaliable}`, {
            body: avaliable === AvaliableEnum.False ? `CannotParseIP: ${body}` : undefined
          })
          return resolve({
            avaliable,
            addr: ip,
            origin
          })
        }
      }
    )
  })
}

export const saveAvaliableIps = async (connection: Connection, ips: string[]): Promise<number> => {
  const allValidProm = ips.map((curIp) => testIp(curIp))

  // 带校验结果的所有 ip
  const allIpsWithAvaliable = await Promise.all(allValidProm)
  // 有效的 ip
  const avaliableIps = allIpsWithAvaliable.filter((item) => item.avaliable)

  logger.info(`all ips: ${allIpsWithAvaliable.length}, avaliable ips: ${avaliableIps.length}`, {
    avaliableIps
  })

  if (avaliableIps.length > 0) {
    await saveIps(connection, avaliableIps)
  }

  return avaliableIps.length
}
