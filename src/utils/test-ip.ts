import request from 'request'

const testPath = `http://icanhazip.com/`
export const testIp = async (proxyAddr: string) => {
  const ip = proxyAddr.startsWith('http') ? proxyAddr : `http://${proxyAddr}`
  return new Promise((resolve, reject) => {
    request.get(
      testPath,
      {
        proxy: ip,
        timeout: 20000
      },
      (error, response, body) => {
        if (error) {
          console.log('error', error)
          reject(error)
        } else {
          console.log(body, 'validate result:', ip.includes(body.trim()))
          resolve(ip.includes(body.trim()))
        }
      }
    )
  })
}

testIp('1.179.185.249:8080')
