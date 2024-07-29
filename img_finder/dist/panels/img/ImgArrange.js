"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImgArrange = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const singleton_1 = require("../singleton");
const www_1 = require("../www");
class ImgArrange extends singleton_1.singleton {
    constructor() {
        super(...arguments);
        this.DATA_JSON = './data.json';
        this._progress = { now: 0, total: 0 };
    }
    getLocalData() {
        if (this._spfMap)
            return this._spfMap;
        if (!fs_1.default.existsSync(path_1.default.join(Editor.Package.getPath('img_finder') || '', this.DATA_JSON))) {
            this._spfMap = {};
        }
        else {
            this._spfMap = JSON.parse(fs_1.default.readFileSync(path_1.default.join(Editor.Package.getPath('img_finder') || '', this.DATA_JSON), 'utf-8'));
        }
        return this._spfMap;
    }
    setLocalData() {
        fs_1.default.writeFileSync(path_1.default.join(Editor.Package.getPath('img_finder') || '', this.DATA_JSON), JSON.stringify(this._spfMap), { encoding: 'utf-8' });
    }
    _setProgress(now, total) {
        this._progress = { now: now, total: total };
        if (now >= total && total > 0) {
            console.log("loading end~");
            this._setProgress(0, 0);
            this.setLocalData();
        }
    }
    initAllSpfs() {
        return new Promise(async (resolve, reject) => {
            let list = await Editor.Message.request("asset-db", "query-assets", { ccType: "cc.SpriteFrame" });
            let bakMap = this.getLocalData() || {};
            this._spfMap = {};
            let url = '';
            let total = list.length;
            let now = 0;
            console.log('init all spfs~, total: ', total);
            this._setProgress(now, total);
            await www_1.www.ImgDiff().init();
            for (let v of list) {
                now++;
                if (v.readonly) {
                    this._setProgress(now, total);
                    continue;
                }
                url = path_1.default.join(Editor.Project.path, v.url.replace('db://', '').replace('/spriteFrame', ''));
                let hash = await www_1.www.ImgMD5().getHash(url);
                if (bakMap[hash]) {
                    this._spfMap[hash] = bakMap[hash];
                    this._setProgress(now, total);
                    continue;
                }
                this._spfMap[hash] = {
                    url,
                    uuid: v.uuid,
                    data: [],
                    features: [],
                };
                www_1.www.ImgDiff().extractFeatures(url).then((all) => {
                    if (!this._spfMap)
                        return;
                    let [data, features] = all;
                    this._spfMap[hash].features = features;
                    this._spfMap[hash].data = data.reduce((list, item) => {
                        if (item.probability < 0.1)
                            return list;
                        list.push(...item.className.split(', '));
                        return list;
                    }, []);
                }).finally(() => {
                    this._setProgress(now, total);
                });
            }
        });
    }
}
exports.ImgArrange = ImgArrange;
