/** Read a file reference and return a base64 encoded string representation of the file. */
export function readFile(file: File): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => resolve(new Uint8Array(e.target.result as ArrayBuffer));
    }).then((bytes: Uint8Array) => btoa(bytes.reduce((data, byte) => data + String.fromCharCode(byte), '')));
}
