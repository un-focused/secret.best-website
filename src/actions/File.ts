export const loadFileAsBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise(
        (resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = event.target?.result;
                
                if (!data) {
                    reject('no data in file');
                    return;
                }

                resolve(data as ArrayBuffer);
            }

            reader.readAsArrayBuffer(file);
        }
    );
}

// REFERENCE: https://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
const stringToUint8Array = (data: string) => {
    const encoder = new TextEncoder();

    return encoder.encode(data);
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

export interface EncryptedData {
    cipherText: ArrayBuffer;
    iv: Uint8Array;
}

export interface Metadata {
    name: string;
    extension: string;
}

// REFERENCE: https://stackoverflow.com/questions/40680431/how-can-i-encrypt-decrypt-arbitrary-binary-files-using-javascript-in-the-browser
export const encryptFileContents = async (file: File, password: string): Promise<any> => {
    const buffer = await loadFileAsBuffer(file);
    // Generate a 16 byte long initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const algorithm = {
        name: "AES-GCM",
        length: 256,
        iv
    };

    const key = await deriveKeyFromPassword(password);
    const encodedData = stringToUint8Array(buffer.toString());
    const cipherText = await crypto.subtle.encrypt(algorithm, key, encodedData);

    console.log('ct', new TextDecoder().decode(cipherText));
    console.log('ed', encodedData.toString());
    return {
        cipherText: new TextDecoder().decode(cipherText),
        iv
    };
}

// REFERENCE: https://stackoverflow.com/questions/40680431/how-can-i-encrypt-decrypt-arbitrary-binary-files-using-javascript-in-the-browser
export const decryptFileContents = async (data: EncryptedData, metadata: Metadata, password: string) => {
    const algorithm = {
        name: "AES-GCM",
        length: 256,
        iv: data.iv
    };

    const key = await deriveKeyFromPassword(password);
    const textDecoder = new TextDecoder();

    return textDecoder.decode(
        await crypto.subtle.decrypt(
            algorithm,
            key,
            data.cipherText
        )
    );
}

// REFERENCE: https://stackoverflow.com/questions/43708127/javascript-get-the-filename-and-extension-from-input-type-file
export const getFileExtension = (file: File) => {
    const { name } = file;
    const lastDotIndex = name.lastIndexOf('.');

    if (!lastDotIndex) {
        throw {
            message: 'no extension in file name'
        };
    }

    return name.substring(lastDotIndex + 1);
}