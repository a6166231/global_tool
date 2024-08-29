//@ts-nocheck

export class ImportMap {
    private static _pathMap: Record<string, { uuid: string, classes: Array<cc.Component> }>
    private static _componentMap: Record<string, Array<cc.Component>>

    private static isSubclass(subClass, superClass) {
        let prototype = Object.getPrototypeOf(subClass.prototype ? subClass.prototype : subClass);
        while (prototype !== null) {
            if (prototype === superClass.prototype) {
                return true;
            }
            prototype = Object.getPrototypeOf(prototype);
        }
        return false;
    }

    private static getAllComponentMap() {
        if (this._componentMap) return this._componentMap
        this._componentMap = {}
        let maps = window.System[Object.getOwnPropertySymbols(window.System)[0]]
        let fname = ''
        for (let k in maps) {
            let moduel = maps[k]['C']
            fname = './' + k.slice(k.indexOf('chunks'), k.length)
            for (let name in moduel) {
                if (moduel[name] && typeof moduel[name] == 'function' && this.isSubclass(moduel[name], cc.Component)) {
                    if (!this._componentMap[fname]) {
                        this._componentMap[fname] = []
                    }
                    this._componentMap[fname].push(moduel[name])
                }
            }
        }
        return this._componentMap
    }

    private static getPath2XName() {
        if (this._pathMap) return this._pathMap
        var url = new URL('/scripting/x/import-map.json', window.location);
        return fetch(url).then(function (response) {
            return response.json();
        }).then((json) => {
            this._pathMap = {}
            let compMap = this.getAllComponentMap()
            for (let path in json.imports) {
                if (compMap[json.imports[path]])
                    this._pathMap[path.replace('file:///', '')] = {
                        uuid: json.imports[path],
                        classes: compMap[json.imports[path]] || []
                    }
            }
            return this._pathMap
        });
    }

    static async getClassAbsPathByComponent(comp: cc.Component) {
        let pathMap = await this.getPath2XName()

        let plist = []
        for (let path in pathMap) {
            let list = pathMap[path].classes
            for (let item of list) {
                if (comp.constructor === item) {
                    plist.push(path)
                    if (path.endsWith(comp.constructor.name + '.ts')) {
                        return [path]
                    }
                }
            }
        }
        return plist
    }

}