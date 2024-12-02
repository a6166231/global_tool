import Fs from 'fs';



export default class Utils {
    /**
     * 尝试打开文件
     * @param {string} path 路径
     */
    static async tryOpen(path: string) {
        const uuid = await this.fspathToUuid(path);
        // 是否配置了快速打开
        this.open(uuid);
        // 聚焦到文件
        this.focusOnFile(uuid);
    }

    /**
     * 打开文件
     * @param {string} uuid Uuid
     */
    static open(uuid: string) {
        Editor.Message.send('asset-db', 'open-asset', uuid);
    }

    /**
     * 聚焦到文件（在资源管理器中显示并选中文件）
     * @param {string} uuid Uuid
     */
    static focusOnFile(uuid: string) {
        Editor.Selection.clear('asset');
        Editor.Selection.select('asset', [uuid]);
    }

    /**
     * 通过绝对路径获取 uuid
     * @param {string} path 路径
     * @returns {Promise<string>}
     */
    static fspathToUuid(path: string) {
        return Editor.Message.request('asset-db', 'query-uuid', path);
    }

    static format(mat: string, ...param: any[]) {
        if (typeof (mat) != "string") {
            mat = String(mat)
        }
        let matchs = mat.match(/%s|%f|%\S?\d?d/g) || []
        if (matchs.length != param.length) {
            console.warn("format  参数不正确！或暂不支持")
            return mat
        } else {
            for (let i = 0; i < param.length; i++) {
                let match = matchs[i]
                let value = param[i]
                if (match == "%s") {
                    mat = mat.replace(match, value)

                } else if (match == "%f") {
                    mat = mat.replace(match, value)
                } else if (match.match(/%\S?\d?d/)) {
                    let pv = match.match(/%(\S?)(\d?)d/)
                    if (!pv) return mat;
                    let flag = pv[1]
                    let num = pv[2]
                    let v: string = String(value)
                    let patch = Number(num) - v.length
                    if (patch > 0) {
                        while (patch) {
                            v = flag + v
                            patch--
                        }
                    }
                    mat = mat.replace(match, v)
                }
            }
            return mat
        }
    }

    static Obj2String(obj: any, add = "    ") {
        return JSON.stringify(obj);
    }

    public static createFile(path: string, data: string | null = null) {
        return new Promise((resolve, reject) => {
            Editor.Message.request('asset-db', 'create-asset', path, data, false, false).then((res) => {
                if (res) {
                    resolve(res)
                } else {
                    reject(`create dir fail: ${path}`)
                }
            })
        })
    }
    public static importFile(fpath: string, opath: string) {
        return new Promise((resolve, reject) => {
            Editor.Message.request('asset-db', 'import-asset', fpath, opath).then((res) => {
                if (res) {
                    resolve(res)
                } else {
                    reject(`import fails fail: ${fpath} -> ${opath} `)
                }
            })
        })
    }

    public static getClsNameElement(item: HTMLElement, name: string) { return item.getElementsByClassName(name)?.[0] as HTMLElement }
    public static getTagNameElement(item: HTMLElement, name: string) { return item.getElementsByTagName(name)?.[0] as HTMLElement }

    public static checkModel(name: string) {
        let len = name.length;
        if (len < 5) return false;
        let index = name.lastIndexOf('Model')
        return index >= 0 && index + 5 == len;
    }

    public static readFile(path: string) {
        return new Promise<string>((resolve, reject) => {
            Fs.readFile(path, 'utf-8', (err, res) => {
                if (res) {
                    resolve(res)
                } else {
                    console.log('read file err: ', path, err)
                }
            })
        })
    }

    public static existsSync(path: string) {
        return Fs.existsSync(path)
    }

    public static async getImagesInFolder(folderPath: string) {
        try {
            const response = await fetch(`${folderPath}?${Date.now()}`);
            const images = await response.json();
            return images;
        } catch (error) {
            console.error(error)
        }
    }

    public static destroyAllChildren(node: HTMLElement) {
        if (!node) return
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    public static debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        return ((...args: Parameters<T>) => {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func(...args);
                timeoutId = null;
            }, wait);
        }) as T;
    }

    private static _userInfo: Editor.User.UserData;
    public static async getUserInfo() {
        if (!this._userInfo) {
            this._userInfo = await Editor.User.getData();
        }
        return this._userInfo
    }
}