import { sm3, sm4 } from 'sm-crypto'

export class CryptoUtil {
  private static readonly SM4_KEY = process.env.SM4_KEY || '0123456789abcdef'

  // SM3签名
  static sign(data: string): string {
    return sm3(data)
  }

  // 验证签名
  static verifySignature(data: string, signature: string): boolean {
    return sm3(data) === signature
  }

  // SM4加密
  static encrypt(data: string): string {
    const sm4Instance = new sm4.SM4({ key: this.SM4_KEY })
    return sm4Instance.encrypt(data)
  }

  // SM4解密
  static decrypt(data: string): string {
    const sm4Instance = new sm4.SM4({ key: this.SM4_KEY })
    return sm4Instance.decrypt(data)
  }
}
