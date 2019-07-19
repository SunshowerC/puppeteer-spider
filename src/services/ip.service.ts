import { Connection } from 'typeorm'
import { IpEntity } from 'config/entities/ip.entity'

export const saveIps = async (connnect: Connection, ips: Partial<IpEntity>[]) => {
  // const ipEntitys = ips.map(item => new IpEntity(item))
  const now = Math.floor(Date.now() / 1000)

  const keys = ['addr', 'avaliable', 'createtimestamp', 'updatetimestamp']

  const valuesStr = ips
    .map((ip) => `("${ip.addr}", ${ip.avaliable || 1}, ${now}, ${now})`)
    .join(',')

  const saveRes = await connnect.query(`
    INSERT INTO ip_tab (
      ${keys.join(',')}
    )
    VALUES
      ${valuesStr}
    ON DUPLICATE KEY UPDATE
      addr = VALUES(addr),
      avaliable = VALUES(avaliable),
      updatetimestamp = VALUES(updatetimestamp);  
  `)

  console.log('saveRes', saveRes)
  return saveRes
}
