import CryptoJS from 'crypto-js';

// Helper para convertir el formato "240, 3, 45, 29..." a un WordArray de CryptoJS
const parseByteArray = (byteStr: string) => {
  try {
    const bytes = byteStr.split(',').map(num => {
      const parsed = parseInt(num.trim(), 10);
      return isNaN(parsed) ? 0 : parsed;
    });
    // Convertir a Hexadecimal asegurando 2 caracteres por byte (ej. 240 -> f0)
    const hexString = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    return CryptoJS.enc.Hex.parse(hexString);
  } catch (error) {
    return CryptoJS.enc.Hex.parse("");
  }
};

// ==========================================
// 1. LEGACY: TripleDES Dinámico
// ==========================================
export const encryptLegacy3DES = (plainText: string, keyString: string, ivString: string): string => {
  if (!plainText || !keyString || !ivString) return '';
  try {
    // La llave se somete a un hash MD5 tal como en MD5CryptoServiceProvider
    const key = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(keyString)); 
    const iv = parseByteArray(ivString);

    const encrypted = CryptoJS.TripleDES.encrypt(CryptoJS.enc.Latin1.parse(plainText), key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  } catch (error) {
    console.error("Error en TripleDES Encrypt", error);
    return 'Error en la encriptación Legacy';
  }
};

export const decryptLegacy3DES = (cipherText: string, keyString: string, ivString: string): string => {
  if (!cipherText || !keyString || !ivString) return '';
  try {
    const key = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(keyString)); 
    const iv = parseByteArray(ivString);

    const decrypted = CryptoJS.TripleDES.decrypt(cipherText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Latin1) || 'Llave, IV incorrecto o texto corrupto';
  } catch (error) {
    console.error("Error en TripleDES Decrypt", error);
    return 'Error al desencriptar Legacy.';
  }
};

// ==========================================
// 2. AES CUSTOM
// ==========================================
export const encryptAESCustom = (plainText: string, keyString: string): string => {
  if (!plainText || !keyString) return '';
  try {
    const paddedKey = keyString.padEnd(16, '\0');
    const key = CryptoJS.enc.Utf8.parse(paddedKey);
    const iv = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const ivBase64 = CryptoJS.enc.Base64.stringify(iv);
    const ciphertextBase64 = encrypted.toString();

    return `IV${ivBase64}Ciphertext${ciphertextBase64}`;
  } catch (error) {
    console.error("Error en AES Encrypt", error);
    return 'Error en la encriptación AES';
  }
};

export const decryptAESCustom = (encryptedText: string, keyString: string): string => {
  if (!encryptedText || !keyString) return '';
  try {
    const ivStart = encryptedText.indexOf("IV") + 2;
    const ctStart = encryptedText.indexOf("Ciphertext") + 10;
    
    if (ivStart < 2 || ctStart < 10) return "Error: El formato no coincide con IV...Ciphertext...";

    const ivBase64 = encryptedText.substring(ivStart, ctStart - 10);
    const ciphertextBase64 = encryptedText.substring(ctStart);

    const paddedKey = keyString.padEnd(16, '\0');
    const key = CryptoJS.enc.Utf8.parse(paddedKey);
    const iv = CryptoJS.enc.Base64.parse(ivBase64);

    const decrypted = CryptoJS.AES.decrypt(ciphertextBase64, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8) || 'Llave incorrecta o texto corrupto';
  } catch (error) {
    console.error("Error en AES Decrypt", error);
    return 'Error al desencriptar AES. Verifica el formato.';
  }
};