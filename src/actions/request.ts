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