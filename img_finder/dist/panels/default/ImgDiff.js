"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImgDiff = void 0;
const mobilenet = __importStar(require("@tensorflow-models/mobilenet"));
const path_1 = __importDefault(require("path"));
const fs = require('fs');
class ImgDiff {
    static async getModel() {
        console.log('start model init');
        this.model = await mobilenet.load();
        console.log('init model end');
        return this.model;
    }
    // 提取图片特征向量
    static async extractFeatures(imagePath) {
        if (!this.model)
            this.model = await this.getModel();
        const img = document.createElement('img');
        img.src = imagePath;
        console.log(await this.model.classify(img));
        const predictions = await this.model.infer(img, true);
        return predictions.arraySync();
    }
    static async extractFeatures2(imagePath) {
        const img = document.createElement('img');
        img.src = imagePath;
        const predictions = await this.model.classify(img);
        // 使用Mobilenet的最后一层作为特征向量
        const featureVector = predictions[0].probability;
        return featureVector;
    }
    static createNewImg(queryImagePath) {
        return new Promise((resolve, reject) => {
            // 移除数据URL前缀
            const base64Data = queryImagePath.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filePath = path_1.default.join(Editor.Package.getPath('img_finder') || '', './temp.png'); // 指定图片保存的路径和文件名
            fs.writeFile(filePath, buffer, (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                }
                else {
                    console.log('Image saved successfully.');
                }
                resolve(filePath);
            });
        });
    }
    // 检索最相似的图片
    static async searchImage(queryImagePath) {
        // let path = await this.createNewImg(queryImagePath)
        // const queryFeatures = await this.extractFeatures(path);
        // const a = tf.tensor(queryFeatures).reshape([32, 32]);
        // console.log(a)
        // let maxCosineSimilarity = 0;
        // let bestMatch = null;
        let database = await this.getAllSpfs();
        console.log(database);
        let list = [];
        // for (const key in database) {
        //     let value = database[key]
        //     let dataEquerFeature = await this.extractFeatures(value.url)
        //     // const b = tf.tensor(dataEquerFeature).reshape(a.shape);
        //     // const cosineSim = tf.tidy(() => {
        //     //     return a.dot(b).div(a.norm().mul(b.norm())).dataSync()[0];
        //     // }) * 100;
        //     const cosineSim = this.cosineSimilarity(queryFeatures, dataEquerFeature);
        //     console.log("==-=  3", key, cosineSim)
        //     list.push({
        //         path: key,
        //         per: cosineSim
        //     })
        //     if (cosineSim > maxCosineSimilarity) {
        //         maxCosineSimilarity = cosineSim;
        //         bestMatch = key;
        //     }
        // }
        for (const key in database) {
            let value = database[key];
            // const similarity = this.cosineSimilarity(queryFeatures, value.features);
            // list.push({
            //     path: key,
            //     per: similarity
            // })
        }
        list.sort((a, b) => {
            return b.per - a.per;
        });
        console.log(list);
    }
    static cosineSimilarity(a, b) {
        const dotProduct = a.reduce((acc, val, i) => acc + val * b[i], 0);
        const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
        const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
        return dotProduct / (normA * normB);
    }
    static async getAllSpfs() {
        return new Promise(async (resolve, reject) => {
            if (this._spfMap) {
                resolve(this._spfMap);
                return;
            }
            let list = await Editor.Message.request("asset-db", "query-assets", { ccType: "cc.SpriteFrame" });
            console.log(list);
            let map = {};
            let url = '';
            for (let v of list) {
                if (v.readonly)
                    continue;
                url = path_1.default.join(Editor.Project.path, v.url.replace('db://', '').replace('/spriteFrame', ''));
                map[url] = { url, uuid: v.uuid };
            }
            console.log('init all spfs~');
            this._spfMap = map;
            resolve(map);
        });
    }
}
exports.ImgDiff = ImgDiff;
