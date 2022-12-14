import CipherMap from "../types/cipherMap";
import EncryptedData from "../types/encryptedData";
import Metadata from "../types/metadata";
import { base64ToBlob, duplicateFileWithNewContents, generateFilename, getBase64StringFromDataURL, isImageFile, loadFileAsBuffer, loadFileAsDataURL, loadFileAsString } from "./file";
import { arrayBufferToUintArray } from "./json";

// REFERENCE: https://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
export const stringToUint8Array = (data: string) => {
    const encoder = new TextEncoder();

    return encoder.encode(data);
}

export const bufferSourceToString = (data: BufferSource) => {
    const decoder = new TextDecoder();

    return decoder.decode(data);
}

// REFERENCE: https://stackoverflow.com/questions/62102034/javascript-how-to-encrypt-string-with-only-password-in-2020
const deriveKeyFromPassword = async (password: string) => {
    const salt = stringToUint8Array(password);
    const algorithm = {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt,
        iterations: 1000
    };

    const importedKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        {
            name: algorithm.name
        },
        false,
        [
            'deriveKey'
        ]
    );

    return crypto.subtle.deriveKey(
        algorithm,
        importedKey,
        {
            name: 'AES-GCM',
            length: 256
        },
        false,
        [
            'encrypt',
            'decrypt'
        ]
    )
}

export const encryptData = async(buffer: ArrayBuffer, password: string): Promise<EncryptedData> => {
    // 1. generate a 16 byte long initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(16));
    // 2. specify the algorithm we want to use for the encryption 
    const algorithm = {
        name: "AES-GCM",
        length: 256,
        iv
    };

    // 3. "generate" the key from the password, derive it
    const key = await deriveKeyFromPassword(password);
    // 4. encrypt the file contents
    const cipherTextBuffer = await crypto.subtle.encrypt(algorithm, key, buffer);
    const cipherText = arrayBufferToUintArray(cipherTextBuffer);

    // 5. return the encrypted data & the initilization vector
    return {
        cipherText,
        iv
    };
}

export const decryptData = async({ cipherText, iv }: EncryptedData, password: string) => {
    // 1. specify the algorithm for decryption, using the iv from the parameters
    const algorithm = {
        name: "AES-GCM",
        length: 256,
        iv
    };

    // 2. get the key from the password (derive it)
    const key = await deriveKeyFromPassword(password);

    // 3. decrypt the encrypted data using the algorithm & key pair
    return crypto.subtle.decrypt(algorithm, key, cipherText);
}

// REFERENCE: https://stackoverflow.com/questions/40680431/how-can-i-encrypt-decrypt-arbitrary-binary-files-using-javascript-in-the-browser
export const encryptFileContents = async (file: File, password: string): Promise<EncryptedData> => {
    // 1. load file into buffer to encrypt, i.e put the file contents in memory
    const buffer = await loadFileAsBuffer(file);

    // 2. encrypt the data (file contents in memory -> buffer)
    return encryptData(buffer, password);
}

// REFERENCE: https://stackoverflow.com/questions/40680431/how-can-i-encrypt-decrypt-arbitrary-binary-files-using-javascript-in-the-browser
export const decryptFileContents = async (data: EncryptedData, { name, extension }: Metadata, password: string) => {
    const decryptedContents = await decryptData(data, password);
    const filename = generateFilename(name, extension);

    return new File([decryptedContents], filename);
}

export const inverseCipherMap = (cipherMap: CipherMap) => {
    return Object.entries(cipherMap).reduce(
        (previous, [key, value]) => {
            previous[value] = key;

            return previous;
        },
        {} as CipherMap
    );
}

export const getCipherMapFromFile = async (file: File) => {
    const data = await loadFileAsString(file);

    return JSON.parse(data) as CipherMap;
}

// TODO: fix trouble with JPEG files in that it ruins the encoding somehow?
export const encodeImageFile = async (file: File, cipherMap: CipherMap) => {
    const dataURL = await loadFileAsDataURL(file);
    const base64String = getBase64StringFromDataURL(dataURL);

    const encodedContents = base64String.split('').map(
        // cannot use number as key (JSON) so implict conversion to string
        (value) => cipherMap[value] || value
    ).join('');

    // console.log(base64String);
    // console.log(encodedContents);

    const blob = base64ToBlob(encodedContents, file.type);
    const newFile = duplicateFileWithNewContents(file, blob);

    return newFile;
}

// TODO: fix trouble with JPEG files in that it ruins the encoding somehow?
// TODO: handle binary files
export const encodeFile = async (file: File, cipherMap: CipherMap) => {
    if (isImageFile(file)) {
        return encodeImageFile(file, cipherMap);
    }

    const buffer = await loadFileAsBuffer(file);
    const contents = arrayBufferToUintArray(buffer);

    // TODO: make generic binary encoding system
    const encodedContents = contents;

    // const encodedContents = contents.map(
    //     // cannot use number as key (JSON) so implict conversion to string
    //     (value) => cipherMap[value] || value
    // );

    const newFile = duplicateFileWithNewContents(file, encodedContents);

    return newFile;
}

export const decodeFile = async (file: File, cipherMap: CipherMap) => {
    const inversedCipherMap = inverseCipherMap(cipherMap);

    return encodeFile(file, inversedCipherMap);
}

// TODO: consider making own file format!