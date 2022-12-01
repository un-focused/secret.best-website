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

// REFERENCE: https://stackoverflow.com/questions/40680431/how-can-i-encrypt-decrypt-arbitrary-binary-files-using-javascript-in-the-browser
export const encryptFileContents = async (file: File, password: string) => {
    const buffer = await loadFileAsBuffer(file);
    // Generate a 16 byte long initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const algorithm = {
        name: "AES-CTR",
        iv
    };
    const key = await crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );

    const result = await crypto.subtle.encrypt(algorithm, key, buffer);
}