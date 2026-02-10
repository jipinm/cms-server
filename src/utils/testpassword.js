const crypto = require('crypto-js')

const encrypto = (str) => {
  return crypto.MD5(str).toString()
}

console.log(encrypto('icar@2024'))
