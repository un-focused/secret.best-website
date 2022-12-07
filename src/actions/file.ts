export const loadFileAsString = (file: File) => {
    return file.text();
}

// TODO: clean up this file (break into multiple & add comments)
export const loadFileAsBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise(
        (resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const data = event.target?.result;
                
                if (!data) {
                    reject('no data in file');
                    return;
                }

                resolve(data as ArrayBuffer);
            }

            reader.readAsArrayBuffer(file);
        }
    );
}

export const generateFilename = (name: string, extension: string) => `${ name }.${ extension }`;

// REFERENCE: https://stackoverflow.com/questions/43708127/javascript-get-the-filename-and-extension-from-input-type-file
export const getFileExtension = (file: File) => {
    const { name } = file;
    const lastDotIndex = name.lastIndexOf('.');

    if (!lastDotIndex) {
        throw {
            message: 'no extension in file name'
        };
    }

    return name.substring(lastDotIndex + 1);
}

export const getFilename = (file: File) => {
    const { name } = file;
    const lastDotIndex = name.lastIndexOf('.');

    if (!lastDotIndex) {
        return name;
    }

    return name.substring(0, lastDotIndex);
}

// not a complete implementation
export const duplicateFileWithNewContents = ({ type, name }: File, contents: string | BlobPart) => {
    console.log('ccc', contents);
    const blob = new Blob([contents],
        {
            type
        }
    );

    return new File([blob], name);
}

export const downloadFile = (file: File) => {
    const url = window.URL.createObjectURL(file);

    downloadLink(url, file.name);
}

export const downloadLink = (url: string, name: string) => {
    const linkElement = document.createElement('a');

    linkElement.href = url;
    linkElement.setAttribute('download', name);

    document.body.appendChild(linkElement);

    linkElement.click();

    linkElement.parentNode?.removeChild(linkElement);
}