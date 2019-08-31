import { createConnection } from 'typeorm'
import { ormconfig } from '../config/ormconfig'
import { getRandomItem, WeightObj } from './utils/common'
import logger from './services/logger'
import { ResourceEntity } from '../config/entities/resouce.entity'
import { Action } from './services/action'

const main = async () => {
  const connection = await createConnection(ormconfig)
  let action: Action
  let times = 1000

  const resRepo = connection.getRepository(ResourceEntity)
  const [resouces] = await resRepo.findAndCount()

  // 计算出全部下载次数
  const totalDownload = resouces.reduce((prev, cur) => {
    return prev + cur.download
  }, 0)

  // 计算出权重，下载次数越多， 权重越低， 某个资源下载次数过多
  const resoucesWithWeight: WeightObj<ResourceEntity>[] = resouces.map((item) => {
    return {
      weight: totalDownload - item.download,
      value: item
    }
  })

  while (times--) {
    logger.info(`time: ${times}`)
    const curPanObj = getRandomItem(resoucesWithWeight)

    action = new Action(connection, {
      target: curPanObj
    })
    await action.run()
  }

  logger.info('============全部任务完成！============')
}

main()
