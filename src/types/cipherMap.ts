// cipher map data assumes every value has a map otherwise
// there may be a case where a number may get encoded twice
// i.e 1, 2, 3 - using map [1: 2] = 2, 2, 3 thus when decoded
// becomes [1, 1, 3] which is incorrect!
export default interface CipherMap {
    // value is number to work with all encoding systems
    // number will allow us to be able to work with binary files too!
    [key: string]: number;
};