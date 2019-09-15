import { createConnection } from 'typeorm'
import { ormconfig } from '../config/ormconfig'
import { getRandomItem, WeightObj, sleep } from './utils/common'
import logger from './services/logger'
import { ResourceEntity } from '../config/entities/resouce.entity'
import { Action } from './services/action'

const main = async () => {
  const connection = await createConnection(ormconfig)
  let action: Action
  let times = 0
  let successCount = 0

  const resRepo = connection.getRepository(ResourceEntity)
  const [resouces] = await resRepo.findAndCount()

  // 计算出全部下载次数
  const totalDownload = resouces.reduce((prev, cur) => {
    return prev + cur.download
  }, 0)

  // 计算出权重，下载次数越多， 权重越低， 某个资源下载次数过多
  const resoucesWithWeight: WeightObj<ResourceEntity>[] = resouces.map((item) => {
    // 如果当周还没下载过，权重增加
    return {
      weight: item.weeklyDownload === 0 ? 10000 : totalDownload - item.download,
      value: item
    }
  })

  while (++times) {
    // 太晚了，都睡觉了，不下载
    if (new Date().getHours() < 10) {
      await sleep(2 * 3600 * 1000)
      continue
    }

    logger.info(`time: ${times}; successCount: ${successCount}`)
    const curPanObj = getRandomItem(resoucesWithWeight)
    logger.info('Get random pan obj', {
      link: curPanObj.link,
      name: curPanObj.name
    })
    action = new Action(connection, {
      target: curPanObj
    })
    const result = await action.run()

    result === true && successCount++
  }

  logger.info('============全部任务完成！============')
}

main()
