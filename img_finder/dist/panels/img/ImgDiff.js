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
const tf = __importStar(require("@tensorflow/tfjs"));
const mobilenet = __importStar(require("@tensorflow-models/mobilenet"));
const path_1 = __importDefault(require("path"));
const fs = require('fs');
const singleton_1 = require("../singleton");
const www_1 = require("../www");
class ImgDiff extends singleton_1.singleton {
    constructor() {
        super();
        //导入tf库 没有会导致没有import进来的模块
        tf;
    }
    init() {
        if (!this.model) {
            return new Promise((resolve, reject) => {
                console.log('start model init');
                mobilenet.load().then(v => {
                    console.log('init model end');
                    this.model = v;
                    resolve(this.model);
                });
            });
        }
    }
    async getModel() {
        if (!this.model) {
            await this.init();
        }
        return this.model;
    }
    extractFeatures(imagePath) {
        return new Promise((resolve, reject) => {
            const img = document.createElement('img');
            console.log(imagePath);
            img.src = imagePath;
            img.onload = async () => {
                let model = await this.getModel();
                model.classify(img).then(v => {
                    resolve([v, model.infer(img, true).arraySync()]);
                });
            };
            img.onerror = () => {
                console.error('Failed to load the image.');
                resolve([[], null]);
            };
        });
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
    createNewImg(queryImagePath) {
        return new Promise((resolve, reject) => {
            const base64Data = queryImagePath.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filePath = path_1.default.join(Editor.Package.getPath('img_finder') || '', './temp.png');
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
    async searchImage(queryImagePath) {
        let path = await this.createNewImg(queryImagePath);
        const [tags, features] = await this.extractFeatures(queryImagePath);
        // let first = tf.tensor(features).reshape([1, 32, 32, 1]);
        // console.log(a)
        let database = await www_1.www.ImgArrange().getLocalData();
        let similarityMap = {};
        let rank = 1;
        for (let k in tags) {
            if (!similarityMap[rank]) {
                similarityMap[rank] = {};
            }
            let tag = tags[k].className.split(', ');
            for (const key in database) {
                let value = database[key];
                for (let item of tag) {
                    if (value.data.includes(item)) {
                        similarityMap[rank][value.url] = value;
                        break;
                    }
                }
            }
            rank++;
        }
        console.log(similarityMap);
        return similarityMap;
    }
    cosineSimilarity(a, b) {
        const dotProduct = a.reduce((acc, val, i) => acc + val * b[i], 0);
        const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
        const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
        return dotProduct / (normA * normB);
    }
}
exports.ImgDiff = ImgDiff;
