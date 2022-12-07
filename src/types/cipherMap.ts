export default interface CipherMap {
    // value is number to work with all encoding systems
    // number will allow us to be able to work with binary files too!
    [key: string]: number;
};