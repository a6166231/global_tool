import { readFileSync } from 'fs-extra';
import Path, { join } from 'path';
import { ScriptDataModel, TemplateModel, TemplateType, collectAllExtendsClass, collectFilesfunc, getTemplateList } from '../../main';
import Utils from './util';
module.paths.push(join(Editor.App.path, 'node_modules'));

import { TemplateExportModel, wtemplate } from './wtemplate';
import { AssetItem, MVCModel, MVCModelName } from './MVCModel';
import { mvc } from './mvc';
import { LinkItem } from './ui/linkItem';
import { pathLockItem } from './ui/pathLockItem';
import { CIBase } from './customInject/CIBase';
import { AST } from './ts-morph/AST';

/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }

interface IScriptItemModel {
    item: HTMLElement,
    data: TemplateModel,
    link?: IScriptItemModel,
    lockItem: pathLockItem,
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
        scriptComment: '#scriptComment',
        classesPanel: '#classesPanel',
        scriptItem: '#scriptItem',
        prefabItem: '#prefabItem',
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
            if (!this.$.classesPanel || !this.$.scriptItem || !this.$.prefabItem) return;
            const bScript = data.type == TemplateType.script
            let item = (bScript ? this.$.scriptItem.cloneNode(true) : this.$.prefabItem.cloneNode(true)) as HTMLElement;
            let modelName = Utils.getClsNameElement(item, 'modelName');
            //@ts-ignore
            modelName.value = data.name + ': ';
            modelName.style.width = `100px`;

            let asset = Utils.getTagNameElement(item, 'ui-asset');
            if (asset && data.classPath) {
                //@ts-ignore
                asset.value = data.classPath
                if (iindex == 1)
                    asset.removeAttribute("readonly")
            }

            let itemName = Utils.getClsNameElement(item, 'layerName');
            itemName.onkeyup = () => {
                this.checkItemName(itemName);
                bScript && this.previewTempResult(iindex)
            }

            let file = Utils.getTagNameElement(item, 'ui-file')
            bScript && (file.onkeyup = () => {
                this.previewTempResult(iindex)
            })

            //@ts-ignore
            file.value = data.outPath.replace(dbHead, projectHead)
            if (data.link) {
                let clsSelect = Utils.getClsNameElement(item, 'LinkItem');
                if (clsSelect) {
                    clsSelect.hidden = false
                    _vLinkItem[iindex] = new LinkItem(clsSelect, data, () => {
                        _previewIndex = iindex
                        this.refreshScriptInfo()
                    })
                }
            }
            this.$.classesPanel.appendChild(item)
            bScript && (item.onclick = () => {
                this.previewTempResult(iindex);
            })
            return item;
        },
        /** 根据模板生成功能列表 */
        async initFuncList() {
            if (!this.$.funcList) return;
            let templateList = await getTemplateList();
            let index = 0;
            for (let template of templateList) {
                let iindex = index;
                let input2Item = this.createUIAssetItem(template, iindex);
                if (!input2Item) {
                    console.warn('-- create template faild: ', Utils.Obj2String(template));
                    continue;
                }

                let clsSelect = Utils.getClsNameElement(input2Item, 'btnLock');
                clsSelect.hidden = false
                let lockItem = new pathLockItem(clsSelect, this.refreshScriptInfo.bind(this))

                let input = document.createElement("input");
                input.type = 'checkbox'
                input.checked = true;
                input.id = `${BaseID}${template.name}`
                input.name = template.name;
                input.tabIndex = iindex;

                let model: IScriptItemModel = { item: input2Item, data: template, lockItem: lockItem }
                mapSelect2ScriptItem.set(iindex, model)

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
        async initTempLateScripts() {
            let templateList = await getTemplateList();
            const assetTempPath = Path.join(Editor.Project.path, '.creator/asset-template/typescript')
            for (let template of templateList) {
                if (!template.classPath) continue;
                let baseName = Path.basename(template.classPath)
                let tempLatePath = baseName.replace(Path.extname(baseName), '');

                Utils.readFile(Path.join(assetTempPath, tempLatePath)).then(res => {
                    mapTemplateScript.set(template.name, res);
                })
            }
        },
        refreshScriptInfo(bPreview: boolean = true) {
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
                    let nameData = v.data.name;
                    if (v.data.type == TemplateType.prefab) {
                        nameData = MVCModelName.Layer;
                    }
                    let extendsName = nameData[0].toUpperCase() + nameData.slice(1)
                    //@ts-ignore
                    itemName.value = `${nameVal}${extendsName}`
                    this.checkItemName(itemName);
                }

                //文件路径
                let itemPath = Utils.getTagNameElement(v.item, 'ui-file');
                if (itemPath) {
                    if (v.data.autoPath && !v.lockItem.status) {
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
            bPreview && this.previewTempResult()
        },
        refreshMVCModelData() {
            let mvcModel: MVCModel = {};
            for (let [k, v] of mapSelect2ScriptItem) {
                if (v.item.hidden) {
                    continue;
                }
                let obj: AssetItem = {} as AssetItem;
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
        /** 准备导出资源 */
        readyCreateAssets() {
            let name = this.$.scriptName
            if (!name) return

            let faild = false;
            let vReadyScripts = []
            let vReadyPrefabs = []
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

                    if (v.data.type == TemplateType.script) {
                        vReadyScripts.push(v)
                    } else {
                        vReadyPrefabs.push(v)
                    }
                }
            }

            if (faild) {
                console.log('warning !!!')
                return;
            }
            if (vReadyScripts.length)
                this.syncCreateScripts(vReadyScripts);
            if (vReadyPrefabs.length)
                this.syncCreatePrefabs(vReadyPrefabs);
        },
        async getUserInfo() {
            if (!_userInfo) {
                _userInfo = await Editor.User.getData();
            }
            return _userInfo
        },
        /** 异步创建所有的预制体 */
        async syncCreatePrefabs(vReadyPrefabs: Array<{ item: HTMLElement, data: TemplateModel }>) {
            console.log('2.create prefabs~~~~')
            let count = 0;
            for (let obj of vReadyPrefabs) {
                let lb = Utils.getClsNameElement(obj.item, 'layerName');
                let path = Utils.getTagNameElement(obj.item, 'ui-file');
                //@ts-ignore
                let ppath = path.value.replace(projectHead, dbHead)
                //@ts-ignore
                console.log(path.value)
                //@ts-ignore
                await Utils.createFile(ppath + '/' + lb.value + '.prefab', await wtemplate.formatPrefab(lb.value)).catch((err) => {
                    console.warn(err)
                })
                count++;
            }
            console.log('2-2.create prefabs end~~~~')
        },
        /** 异步创建所有的脚本 */
        async syncCreateScripts(vReadyScripts: Array<{ item: HTMLElement, data: TemplateModel }>) {
            console.log('1.create scripts~~~~')

            let userInfo = await this.getUserInfo()

            let count = 0;

            let readyExportModel: TemplateExportModel[] = []

            for (let obj of vReadyScripts) {
                let lb = Utils.getClsNameElement(obj.item, 'layerName');
                let path = Utils.getTagNameElement(obj.item, 'ui-file');
                //@ts-ignore
                let ppath = path.value.replace(projectHead, dbHead)
                //@ts-ignore
                console.log(path.value)
                //@ts-ignore
                const lbVal = lb.value
                let exportModel = await this.formatScriptTemplate(ppath, lbVal, obj.data, userInfo, false)
                readyExportModel.push(exportModel);

                await Utils.createFile(ppath + '/' + lbVal + '.ts', (exportModel.str)).catch((err) => {
                    console.warn(err)
                })
                count++;
            }
            console.log('1-1.create scripts end~~~~')

            console.log('1-2.inject scripts~~~~')

            //@ts-ignore
            const scriptComment = this.$.scriptComment?.value || ''
            for (let model of readyExportModel) {
                if (model.CIList?.length) {
                    for (let CIItem of model.CIList) {
                        CIItem.comment = scriptComment
                        let _ts = await CIBase.create(CIItem)
                        await _ts.save()
                    }
                }
            }
            console.log('1-3.inject scripts end~~~~')

            AST.clear()
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
            let model = await this.formatScriptTemplate(ppath, lb.value, obj.data, userInfo, true)
            this.$.mainCode.innerHTML = model.str
        },
        /** 格式化脚本模板 */
        formatScriptTemplate(path: string, scriptName: string, model: TemplateModel, userInfo: Editor.User.UserData, bPreview: boolean): Promise<TemplateExportModel> {
            return wtemplate.format(mapTemplateScript.get(model.name), {
                path: path,
                scriptName: scriptName,
                model: model,
                userInfo: userInfo,
                mvc: _mvcModel,
            }, bPreview)
        },
        addListener() {
            this.$.scriptName && (this.$.scriptName.onkeyup = this.refreshScriptInfo.bind(this, true));
            this.$.btnCreate && (this.$.btnCreate.onclick = this.readyCreateAssets.bind(this));
            mvc.messageMgr().setResChangeCall(this.refreshScriptInfo.bind(this, false));
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