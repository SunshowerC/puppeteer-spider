import { Connection } from 'typeorm'
import { IpEntity, AvaliableEnum } from '../../config/entities/ip.entity'
import logger from './logger'

// 保存ip 到数据库
export const saveIps = async (connnect: Connection, ips: Partial<IpEntity>[]) => {
  // const ipEntitys = ips.map(item => new IpEntity(item))
  const now = Math.floor(Date.now() / 1000)

  const keys = ['addr', 'avaliable', 'origin', 'createtimestamp', 'updatetimestamp']

  const valuesStr = ips
    .map(
      (ip) => `("${ip.addr}", ${ip.avaliable === 0 ? 0 : 1}, "${ip.origin || ''}", ${now}, ${now})`
    )
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

  logger.info('saveIps Result', {
    result: saveRes
  })
  return saveRes
}

// 获取ip
export const getOneIp = async (connection: Connection) => {
  const ipRepo = connection.getRepository(IpEntity)
  const qb = ipRepo.createQueryBuilder()
  const result = qb
    .select()
    .where(`avaliable = ${AvaliableEnum.True}`)
    // .andWhere(`origin REGEXP '移动|联通|电信|广电|通'`)
    .orderBy({
      createtimestamp: `DESC`
    })
    .getOne()

  return result
}
// 删除ip
export const deleteIpById = async (connection: Connection, id: number) => {
  const ipRepo = connection.getRepository(IpEntity)
  return ipRepo.delete({
    id
  })
}
