import request from 'request'
import logger from 'src/services/logger'

const testPath = `http://icanhazip.com/`
export const testIp = async (proxyAddr: string) => {
  const ip = proxyAddr.startsWith('http') ? proxyAddr : `http://${proxyAddr}`
  return new Promise((resolve) => {
    request.get(
      testPath,
      {
        proxy: ip.trim(),
        timeout: 10000
      },
      (error, response, body) => {
        if (error) {
          logger.warn(`${ip} testIp failed`, {
            error
          })
          resolve(false)
        } else {
          const valid = ip.includes(body.trim())
          logger.info(`${ip} validate result:${valid}`)
          resolve(valid)
        }
      }
    )
  })
}
