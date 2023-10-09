import { readFileSync } from 'fs-extra';
import Path, { join } from 'path';
import { ScriptDataModel, TemplateModel, collectAllExtendsClass, collectFilesfunc, getTemplateList } from '../../main';
import Utils from './util';
module.paths.push(join(Editor.App.path, 'node_modules'));

import { wtemplate } from './wtemplate';
import { MVCModel, ScriptItem } from './MVCModel';
import { mvc } from './mvc';
import { LinkItem } from './ui/linkItem';

/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }

interface IScriptItemModel {
    item: HTMLElement,
    data: TemplateModel,
    link?: IScriptItemModel,
}

const BaseID = "id"

let mapTemplateScript: Map<string, string> = new Map;
let mapSelect2ScriptItem: Map<number, IScriptItemModel> = new Map;

const projectHead = 'project://'
const dbHead = 'db://'

const windowWidth = 1400;

let _userInfo: Editor.User.UserData;
let _mvcModel: MVCModel;
let _previewIndex: number;
let _bAutoWidth: boolean = false;

let _vLinkItem: Array<LinkItem> = [];

module.exports = Editor.Panel.define({
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        body: '#body',
        app: '#MVC',
        funcList: '#funcList',
        scriptName: '#scriptName',
        classesPanel: '#classesPanel',
        scriptItem: '#scriptItem',
        btnCreate: '#btnCreate',
        mainCode: "#mainCode",
    },
    methods: {
        onCheckBoxClick(index: number, checked: boolean) {
            if (!this.$.classesPanel) return;
            let item = this.$.classesPanel.children[index] as HTMLElement
            item.hidden = !checked;
            this.refreshScriptInfo();
        },
        createUIAssetItem(data: TemplateModel, iindex: number) {
            if (!this.$.classesPanel || !this.$.scriptItem) return;
            let item = this.$.scriptItem.cloneNode(true) as HTMLElement;
            let modelName = Utils.getClsNameElement(item, 'modelName');
            //@ts-ignore
            modelName.value = data.name + ': ';
            modelName.style.width = `100px`;

            let asset = Utils.getTagNameElement(item, 'ui-asset');
            //@ts-ignore
            asset.value = data.classPath
            if (iindex == 1)
                asset.removeAttribute("readonly")

            let itemName = Utils.getClsNameElement(item, 'layerName');
            itemName.onkeyup = () => {
                this.checkItemName(itemName);
                this.previewTempResult(iindex)
            }

            let file = Utils.getTagNameElement(item, 'ui-file')
            //@ts-ignore
            file.value = data.outPath.replace(dbHead, projectHead)
            if (data.link) {
                let clsSelect = Utils.getClsNameElement(item, 'LinkItem');
                clsSelect.hidden = false
                _vLinkItem[iindex] = new LinkItem(clsSelect, data, this.refreshScriptInfo.bind(this))
            }
            this.$.classesPanel.appendChild(item)
            item.onclick = () => {
                this.previewTempResult(iindex);
            }
            return item;
        },
        /** 根据模板生成功能列表 */
        async initFuncList() {
            if (!this.$.funcList) return;
            let templateList = getTemplateList();
            let index = 0;
            for (let template of templateList) {
                let iindex = index;
                let input2Item = this.createUIAssetItem(template, iindex);
                if (!input2Item) {
                    console.warn('-- create template faild: ', Utils.Obj2String(template));
                    continue;
                }

                let input = document.createElement("input");
                input.type = 'checkbox'
                input.checked = true;
                input.id = `${BaseID}${template.name}`
                input.name = template.name;
                input.tabIndex = iindex;
                mapSelect2ScriptItem.set(iindex, { item: input2Item, data: template })

                input.onclick = () => {
                    this.onCheckBoxClick(iindex, input.checked);
                }
                this.$.funcList.appendChild(input)

                var lb = document.createElement("label");
                lb.htmlFor = input.id
                lb.innerText = template.name
                this.$.funcList.appendChild(lb)

                index++;
            }
            this.refreshScriptInfo();
        },
        /** 初始化模板脚本 */
        initTempLateScripts() {
            let templateList = getTemplateList();
            const assetTempPath = Path.join(Editor.Project.path, '.creator/asset-template/typescript')
            for (let template of templateList) {
                let baseName = Path.basename(template.classPath)
                let tempLatePath = baseName.replace(Path.extname(baseName), '');

                Utils.readFile(Path.join(assetTempPath, tempLatePath)).then(res => {
                    mapTemplateScript.set(template.name, res);
                })
            }
        },
        refreshScriptInfo(ev?: any) {
            let name = this.$.scriptName
            if (!name) return
            //@ts-ignore
            let nameVal = name.value.replace(/[, ]/g, '')
            //@ts-ignore
            name.value = nameVal;
            for (let [k, v] of mapSelect2ScriptItem) {
                //文件名
                let itemName = Utils.getClsNameElement(v.item, 'layerName');
                if (itemName) {
                    //@ts-ignore
                    itemName.value = `${nameVal}${v.data.name[0].toUpperCase() + v.data.name.slice(1)}`
                    this.checkItemName(itemName);
                }

                //文件路径
                let itemPath = Utils.getTagNameElement(v.item, 'ui-file');
                if (itemPath) {
                    if (v.data.autoPath) {
                        //@ts-ignore
                        itemPath.value = Path.join(v.data.outPath.replace(dbHead, ""), `${wtemplate.formatHumpName(nameVal) + (v.data.appendPath || "")}`);
                    }
                    this.checkDirPath(itemPath);
                }

                if (v.data.link && _vLinkItem[k]) {
                    for (let ml of mapSelect2ScriptItem.values()) {
                        if (ml.data.name == v.data.link) {
                            _vLinkItem[k].dropLinkHiddent = !ml.item.hidden;
                            break
                        }

                    }
                }
            }
            this.previewTempResult()
        },
        refreshMVCModelData() {
            let mvcModel: MVCModel = {};
            for (let [k, v] of mapSelect2ScriptItem) {
                if (v.item.hidden) {
                    continue;
                }
                let obj: ScriptItem = {} as ScriptItem;
                //文件名
                let itemName = Utils.getClsNameElement(v.item, 'layerName');
                if (itemName) {
                    //@ts-ignore
                    obj.name = itemName.value
                }

                //文件路径
                let itemPath = Utils.getTagNameElement(v.item, 'ui-file');
                if (itemPath) {
                    //@ts-ignore
                    obj.path = itemPath.value;

                    let dirHead = v.data.outPath.replace(dbHead, projectHead);
                    let index = obj.path.indexOf(dirHead);
                    if (index >= 0) {
                        obj.constAppend = true
                        obj.appendPath = obj.path.slice(index + dirHead.length);
                    } else {
                        obj.appendPath = obj.path
                    }
                }

                //绑定的文件信息
                let linkItem = _vLinkItem[k];
                if (linkItem) {
                    let script = mvc.scriptMgr().getScript(linkItem.selected?.toLowerCase()) as ScriptDataModel;
                    obj.link = {
                        item: linkItem,
                        status: linkItem.status,
                        script: script,
                    }
                }
                mvcModel[v.data.name] = obj;
            }
            _mvcModel = mvcModel
        },

        checkItemName(itemName: HTMLElement) {
            //@ts-ignore
            let name = itemName.value;
            let has = mvc.scriptMgr().getScript(name.toLowerCase())
            itemName.style.color = has ? 'red' : 'mediumspringgreen';
        },
        checkDirPath(itemName: HTMLElement) {
            //@ts-ignore
            let path: string = itemName.value;
            //路径长度为0 || 路径不为项目路径
            if (path.length == 0 || path.indexOf('assets') < 0) {
                itemName.style.color = 'red';
                return;
            }
            let has = Utils.existsSync(Path.join(Editor.Project.path, path.replace(projectHead, '')))
            itemName.style.color = has ? 'yellow' : 'mediumspringgreen';
        },
        readyCreateScripts() {
            let name = this.$.scriptName
            if (!name) return

            let faild = false;
            let vReadyScripts = []
            //@ts-ignore
            if (name.value && name.value.length) {
                for (let [k, v] of mapSelect2ScriptItem) {
                    if (v.item.hidden) continue;
                    let itemName = Utils.getClsNameElement(v.item, 'layerName');

                    let file = Utils.getTagNameElement(v.item, 'ui-file')
                    if (itemName && itemName.style.color == 'red' || file.style.color == 'red') {
                        faild = true;
                        break;
                    }

                    vReadyScripts.push(v)
                }
            }

            if (faild) {
                console.log('warning !!!')
                return;
            }
            if (vReadyScripts.length)
                this.syncCreateScripts(vReadyScripts);
        },
        async getUserInfo() {
            if (!_userInfo) {
                _userInfo = await Editor.User.getData();
            }
            return _userInfo
        },
        async syncCreateScripts(vReadyScripts: Array<{ item: HTMLElement, data: TemplateModel }>) {
            console.log('create scripts~~~~')

            let userInfo = await this.getUserInfo()

            let count = 0;
            for (let obj of vReadyScripts) {
                let lb = Utils.getClsNameElement(obj.item, 'layerName');
                let path = Utils.getTagNameElement(obj.item, 'ui-file');
                //@ts-ignore
                let ppath = path.value.replace(projectHead, dbHead)
                //@ts-ignore
                await Utils.createFile(ppath + '/' + lb.value + '.ts', await this.formatScriptTemplate(ppath, lb.value, obj.data, userInfo)).catch((err) => {
                    console.warn(err)
                })
                count++;
            }
            console.log('create scripts end~~~~')
        },
        async previewTempResult(index?: number) {
            this.refreshMVCModelData();

            index = index ?? _previewIndex
            if (!this.$.mainCode) return
            let obj = mapSelect2ScriptItem.get(index)
            if (!obj) return;

            if (!_bAutoWidth && this.$.body) {
                _bAutoWidth = true;
                let width = window.innerWidth;
                if (width < windowWidth) {
                    width = windowWidth;
                }
                window.resizeTo(width, window.innerHeight);
            }
            _previewIndex = index;
            let userInfo = await this.getUserInfo();

            let lb = Utils.getClsNameElement(obj.item, 'layerName');
            let path = Utils.getTagNameElement(obj.item, 'ui-file');
            //@ts-ignore
            let ppath = path.value.replace(projectHead, dbHead)
            //@ts-ignore
            this.$.mainCode.innerHTML = await this.formatScriptTemplate(ppath, lb.value, obj.data, userInfo)
        },
        /** 格式化脚本模板 */
        formatScriptTemplate(path: string, scriptName: string, model: TemplateModel, userInfo: Editor.User.UserData) {
            return wtemplate.format(mapTemplateScript.get(model.name), {
                path: path,
                scriptName: scriptName,
                model: model,
                userInfo: userInfo,
                mvc: _mvcModel,
            })
        },
        addListener() {
            this.$.scriptName && (this.$.scriptName.onkeyup = this.refreshScriptInfo.bind(this));
            this.$.btnCreate && (this.$.btnCreate.onclick = this.readyCreateScripts.bind(this));

            mvc.messageMgr().setResChangeCall(this.refreshScriptInfo.bind(this));
        }
    },
    ready() {
        collectFilesfunc().then(async (vMap: [Map<string, ScriptDataModel | string>, Map<string, string>]) => {
            await collectAllExtendsClass(vMap[0]).then((layerScript: Map<string, string>) => {
                mvc.scriptMgr().init(vMap[0], vMap[1], layerScript)
                console.log('init project file over~');
            });
        })
        mvc.messageMgr().addListener();
        setTimeout(() => {
            if (this)
                this.initFuncList();
        }, 100);

        this.initTempLateScripts();
        this.addListener();
    },
    beforeClose() { },
    close() {
        mvc.messageMgr().removeListener();
        _vLinkItem = [];
        mapTemplateScript.clear();
        mapSelect2ScriptItem.clear();
        //@ts-ignore
        _userInfo = null;
    },
});