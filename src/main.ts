import { createConnection } from 'typeorm'
import { ormconfig } from '../config/ormconfig'
import { getRandomOne } from './utils/common'
import logger from './services/logger'
import { ResourceEntity } from '../config/entities/resouce.entity'
import { Action } from './services/action'

const main = async () => {
  const connection = await createConnection(ormconfig)
  let action: Action
  let times = 1000

  const resRepo = connection.getRepository(ResourceEntity)
  const [panUrls] = await resRepo.findAndCount()

  while (times--) {
    logger.info(`time: ${times}`)
    const curPanObj = getRandomOne(panUrls)

    action = new Action(connection, {
      target: curPanObj
    })
    await action.run()
  }

  logger.info('============全部任务完成！============')
}

main()
