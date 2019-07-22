import { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { resolve } from 'path'
import { logPath } from '../../config'

const opt = {
  datePattern: 'YYYY-MM-DD',
  dirname: resolve(logPath),
  zippedArchive: true,
  maxFiles: '7d'
}

const levels = ['error', 'warn', 'info']

const rotateTransports = levels.map(
  (level) =>
    new DailyRotateFile({
      filename: `${level}.log.%DATE%`,
      level,
      ...opt
    })
)

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.splat(), // 可以使用 %d %s
    // format.printf((info) => `[${info.timestamp}] ${info.message}`)
    format.prettyPrint() // json 换行
    // format.json(), // json 格式
  ),
  // defaultMeta: { service: 'Bussiness logger' },
  transports: rotateTransports
  // 如果是本地环境，抛出打印出错误信息。否则会被Winston 捕获并日志
  // exceptionHandlers:  [rotateTransports[0]]
})
logger.add(
  new transports.Console({
    format: format.combine(format.colorize(), format.simple())
  })
)

export default logger
