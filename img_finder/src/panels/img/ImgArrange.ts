import path from "path"
import { AssetInfo } from "../../../@types/packages/asset-db/@types/public"

import fs from 'fs'
import { singleton } from "../singleton"
import { www } from "../www"

interface DataBaseModel {
    url: string,
    uuid: string,
    data: Array<string>,
    features: any
}
export class ImgArrange extends singleton {
    private _spfMap!: Record<string, DataBaseModel>

    readonly DATA_JSON = './data.json'

    private _progress: { now: number, total: number } = { now: 0, total: 0 }

    getLocalData() {
        if (this._spfMap) return this._spfMap
        if (!fs.existsSync(path.join(Editor.Package.getPath('img_finder') || '', this.DATA_JSON))) {
            this._spfMap = {}
        } else {
            this._spfMap = JSON.parse(fs.readFileSync(path.join(Editor.Package.getPath('img_finder') || '', this.DATA_JSON), 'utf-8'))
        }
        return this._spfMap
    }

    private setLocalData() {
        fs.writeFileSync(path.join(Editor.Package.getPath('img_finder') || '', this.DATA_JSON), JSON.stringify(this._spfMap), { encoding: 'utf-8' })
    }

    private _setProgress(now: number, total: number) {
        this._progress = { now: now, total: total }

        if (now >= total && total > 0) {
            console.log("loading end~")
            this._setProgress(0, 0)
            this.setLocalData()
        }
    }

    initAllSpfs() {
        return new Promise<Record<number, DataBaseModel>>(async (resolve, reject) => {
            let list: Array<AssetInfo> = await Editor.Message.request("asset-db", "query-assets", { ccType: "cc.SpriteFrame" })

            let bakMap = this.getLocalData() || {}
            this._spfMap = {}
            let url = ''
            let total = list.length
            let now = 0;

            console.log('init all spfs~, total: ', total)
            this._setProgress(now, total)

            await www.ImgDiff().init()

            for (let v of list) {
                now++
                if (v.readonly) {
                    this._setProgress(now, total)
                    continue
                }
                url = path.join(Editor.Project.path, v.url.replace('db://', '').replace('/spriteFrame', ''))
                let hash = await www.ImgMD5().getHash(url)
                if (bakMap[hash]) {
                    this._spfMap[hash] = bakMap[hash]
                    this._setProgress(now, total)
                    continue
                }
                this._spfMap[hash] = {
                    url,
                    uuid: v.uuid,
                    data: [],
                    features: [],
                }
                www.ImgDiff().extractFeatures(url).then((all: [{ className: string; probability: number; }[], any]) => {
                    if (!this._spfMap) return
                    let [data, features] = all
                    // this._spfMap![hash].features = features
                    this._spfMap![hash].data = data.reduce((list: Array<string>, item) => {
                        if (item.probability < 0.1) return list
                        list.push(...item.className.split(', '))
                        return list
                    }, [])
                }).finally(() => {
                    this._setProgress(now, total)
                })
            }
        })
    }

}