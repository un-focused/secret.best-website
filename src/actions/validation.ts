import CipherMap from "../types/cipherMap";
import { getFileExtension, loadFileAsString } from "./file"

export const isValidCipherMapFile = async (file: File) => {
    const data = await loadFileAsString(file);
    const extension = getFileExtension(file);

    if (extension !== 'json') {
        return false;
    }

    try {
        const contents = JSON.parse(data) as CipherMap;

        for (const value of Object.values(contents)) {
            if (typeof value !== 'string') {
                return false;
            }
        }

        return true;
    } catch(error) {
        return false;
    }
}