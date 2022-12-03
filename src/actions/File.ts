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

const uint8ArrayToString = (data: Uint8Array) => {
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

export interface EncryptedData {
    cipherText: ArrayBuffer;
    iv: Uint8Array;
}

export interface Metadata {
    name: string;
    extension: string;
}

// REFERENCE: https://stackoverflow.com/questions/40680431/how-can-i-encrypt-decrypt-arbitrary-binary-files-using-javascript-in-the-browser
export const encryptFileContents = async (file: File, password: string): Promise<EncryptedData> => {
    // 1. load file into buffer to encrypt, i.e put the file contents in memory
    const buffer = await loadFileAsBuffer(file);
    // 2. generate a 16 byte long initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(16));
    // 3. specify the algorithm we want to use for the encryption 
    const algorithm = {
        name: "AES-GCM",
        length: 256,
        iv
    };

    // 4. "generate" the key from the password, derive it
    const key = await deriveKeyFromPassword(password);
    // 5. prepare the file contents to be encrypted (buffer to string to uint8Array)
    // const encodedData = stringToUint8Array(buffer.toString());
    // 6. encrypt the file contents
    const cipherText = await crypto.subtle.encrypt(algorithm, key, buffer);

    // 7. return the encrypted data & the initilization vector
    return {
        cipherText,
        iv
    };
}

// REFERENCE: https://stackoverflow.com/questions/40680431/how-can-i-encrypt-decrypt-arbitrary-binary-files-using-javascript-in-the-browser
export const decryptFileContents = async (data: EncryptedData, metadata: Metadata, password: string) => {
    // 1. specify the algorithm for decryption, using the iv from the parameters
    const algorithm = {
        name: "AES-GCM",
        length: 256,
        iv: data.iv
    };

    // 2. get the key from the password (derive it)
    const key = await deriveKeyFromPassword(password);
    // const textDecoder = new TextDecoder();
    // 3. decrypt the encrypted data using the algorithm & key pair
    const decryptedContents = await crypto.subtle.decrypt(algorithm, key, data.cipherText);

    const file = new File([decryptedContents], metadata.name);
    // const decodedData = uint8ArrayToString();
    // const decodedData = stringToUint8Array(decryptedContents.toString());

    return file;
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