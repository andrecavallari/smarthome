declare module 'crypto-js' {
  export interface WordArray {
    toString(encoder?: any): string;
  }

  export interface CipherParams {
    toString(): string;
  }

  export interface Encoder {
    parse(str: string): WordArray;
    stringify(wordArray: WordArray): string;
  }

  export interface CipherOption {
    mode?: any;
    padding?: any;
    iv?: WordArray;
  }

  export namespace enc {
    export const Utf8: Encoder;
    export const Hex: Encoder;
    export const Base64: Encoder;
  }

  export namespace mode {
    export const ECB: any;
    export const CBC: any;
  }

  export namespace pad {
    export const Pkcs7: any;
    export const NoPadding: any;
  }

  export namespace AES {
    export function encrypt(
      message: string | WordArray,
      key: string | WordArray,
      options?: CipherOption
    ): CipherParams;
    
    export function decrypt(
      ciphertext: string | CipherParams,
      key: string | WordArray,
      options?: CipherOption
    ): WordArray;
  }

  export function MD5(message: string | WordArray): WordArray;
  export function SHA256(message: string | WordArray): WordArray;
}
