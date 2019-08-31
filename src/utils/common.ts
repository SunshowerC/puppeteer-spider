import logger from '../services/logger'

export const sleep = (duration: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

export interface WeigthObj {
  weigth: number
  value: any
}

export const getRandomOne = <T>(arr: T[]): T => {
  const len = arr.length
  const randomIdx = Math.floor(Math.random() * len)
  return arr[randomIdx]
}

export const getRandomItem = (arr: WeigthObj[]): WeigthObj['value'] => {
  const sumWeight = arr.reduce((prev, cur) => prev + cur.weigth, 0)
  let randomNum = Math.random() * sumWeight
  for (const item of arr) {
    if (randomNum <= item.weigth) {
      return item.value
    }
    randomNum -= item.weigth
  }
  logger.error('getRandomItem 未知错误', arr)
}
