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

export const getSBFileExists = async (id: number) => {
    const { data } = await axios.get(`SBFiles/exists/${ id }`);

    console.log('data', data);

    // return true or false for exists as per the backend code
    // true if successful response back otherwise error
    return !!data;
}