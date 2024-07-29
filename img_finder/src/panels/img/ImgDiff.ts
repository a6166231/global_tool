
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import path from 'path';
const fs = require('fs')

import { singleton } from '../singleton';
import { www } from '../www';

/**
 * w6166231
 * 2024.7.29
 *
 * @note
 * 图片的相似查找
 * 目前的方式是：
 * - 1.生成特征库：提前处理项目中所有纹理的特征信息，并生成唯一的hash值做主键保存，如果纹理发生了变化则hash值变化，就重新生成一次特征信息
 * - 2.生成截图特征：通过截图时生成的新纹理，生成对应特征，对某些特征占比非常小的直接丢弃 目前是0.1
 * - 3.查找：目前只通过特征的是否相同来进行检索，即可能会出现完全不搭嘎的两张图，因为他俩的某一个特征可能相同
 */
export class ImgDiff extends singleton {

    constructor() {
        super()
        //导入tf库 没有会导致没有import进来的模块
        tf
    }

    init() {
        if (!this.model) {
            return new Promise((resolve, reject) => {
                console.log('start model init')
                mobilenet.load().then(v => {
                    console.log('init model end')
                    this.model = v
                    resolve(this.model)
                })
            })
        }
    }

    async getModel() {
        if (!this.model) {
            await this.init()
        }
        return this.model
    }

    model!: mobilenet.MobileNet;
    extractFeatures(imagePath: string) {
        return new Promise<[Array<{
            className: string;
            probability: number;
        }>, any]>((resolve, reject) => {
            const img = document.createElement('img');
            console.log(imagePath)
            img.src = imagePath;
            img.onload = async () => {
                let model = await this.getModel()
                model!.classify(img).then(v => {
                    resolve([v, model.infer(img, true).arraySync()])
                })
            };
            img.onerror = () => {
                console.error('Failed to load the image.');
                resolve([[], null])
            };
        })
        // console.log(await this.model.classify(img))
        // const predictions = await this.model.infer(img, true);
        // return predictions.arraySync();
    }

    //  async extractFeatures2(imagePath: string) {
    //     const img = document.createElement('img');
    //     img.src = imagePath;
    //     const predictions = await this.model.classify(img);
    //     const featureVector = predictions[0].probability;
    //     return featureVector;
    // }
    createNewImg(queryImagePath: string) {
        return new Promise<string>((resolve, reject) => {
            const base64Data = queryImagePath.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filePath = path.join(Editor.Package.getPath('img_finder') || '', './temp.png')

            fs.writeFile(filePath, buffer, (err: any) => {
                if (err) {
                    console.error('Error writing file:', err);
                } else {
                    console.log('Image saved successfully.');
                }
                resolve(filePath)
            });
        })
    }

    async searchImage(queryImagePath: string) {
        let path = await this.createNewImg(queryImagePath)
        const [tags, features] = await this.extractFeatures(queryImagePath);
        // let first = tf.tensor(features).reshape([1, 32, 32, 1]);
        // console.log(a)
        let database = await www.ImgArrange().getLocalData()
        let similarityMap: Record<number, typeof database> = {}
        let rank = 1
        for (let k in tags) {

            let tag = tags[k].className.split(', ')
            for (const key in database) {
                let value = database[key]
                for (let item of tag) {
                    if (value.data.includes(item)) {
                        if (!similarityMap[rank]) {
                            similarityMap[rank] = {}
                        }
                        similarityMap[rank][value.url] = value
                        break
                    }
                }
            }
            rank++
        }
        console.log(similarityMap)
        return similarityMap
    }

    cosineSimilarity(a: Array<any>, b: Array<any>) {
        const dotProduct = a.reduce((acc, val, i) => acc + val * b[i], 0);
        const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
        const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
        return dotProduct / (normA * normB);
    }

}
