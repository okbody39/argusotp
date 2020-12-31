const aesjs = require("aes-js");
import CryptoES from 'crypto-es';

const ENC_KEY = "bf3c199c2470cb1759907b1e0905c17b";
const IV = "5185207c72eec9e4";

export function encryptStr(val) {
  // const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  let value = null;

  if (typeof val === 'object') { // JSON
    value = JSON.stringify(val);
  } else {
    value = '' + val;
  }

  // let encVal = cipher.update(value, 'utf8', 'base64');
  // encVal += cipher.final('base64');

  let encVal = CryptoES.AES.encrypt(value, CryptoES.enc.Utf8.parse(ENC_KEY),
      {
        iv: CryptoES.enc.Utf8.parse(IV),
        mode: CryptoES.mode.CBC,
        padding: CryptoES.pad.Pkcs7,
      });

  return encVal;

}

export function decryptStr(encVal, defaultVal) {
  // const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  // let decVal = decipher.update(encVal, 'base64', 'utf8');
  // decVal += decipher.final('utf8');

  let bytes = CryptoES.AES.decrypt(encVal, CryptoES.enc.Utf8.parse(ENC_KEY),
      {
        iv: CryptoES.enc.Utf8.parse(IV),
        mode: CryptoES.mode.CBC,
        padding: CryptoES.pad.Pkcs7,
      });

  let decVal = bytes.toString(CryptoES.enc.Utf8);
  let retVal = null;

  if (typeof defaultVal === 'object') {
    retVal = JSON.parse(decVal);
  } else if (typeof defaultVal === 'number') {
    retVal = parseInt(decVal);
  } else if (typeof defaultVal === 'boolean') {
    retVal = (decVal === 'true');
  } else {
    retVal = '' + decVal;
  }

  return retVal;

}


export function encrypt (targetStr, encKey) {

  let key = aesjs.utils.utf8.toBytes(encKey);
  let aesEcb = new aesjs.ModeOfOperation.ecb(key);

  let textBytes = aesjs.utils.utf8.toBytes(targetStr);
  let encryptedBytes = aesEcb.encrypt(textBytes);
  let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

  return encryptedHex;
}

export function decrypt (targetStr, encKey) {

  let key = aesjs.utils.utf8.toBytes(encKey);
  let aesEcb = new aesjs.ModeOfOperation.ecb(key);

  let encryptedBytes = aesjs.utils.hex.toBytes(targetStr);
  let decryptedBytes = aesEcb.decrypt(encryptedBytes);
  let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  // 중요 : 절대 삭제하지 말것!!!
  // **** let jsonText = decryptedText.substring(0, decryptedText.indexOf("}") + 1);
  // let jsonText = decryptedText.substring(0, decryptedText.length - 8);

  // console.log(decryptedText, decryptedText.length);
  // console.log(jsonText, jsonText.length);

  let jsonText = decryptedText.substring(0, decryptedText.lastIndexOf("}") + 1);

  return jsonText;

}
