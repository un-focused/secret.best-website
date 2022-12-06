export const jsonArrayToArray = (data: object) => {
    const array = new Array(Object.keys(data).length);

    for (const [key, value] of Object.entries(data)) {
        const index = +key;

        array[index] = value;
    }

    return array;
}