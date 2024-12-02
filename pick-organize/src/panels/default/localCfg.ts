import { readFileSync, writeFileSync } from "fs"
import path from "path"
import packageJSON from '../../../package.json';
import { singleton } from "../../singleton";

export interface LocalGroupModel {
    name: string,
    pin?: boolean,
    bNew?: boolean,
    items?: string[]
}

export class LocalCfg extends singleton {
    readonly ppath = 'localCfg.json'

    //@ts-ignore
    private cfgJson: LocalGroupModel[]

    getLocalCfgJson() {
        // if (!this.cfgJson) {
        let json = readFileSync(path.join(Editor.Package.getPath(packageJSON.name)!, 'src/cfg.json'), { encoding: 'utf-8' })
        try {
            if (json) {
                this.cfgJson = JSON.parse(json.toString())
            } else {
                this.cfgJson = []
            }
        } catch (error) {
            this.cfgJson = []
        }
        // }
        return this.cfgJson;
    }

    setLocalCfgJson(cfgs: typeof this.cfgJson) {
        this.cfgJson = cfgs
        writeFileSync(path.join(Editor.Package.getPath(packageJSON.name)!, 'src/cfg.json'), JSON.stringify(cfgs), { encoding: 'utf-8' })
    }

}