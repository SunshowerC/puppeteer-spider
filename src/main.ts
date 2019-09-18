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
  let [resouces] = await resRepo.findAndCount()

  // 计算出全部下载次数
  const totalDownload = resouces.reduce((prev, cur) => {
    return prev + cur.download
  }, 0)

  // 计算出权重，下载次数越多， 权重越低， 某个资源下载次数过多
  let resoucesWithWeight: WeightObj<ResourceEntity>[] = resouces.map((item) => {
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
      logger.info(`睡眠时间：${new Date()}`)
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

    if (result === true) {
      successCount++
      // 如果下载成功，重新拉取 db 数据
      const [tempResult] = await resRepo.findAndCount()
      resouces = tempResult

      resoucesWithWeight = resouces.map((item) => {
        // 如果当周还没下载过，权重增加
        return {
          weight: item.weeklyDownload === 0 ? 10000 : totalDownload - item.download,
          value: item
        }
      })

      // TODO: 下载成功，不用代理ip 刷博客页 10 次
    }
  }

  logger.info('============全部任务完成！============')
}

main()
