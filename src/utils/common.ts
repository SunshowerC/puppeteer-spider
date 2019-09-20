import logger from '../services/logger'

export const sleep = (duration: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

export interface WeightObj<T> {
  weight: number
  value: T
}

export const getRandomOne = <T>(arr: T[]): T => {
  const len = arr.length
  const randomIdx = Math.floor(Math.random() * len)
  return arr[randomIdx]
}

export const getRandomItem = <T>(arr: WeightObj<T>[]): T => {
  const sumWeight = arr.reduce((prev, cur) => prev + cur.weight, 0)
  let randomNum = Math.random() * sumWeight
  for (const item of arr) {
    if (randomNum <= item.weight) {
      return item.value
    }
    randomNum -= item.weight
  }
  logger.error('getRandomItem 未知错误', arr)
  return arr[0].value
}
