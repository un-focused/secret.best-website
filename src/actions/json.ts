export const jsonArrayToArray = (data: object) => {
    const array = new Array(Object.keys(data).length);

    for (const [key, value] of Object.entries(data)) {
        const index = +key;

        array[index] = value;
    }

    return array;
}

export const arrayBufferToUintArray = (buffer: ArrayBuffer) => {
    try {
        return new Uint32Array(buffer);
    } catch(error) {}

    try {
        return new Uint16Array(buffer);
    } catch(error) {}

    // last one, so throwing error is fine as it is a failed force "cast"!
    return new Uint8Array(buffer);
}