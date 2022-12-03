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
    const cipherText = await crypto.subtle.encrypt(algorithm, key, buffer);

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

export const generateFilename = (name: string, extension: string) => `${ name }.${ extension }`;

// REFERENCE: https://stackoverflow.com/questions/40680431/how-can-i-encrypt-decrypt-arbitrary-binary-files-using-javascript-in-the-browser
export const decryptFileContents = async (data: EncryptedData, { name, extension }: Metadata, password: string) => {
    const decryptedContents = await decryptData(data, password);
    const filename = generateFilename(name, extension);

    return new File([decryptedContents], filename);
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