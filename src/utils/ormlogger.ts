import { createLogger, format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { resolve } from 'path'
import { Logger } from 'typeorm'
import { LoggerOptions } from 'typeorm/logger/LoggerOptions'
import { logPath } from '../../config'

const rotateTransport = new DailyRotateFile({
  filename: 'ormlogs.log.%DATE%',
  datePattern: 'YYYY-MM-DD',
  dirname: resolve(logPath),
  zippedArchive: true,
  maxFiles: '14d'
})

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    // format.splat(),
    format.printf((info) => `[${info.timestamp}] ${info.message}`)
    // format.json(),
  ),
  defaultMeta: { service: 'typeorm logger' },
  transports: [
    // new transports.File({
    //   filename: 'ormlogs.log',
    //   dirname: resolve(logPath),
    // }),
    rotateTransport
  ]
})

export class OrmLogger implements Logger {
  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(private options?: LoggerOptions) {}

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Logs query and parameters used in it.
   */
  // logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
  logQuery(query: string, parameters?: any[]) {
    if (
      this.options === 'all' ||
      this.options === true ||
      (this.options instanceof Array && this.options.indexOf('query') !== -1)
    ) {
      // 排除 插入的日志，因为批量插入 sql 字段太 tm 长了
      // if (query.startsWith('INSERT INTO')) {
      //   return false
      // }
      const sql =
        query +
        (parameters && parameters.length
          ? ` -- PARAMETERS: ${this.stringifyParams(parameters)}`
          : '')
      this.write(`[QUERY]: ${sql}`)
    }
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(error: string, query: string, parameters?: any[]) {
    if (
      this.options === 'all' ||
      this.options === true ||
      (this.options instanceof Array && this.options.indexOf('error') !== -1)
    ) {
      const sql =
        query +
        (parameters && parameters.length
          ? ` -- PARAMETERS: ${this.stringifyParams(parameters)}`
          : '')
      this.write([`[FAILED QUERY]: ${sql}`, `[QUERY ERROR]: ${error}`])
    }
  }

  /**
   * Logs query that is slow.
   */
  logQuerySlow(time: number, query: string, parameters?: any[]) {
    const sql =
      query +
      (parameters && parameters.length ? ` -- PARAMETERS: ${this.stringifyParams(parameters)}` : '')
    this.write(`[SLOW QUERY: ${time} ms]: ${sql}`)
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string) {
    if (
      this.options === 'all' ||
      (this.options instanceof Array && this.options.indexOf('schema') !== -1)
    ) {
      this.write(message)
    }
  }

  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string) {
    this.write(message)
  }

  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  log(level: 'log' | 'info' | 'warn', message: any) {
    switch (level) {
      case 'log':
        if (
          this.options === 'all' ||
          (this.options instanceof Array && this.options.indexOf('log') !== -1)
        )
          this.write(`[LOG]: ${message}`)
        break
      case 'info':
        if (
          this.options === 'all' ||
          (this.options instanceof Array && this.options.indexOf('info') !== -1)
        )
          this.write(`[INFO]: ${message}`)
        break
      case 'warn':
        if (
          this.options === 'all' ||
          (this.options instanceof Array && this.options.indexOf('warn') !== -1)
        )
          this.write(`[WARN]: ${message}`)
        break
      default:
        this.write(`[Unknown]: ${message}`)
    }
  }

  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------

  /**
   * Writes given strings into the log file.
   */
  protected write(strings: string | string[]) {
    strings = strings instanceof Array ? strings : [strings]

    logger.info(`${strings.join('\r\n')}\r\n`)
  }

  /**
   * Converts parameters to a string.
   * Sometimes parameters can have circular objects and therefor we are handle this case too.
   */
  protected stringifyParams(parameters: any[]) {
    try {
      return JSON.stringify(parameters)
    } catch (error) {
      // most probably circular objects in parameters
      return parameters
    }
  }
}
