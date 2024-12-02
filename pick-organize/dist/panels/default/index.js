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
const fs_1 = require("fs");
const path_1 = __importStar(require("path"));
const main_1 = require("../../main");
const util_1 = __importDefault(require("./util"));
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const wtemplate_1 = require("./wtemplate");
const MVCModel_1 = require("./MVCModel");
const mvc_1 = require("./mvc");
const linkItem_1 = require("./ui/linkItem");
const pathLockItem_1 = require("./ui/pathLockItem");
const CIBase_1 = require("./customInject/CIBase");
const AST_1 = require("./ts-morph/AST");
const path_2 = __importDefault(require("path"));
const package_json_1 = __importDefault(require("../../../package.json"));
const BaseID = "id";
let mapTemplateScript = new Map;
let mapSelect2ScriptItem = new Map;
const projectHead = 'project://';
const dbHead = 'db://';
const windowWidth = 1400;
let _userInfo;
let _mvcModel;
let _previewIndex;
let _bAutoWidth = false;
let _vLinkItem = [];
let _filePreivewDirty = false;
module.exports = Editor.Panel.define({
    template: (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        body: '#body',
        app: '#MVC',
        funcList: '#funcList',
        scriptName: '#scriptName',
        scriptComment: '#scriptComment',
        classesPanel: '#classesPanel',
        scriptItem: '#scriptItem',
        prefabItem: '#prefabItem',
        resItem: '#resItem',
        btnCreate: '#btnCreate',
        mainCode: "#mainCode",
        resNode: "#resNode",
        dragRect: "#dragRect",
        resTouch: "#resTouch",
        previewCode: "#preview-code",
        previewRes: "#preview-res",
    },
    methods: {
        onCheckBoxClick(index, checked) {
            if (!this.$.classesPanel)
                return;
            let item = this.$.classesPanel.children[index];
            item.hidden = !checked;
            this.refreshScriptInfo();
        },
        getCloneItemByType(type) {
            switch (type) {
                case main_1.TemplateType.script:
                    return this.$.scriptItem.cloneNode(true);
                case main_1.TemplateType.prefab:
                    return this.$.prefabItem.cloneNode(true);
                case main_1.TemplateType.res:
                    return this.$.resItem.cloneNode(true);
            }
        },
        initUIAssetItem1(item, data, iindex) {
            const bScript = data.type == main_1.TemplateType.script;
            let modelName = util_1.default.getClsNameElement(item, 'modelName');
            //@ts-ignore
            modelName.value = data.name + ': ';
            modelName.style.width = `100px`;
            let asset = util_1.default.getTagNameElement(item, 'ui-asset');
            if (asset && data.classPath) {
                //@ts-ignore
                asset.value = data.classPath;
                if (iindex == 1)
                    asset.removeAttribute("readonly");
            }
            let itemName = util_1.default.getClsNameElement(item, 'layerName');
            itemName.onkeyup = () => {
                this.checkItemName(itemName);
                bScript && this.previewTempResult(iindex);
            };
            let file = util_1.default.getTagNameElement(item, 'ui-file');
            bScript && (file.onchange = () => {
                this.previewTempResult(iindex);
            });
            //@ts-ignore
            file.value = data.outPath.replace(dbHead, projectHead);
            if (data.link) {
                let clsSelect = util_1.default.getClsNameElement(item, 'LinkItem');
                if (clsSelect) {
                    clsSelect.hidden = false;
                    _vLinkItem[iindex] = new linkItem_1.LinkItem(clsSelect, data, () => {
                        _previewIndex = iindex;
                        this.refreshScriptInfo();
                    });
                }
            }
            bScript && (item.onclick = () => {
                this.previewTempResult(iindex);
            });
        },
        initUIAssetItem2(item, data, iindex) {
            let modelName = util_1.default.getClsNameElement(item, 'modelName');
            //@ts-ignore
            modelName.value = data.name + ': ';
            modelName.style.width = `100px`;
            let file = util_1.default.getClsNameElement(item, 'outPutResDir');
            let file2 = util_1.default.getClsNameElement(item, 'importResDir');
            file2.onchange = () => {
                _filePreivewDirty = false;
                this.previewTempResult(iindex);
            };
            //@ts-ignore
            file.value = data.outPath.replace(dbHead, projectHead);
            let clsSelect = util_1.default.getClsNameElement(item, 'LinkItem');
            if (clsSelect) {
                _vLinkItem[iindex] = new linkItem_1.LinkItem(clsSelect, data, () => {
                    _previewIndex = iindex;
                    this.previewTempResult(iindex);
                });
            }
            item.onclick = () => {
                _filePreivewDirty = false;
                this.previewTempResult(iindex);
            };
        },
        createUIAssetItem(data, iindex) {
            if (!this.$.classesPanel)
                return;
            let item = this.getCloneItemByType(data.type);
            switch (data.type) {
                case main_1.TemplateType.res:
                    this.initUIAssetItem2(item, data, iindex);
                    break;
                case main_1.TemplateType.script:
                case main_1.TemplateType.prefab:
                default:
                    this.initUIAssetItem1(item, data, iindex);
                    break;
            }
            this.$.classesPanel.appendChild(item);
            return item;
        },
        /** 根据模板生成功能列表 */
        async initFuncList() {
            if (!this.$.funcList)
                return;
            let templateList = await (0, main_1.getTemplateList)();
            let index = 0;
            for (let template of templateList) {
                let iindex = index;
                let input2Item = this.createUIAssetItem(template, iindex);
                if (!input2Item) {
                    console.warn('-- create template faild: ', util_1.default.Obj2String(template));
                    continue;
                }
                let clsSelect = util_1.default.getClsNameElement(input2Item, 'btnLock');
                clsSelect.hidden = false;
                let lockItem = new pathLockItem_1.pathLockItem(clsSelect, this.refreshScriptInfo.bind(this));
                let input = document.createElement("input");
                input.type = 'checkbox';
                input.checked = true;
                input.id = `${BaseID}${template.name}`;
                input.name = template.name;
                input.tabIndex = iindex;
                let model = { item: input2Item, data: template, lockItem: lockItem, index: iindex };
                mapSelect2ScriptItem.set(iindex, model);
                input.onclick = () => {
                    this.onCheckBoxClick(iindex, input.checked);
                };
                this.$.funcList.appendChild(input);
                var lb = document.createElement("label");
                lb.htmlFor = input.id;
                lb.innerText = template.name;
                this.$.funcList.appendChild(lb);
                index++;
            }
            this.refreshScriptInfo();
        },
        /** 初始化模板脚本 */
        async initTempLateScripts() {
            let templateList = await (0, main_1.getTemplateList)();
            const assetTempPath = path_1.default.join(Editor.Project.path, '.creator/asset-template/typescript');
            for (let template of templateList) {
                if (!template.classPath)
                    continue;
                let baseName = path_1.default.basename(template.classPath);
                let tempLatePath = baseName.replace(path_1.default.extname(baseName), '');
                util_1.default.readFile(path_1.default.join(assetTempPath, tempLatePath)).then(res => {
                    mapTemplateScript.set(template.name, res);
                });
            }
        },
        refreshScriptInfo(bPreview = true) {
            //@ts-ignore
            if (this._assetsCreating)
                return;
            let name = this.$.scriptName;
            if (!name)
                return;
            //@ts-ignore
            let nameVal = name.value.replace(/[, ]/g, '');
            //@ts-ignore
            name.value = nameVal;
            for (let [k, v] of mapSelect2ScriptItem) {
                //文件名
                let itemName = util_1.default.getClsNameElement(v.item, 'layerName');
                if (itemName) {
                    let nameData = v.data.name;
                    if (v.data.type == main_1.TemplateType.prefab) {
                        nameData = MVCModel_1.MVCModelName.Layer;
                    }
                    let extendsName = nameData[0].toUpperCase() + nameData.slice(1);
                    //@ts-ignore
                    itemName.value = `${nameVal}${extendsName}`;
                    this.checkItemName(itemName);
                }
                //文件路径
                let itemPath = util_1.default.getTagNameElement(v.item, 'ui-file');
                if (itemPath) {
                    if (v.data.autoPath && !v.lockItem.status) {
                        //@ts-ignore
                        itemPath.value = path_1.default.join(v.data.outPath.replace(dbHead, ""), `${wtemplate_1.wtemplate.formatHumpName(nameVal) + (v.data.appendPath || "")}`);
                    }
                    this.checkDirPath(itemPath);
                }
                if (v.data.link && _vLinkItem[k]) {
                    for (let ml of mapSelect2ScriptItem.values()) {
                        if (ml.data.name == v.data.link) {
                            _vLinkItem[k].dropLinkHiddent = !ml.item.hidden;
                            break;
                        }
                    }
                }
            }
            bPreview && this.previewTempResult();
        },
        refreshMVCModelData() {
            var _a;
            let mvcModel = {};
            for (let [k, v] of mapSelect2ScriptItem) {
                if (v.item.hidden) {
                    continue;
                }
                let obj = {};
                //文件名
                let itemName = util_1.default.getClsNameElement(v.item, 'layerName');
                if (itemName) {
                    //@ts-ignore
                    obj.name = itemName.value;
                }
                //文件路径
                let itemPath = util_1.default.getTagNameElement(v.item, 'ui-file');
                if (itemPath) {
                    //@ts-ignore
                    obj.path = itemPath.value;
                    let dirHead = v.data.outPath.replace(dbHead, projectHead);
                    let index = obj.path.indexOf(dirHead);
                    if (index >= 0) {
                        obj.constAppend = true;
                        obj.appendPath = obj.path.slice(index + dirHead.length);
                    }
                    else {
                        obj.appendPath = obj.path;
                    }
                }
                //绑定的文件信息
                let linkItem = _vLinkItem[k];
                if (linkItem) {
                    let script = mvc_1.mvc.scriptMgr().getScript((_a = linkItem.selected) === null || _a === void 0 ? void 0 : _a.toLowerCase());
                    obj.link = {
                        item: linkItem,
                        status: linkItem.status,
                        script: script,
                    };
                }
                mvcModel[v.data.name] = obj;
            }
            _mvcModel = mvcModel;
        },
        checkItemName(itemName) {
            //@ts-ignore
            let name = itemName.value;
            let has = mvc_1.mvc.scriptMgr().getScript(name.toLowerCase());
            itemName.style.color = has ? 'red' : 'mediumspringgreen';
        },
        checkDirPath(itemName) {
            //@ts-ignore
            let path = itemName.value;
            //路径长度为0 || 路径不为项目路径
            if (path.length == 0 || path.indexOf('assets') < 0) {
                itemName.style.color = 'red';
                return;
            }
            let has = util_1.default.existsSync(path_1.default.join(Editor.Project.path, path.replace(projectHead, '')));
            itemName.style.color = has ? 'yellow' : 'mediumspringgreen';
        },
        /** 准备导出资源 */
        async readyCreateAssets() {
            let name = this.$.scriptName;
            if (!name)
                return;
            let faild = false;
            let vReadyScripts = [];
            let vReadyPrefabs = [];
            let vReadyRes = [];
            //@ts-ignore
            if (name.value && name.value.length) {
                for (let [k, v] of mapSelect2ScriptItem) {
                    if (v.item.hidden)
                        continue;
                    let itemName = util_1.default.getClsNameElement(v.item, 'layerName');
                    let file = util_1.default.getTagNameElement(v.item, 'ui-file');
                    if (itemName && itemName.style.color == 'red' || file.style.color == 'red') {
                        faild = true;
                        break;
                    }
                    switch (v.data.type) {
                        case main_1.TemplateType.script:
                            vReadyScripts.push(v);
                            break;
                        case main_1.TemplateType.prefab:
                            vReadyPrefabs.push(v);
                            break;
                        case main_1.TemplateType.res:
                            vReadyRes.push(v);
                            break;
                    }
                }
            }
            if (faild) {
                console.log('warning !!!');
                return;
            }
            //@ts-ignore
            this._assetsCreating = true;
            if (vReadyScripts.length)
                await this.syncCreateScripts(vReadyScripts);
            if (vReadyPrefabs.length)
                await this.syncCreatePrefabs(vReadyPrefabs);
            if (vReadyRes.length)
                await this.syncCreateResources(vReadyRes);
            //@ts-ignore
            this._assetsCreating = false;
        },
        async syncCreateResources(vReadyRes) {
            let obj = vReadyRes[0];
            if (!obj)
                return;
            console.log('3.create resources~~~~');
            let filepath = util_1.default.getClsNameElement(obj.item, 'outPutResDir');
            //@ts-ignore
            let ppath = filepath.value.replace(projectHead, dbHead);
            await util_1.default.createFile(ppath).catch((err) => {
                console.warn(err);
            });
            let linkItem = _vLinkItem[obj.index];
            if (!linkItem || !linkItem.status)
                return;
            if (!this.$.resNode)
                return;
            let promiseList = [];
            let children = this.$.resNode.children;
            for (let child of children) {
                if (child.classList && child.classList.contains('grid-item-selected')) {
                    //@ts-ignore
                    let file = child._file;
                    if (!file)
                        continue;
                    //@ts-ignore
                    promiseList.push(util_1.default.importFile(file.path, ppath + '/' + child._fpath));
                }
            }
            await Promise.all(promiseList).catch(err => {
                console.error(err);
            });
            console.log('%c3.create resources end ~~~~', 'color: green');
        },
        /** 异步创建所有的预制体 */
        async syncCreatePrefabs(vReadyPrefabs) {
            console.log('2.create prefabs~~~~');
            let count = 0;
            for (let obj of vReadyPrefabs) {
                let lb = util_1.default.getClsNameElement(obj.item, 'layerName');
                let filepath = util_1.default.getTagNameElement(obj.item, 'ui-file');
                //@ts-ignore
                let ppath = filepath.value.replace(projectHead, dbHead);
                //@ts-ignore
                console.log(filepath.value);
                //@ts-ignore
                let pfb = await wtemplate_1.wtemplate.formatPrefab(lb.value);
                if (!pfb) {
                    console.error(`2-2-1. 加载预制体模板失败，检查路径文件是否存在： ${path_2.default.join(Editor.Package.getPath(package_json_1.default.name) || '', 'src/prefab/PrefabTemplate.prefab')}`);
                    continue;
                }
                //@ts-ignore
                await util_1.default.createFile(ppath + '/' + lb.value + '.prefab', pfb).catch((err) => {
                    console.warn(err);
                });
                count++;
            }
            console.log('%c2-2.create prefabs end~~~~', 'color: green');
        },
        /** 异步创建所有的脚本 */
        async syncCreateScripts(vReadyScripts) {
            var _a, _b;
            console.log('1.create scripts~~~~');
            let userInfo = await util_1.default.getUserInfo();
            let count = 0;
            let readyExportModel = [];
            for (let obj of vReadyScripts) {
                let lb = util_1.default.getClsNameElement(obj.item, 'layerName');
                let path = util_1.default.getTagNameElement(obj.item, 'ui-file');
                //@ts-ignore
                let ppath = path.value.replace(projectHead, dbHead);
                //@ts-ignore
                console.log(path.value);
                //@ts-ignore
                const lbVal = lb.value;
                let exportModel = await this.formatScriptTemplate(ppath, lbVal, obj.data, userInfo, false);
                readyExportModel.push(exportModel);
                await util_1.default.createFile(ppath + '/' + lbVal + '.ts', (exportModel.str)).catch((err) => {
                    console.warn(err);
                });
                count++;
            }
            console.log('%c1-1.create scripts end~~~~', 'color: green');
            console.log('1-2.inject scripts~~~~');
            //@ts-ignore
            const scriptComment = ((_a = this.$.scriptComment) === null || _a === void 0 ? void 0 : _a.value) || '';
            for (let model of readyExportModel) {
                if ((_b = model.CIList) === null || _b === void 0 ? void 0 : _b.length) {
                    for (let CIItem of model.CIList) {
                        CIItem.comment = scriptComment;
                        let _ts = await CIBase_1.CIBase.create(CIItem);
                        await _ts.save();
                    }
                }
            }
            console.log('%c1-3.inject scripts end~~~~', 'color: green');
            AST_1.AST.clear();
        },
        async previewTempResult(index) {
            var _a;
            this.refreshMVCModelData();
            index = index !== null && index !== void 0 ? index : _previewIndex;
            let obj = mapSelect2ScriptItem.get(index);
            if (!obj)
                return;
            if (!_bAutoWidth && this.$.body) {
                _bAutoWidth = true;
                let width = window.innerWidth;
                if (width < windowWidth) {
                    width = windowWidth;
                }
                window.resizeTo(width, window.innerHeight);
            }
            _previewIndex = index;
            if (this.$.previewCode) {
                this.$.previewCode.hidden = true;
            }
            if (this.$.previewRes) {
                this.$.previewRes.hidden = true;
            }
            if (obj.data.type == main_1.TemplateType.res) {
                //@ts-ignore
                let files = (_a = util_1.default.getClsNameElement(obj.item, 'importResDir')) === null || _a === void 0 ? void 0 : _a.files;
                if (!files)
                    return;
                if (!this.$.previewRes || !this.$.resNode || !files || !files.length)
                    return;
                this.$.previewRes.hidden = false;
                if (_filePreivewDirty)
                    return;
                _filePreivewDirty = true;
                let normalizePath = path_2.default.normalize(files[0].webkitRelativePath);
                let index = normalizePath.indexOf('\\');
                util_1.default.destroyAllChildren(this.$.resNode);
                for (let image of files) {
                    if (image.type.indexOf('image') == -1)
                        continue;
                    const gridItem = document.createElement('div');
                    gridItem.classList.add('grid-item', 'grid-item-selected');
                    const imgElement = document.createElement('img');
                    imgElement.src = `${image.path}`;
                    imgElement.draggable = false;
                    gridItem.appendChild(imgElement);
                    const lbElement = document.createElement('span');
                    lbElement.innerText = `${image.name}`;
                    gridItem.appendChild(lbElement);
                    const checkbox = document.createElement('ui-checkbox');
                    //@ts-ignore
                    checkbox.value = true;
                    //@ts-ignore
                    checkbox.readonly = true;
                    gridItem.appendChild(checkbox);
                    //@ts-ignore
                    gridItem._file = image;
                    //@ts-ignore
                    gridItem._fpath = image.webkitRelativePath.substring(index + 1);
                    gridItem.onclick = () => {
                        //@ts-ignore
                        checkbox.value = !checkbox.value;
                        //@ts-ignore
                        gridItem.classList.toggle('grid-item-selected', checkbox.value);
                    };
                    this.$.resNode.appendChild(gridItem);
                }
            }
            else {
                if (!this.$.previewCode || !this.$.mainCode)
                    return;
                this.$.previewCode.hidden = false;
                let userInfo = await util_1.default.getUserInfo();
                let lb = util_1.default.getClsNameElement(obj.item, 'layerName');
                let path = util_1.default.getTagNameElement(obj.item, 'ui-file');
                //@ts-ignore
                let ppath = (path === null || path === void 0 ? void 0 : path.value.replace(projectHead, dbHead)) || '';
                //@ts-ignore
                let model = await this.formatScriptTemplate(ppath, lb.value, obj.data, userInfo, window['mvcDebug'] ? false : true);
                this.$.mainCode.innerHTML = model.str;
            }
        },
        /** 格式化脚本模板 */
        formatScriptTemplate(path, scriptName, model, userInfo, bPreview) {
            return wtemplate_1.wtemplate.format(mapTemplateScript.get(model.name), {
                path: path,
                scriptName: scriptName,
                model: model,
                userInfo: userInfo,
                mvc: _mvcModel,
            }, bPreview);
        },
        addListener() {
            this.$.scriptName && (this.$.scriptName.onkeyup = this.refreshScriptInfo.bind(this, true));
            this.$.btnCreate && (this.$.btnCreate.onclick = this.readyCreateAssets.bind(this));
            mvc_1.mvc.messageMgr().setResChangeCall(util_1.default.debounce(this.onResChangeDelayCall.bind(this), 3000));
            // this.initResContainerListener()
        },
        onResChangeDelayCall() {
            try {
                this.refreshScriptInfo(true);
            }
            catch (error) {
                console.log(error);
            }
        }
        // initResContainerListener() {
        //     const gridContainer = this.$.resTouch
        //     const dragRect = this.$.dragRect
        //     if (!dragRect || !gridContainer) return
        //     let isDragging = false;
        //     let startCoord = { x: 0, y: 0 };
        //     let endCoord = { x: 0, y: 0 };
        //     // 监听 mousedown 事件
        //     gridContainer.addEventListener('mousedown', (event) => {
        //         isDragging = true;
        //         startCoord = { x: event.clientX, y: event.clientY };
        //         dragRect.style.display = 'block';
        //     });
        //     // 监听 mousemove 事件
        //     gridContainer.addEventListener('mousemove', (event) => {
        //         if (isDragging) {
        //             dragRect.hidden = false
        //             endCoord = { x: event.clientX, y: event.clientY };
        //             updateDragRect();
        //         }
        //     });
        //     gridContainer.addEventListener('mouseleave', () => {
        //         isDragging = false;
        //         dragRect.style.display = 'none';
        //         if (dragRect.hidden) return
        //         const dragRectElement = dragRect.getBoundingClientRect();
        //         toggleCheckboxes(dragRectElement);
        //     });
        //     gridContainer.addEventListener('mouseup', () => {
        //         isDragging = false;
        //         dragRect.style.display = 'none';
        //         if (dragRect.hidden) return
        //         const dragRectElement = dragRect.getBoundingClientRect();
        //         toggleCheckboxes(dragRectElement);
        //     });
        //     // 更新拖拽矩形
        //     let updateDragRect = () => {
        //         const left = Math.min(startCoord.x, endCoord.x);
        //         const top = Math.min(startCoord.y, endCoord.y);
        //         const width = Math.abs(endCoord.x - startCoord.x);
        //         const height = Math.abs(endCoord.y - startCoord.y);
        //         dragRect.style.left = `${left}px`;
        //         dragRect.style.top = `${top}px`;
        //         dragRect.style.width = `${width}px`;
        //         dragRect.style.height = `${height}px`;
        //     }
        //     let toggleCheckboxes = (rect: DOMRect) => {
        //         dragRect.hidden = true
        //         const gridItems = document.querySelectorAll('.grid-item');
        //         gridItems.forEach((gridItem) => {
        //             const itemRect = gridItem.getBoundingClientRect();
        //             const isInside = rect.left <= itemRect.right && rect.right >= itemRect.left &&
        //                 rect.top <= itemRect.bottom && rect.bottom >= itemRect.top;
        //             if (isInside) {
        //                 const checkbox = gridItem.querySelector('.ui-checkbox');
        //                 if (checkbox) {
        //                     // 假设有一个 checked 属性表示选中状态
        //                     const isChecked = checkbox.classList.contains('checked');
        //                     checkbox.classList.toggle('checked', !isChecked);
        //                 }
        //             }
        //         });
        //     }
        // }
    },
    ready() {
        (0, main_1.collectFilesfunc)().then(async (vMap) => {
            await (0, main_1.collectAllExtendsClass)(vMap[0]).then((layerScript) => {
                mvc_1.mvc.scriptMgr().init(vMap[0], vMap[1], layerScript);
                console.log('init project file over~');
            });
        });
        mvc_1.mvc.messageMgr().addListener();
        setTimeout(() => {
            if (this)
                this.initFuncList();
        }, 100);
        this.initTempLateScripts();
        this.addListener();
    },
    beforeClose() { },
    close() {
        mvc_1.mvc.messageMgr().removeListener();
        _vLinkItem = [];
        mapTemplateScript.clear();
        mapSelect2ScriptItem.clear();
        //@ts-ignore
        _userInfo = null;
    },
});
