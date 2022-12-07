import axios from "../resources/axiosInstance";

interface SBFilesPostRequestPayload {
    name: string;
    password: string;
    extension: string;
    // we stringify the encrypted data so that we don't need to create a
    // relation on the backend with an inner object that contains the
    // encrypted data, this keeps the process simpler & nicer to work with
    encryptedData: string;
}

export const postSBFiles = async (payload: SBFilesPostRequestPayload) => {
    const { data } = await axios.post('SBFiles', payload);

    return data;
};