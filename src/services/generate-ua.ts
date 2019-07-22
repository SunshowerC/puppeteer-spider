import UserAgent from 'user-agents'
import faker from 'faker'
import { WeigthObj, getRandomItem } from '../utils/common'

const chineseUas: WeigthObj[] = [
  {
    weigth: 15,
    value: `360SE`
  },
  {
    weigth: 10,
    value: `SE 2.X MetaSr 3.2.124`
  },
  {
    weigth: 10,
    value: 'QQBrowser/6.5.9225.201'
  },
  {
    weigth: 5,
    value: `BAIDUBrowser 3.8.2311.100`
  },
  {
    value: `Maxthon/3.0 Safari/533.9`,
    weigth: 10
  },
  {
    value: `UBrowser/4.0.3214.0 Safari/537.36`,
    weigth: 10
  },
  {
    value: ``,
    weigth: 45
  }
]

const randomBetween = (begin: number, end: number) => {
  const randomNum = Math.round(begin * Math.random())
  return randomNum + end - begin
}

export const generateUserAgent = () => {
  let ua = ''
  const chineseUa: string = getRandomItem(chineseUas)
  if (chineseUa) {
    ua = `${faker.internet.userAgent()} ${chineseUa}`
    ua = ua.replace(/Chrome\/\d{2}/, `Chrome/${randomBetween(40, 75)}`)
  } else {
    ua = new UserAgent({
      platform: 'Win32'
    })
  }
  return ua.toString()
}
