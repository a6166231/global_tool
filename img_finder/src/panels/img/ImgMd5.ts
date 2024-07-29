import fs from 'fs';
import crypto from 'crypto';
import { singleton } from '../singleton';

function generateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (chunk) => {
            hash.update(chunk);
        });

        stream.on('end', () => {
            resolve(hash.digest('hex'));
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
}

export class ImgMD5 extends singleton {
    async getHash(filePath: string) {
        return generateFileHash(filePath)
    }
}