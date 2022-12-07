export default interface EncryptedData {
    cipherText: Uint8Array | Uint16Array | Uint32Array;
    iv: Uint8Array;
};