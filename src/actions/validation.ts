import { getCipherMapFromFile } from "./cryptography";
import { getFileExtension } from "./file";

export const isValidFile = (file: File, maxSize = Number.MAX_VALUE) => {
    return file.size <= maxSize;
}

export const isValidPassword = (password: string) => {
    return password && password.length >= 6 && !password.includes(' ');
}

export const isValidCipherMapFile = async (file: File) => {
    const extension = getFileExtension(file);

    if (extension !== 'json') {
        return false;
    }

    try {
        const data = await getCipherMapFromFile(file);

        for (const value of Object.values(data)) {
            if (typeof value !== 'string') {
                return false;
            }
        }

        return true;
    } catch(error) {
        return false;
    }
}