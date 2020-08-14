var aesjs = require("aes-js");

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
