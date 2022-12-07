import axios from "../resources/axiosInstance";
import { SBFilesPostRequestBody, SBFilesPostResponseBody } from "../types/request";

export const getSBFile = async (payload: SBFilesPostRequestBody) => {
    const { data } = await axios.post('SBFiles', payload);

    return data as SBFilesPostResponseBody;
};

export const postSBFiles = async (payload: SBFilesPostRequestBody) => {
    const { data } = await axios.post('SBFiles', payload);

    return data as SBFilesPostResponseBody;
};

// Secret File: http://localhost:5173/secret/67
// Cipher File: http://localhost:5173/secret/66
// Password: AXKCKS

export const getSBFileExists = async (id: number) => {
    // return true or false for exists as per the backend code
    // true if successful response back otherwise errors
    try {
        await axios.get(`SBFiles/exists/${ id }`);

        return true;
    } catch(error) {
        return false;
    }
}