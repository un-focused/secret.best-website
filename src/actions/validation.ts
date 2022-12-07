import { getCipherMapFromFile } from "./cryptography";
import { getFileExtension, loadFileAsString } from "./file"

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