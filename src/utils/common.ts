export const sleep = (duration: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

export interface WeigthObj {
  weigth: number
  value: any
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
  console.log('arr', arr)
  throw new Error('未知错误')
}
