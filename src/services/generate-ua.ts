import UserAgent from 'user-agents'

export const generateUserAgent = () => {
  // const ua = faker.internet.userAgent()
  const randomNum = Math.random() * 100
  let ua = ''
  if (randomNum < 15) {
    ua = new UserAgent()
  } else {
    ua = new UserAgent({
      platform: 'Win32'
    })
  }
  return ua.toString()
}
