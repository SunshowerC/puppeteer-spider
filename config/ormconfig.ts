import config from './config.json'
import appRoot from 'app-root-path'
import { resolve } from 'path';
import typeorm, {ConnectionOptions} from 'typeorm'
import { OrmLogger } from '../src/utils/ormlogger';

export const ormconfig: ConnectionOptions = {
  type: 'mysql',
  entities: [ resolve(__dirname, `entities/*.entity{.ts,.js}`) ],
  // subscribers: [`${locationPath}/**/*.subscriber{.ts,.js}`],
  synchronize: true,
  logging: ['error', 'query'],
  logger: new OrmLogger('all'),
  maxQueryExecutionTime: 1000,
  
  ...config.mysqlConfig
  
}


