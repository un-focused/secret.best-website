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

export const loadFileAsDataURL = (file: File): Promise<string> => {
    return new Promise(
        (resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const data = event.target?.result;
                
                if (!data) {
                    reject('no data in file');
                    return;
                }

                resolve(data as string);
            }

            reader.readAsDataURL(file);
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

// REFERENCE: https://stackoverflow.com/questions/7977084/check-file-type-when-form-submit
export const isImageFile = (file: File) => {
    const extension = getFileExtension(file).toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'gif':
      case 'bmp':
      case 'png':
        return true;
    }

    return false;
}
  
export const isVideoFile = (file: File) => {
    const extension = getFileExtension(file).toLowerCase();

    switch (extension) {
      case 'm4v':
      case 'avi':
      case 'mpg':
      case 'mp4':
        return true;
    }

    return false;
}

// REFERENCE: https://pqina.nl/blog/convert-an-image-to-a-base64-string-with-javascript/
export const getBase64StringFromDataURL = (dataURL: string) => dataURL.replace('data:', '').replace(/^.+,/, '');

// REFERENCE: https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
export const base64ToBlob = (base64String: string, contentType: string, sliceSize = 512) => {
    const byteCharacters = atob(base64String);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
    
        const byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }
  
    return new Blob(byteArrays,
        {
            type: contentType
        }
    );
}