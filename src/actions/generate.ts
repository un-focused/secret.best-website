export const generatePassword = (length = 6) => {
    let password = '';
    for (let i = 0; i < length; ++i) {
        // 65 = A, 90 = Z (exclusive so + 1)
        const characterCode = generateRandomInt(65, 91);
        const character = String.fromCharCode(characterCode);

        password += character;
    }

    return password;
}

// REFERENCE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
export const generateRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    // The maximum is exclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min) + min);
}