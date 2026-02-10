export const getIp = (req) => {
  var ip =
    req.headers['x-forwarded-for'] ||
    req.headers['Proxy-Client-IP'] ||
    req.headers['WL-Proxy-Client-IP'] ||
    req.headers['HTTP_CLIENT_IP'] ||
    req.headers['HTTP_X_FORWARDED_FOR'] ||
    req.remoteAddress ||
    req?.ip?.match(/\d+.\d+.\d+.\d+/)?.[0]
  return ip
}

export const generateRandomString = (length: number) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
}
