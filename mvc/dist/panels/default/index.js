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
const fs_extra_1 = require("fs-extra");
const path_1 = __importStar(require("path"));
const main_1 = require("../../main");
const util_1 = __importDefault(require("./util"));
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const wtemplate_1 = require("./wtemplate");
const mvc_1 = require("./mvc");
const linkItem_1 = require("./ui/linkItem");
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
module.exports = Editor.Panel.define({
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
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
        onCheckBoxClick(index, checked) {
            if (!this.$.classesPanel)
                return;
            let item = this.$.classesPanel.children[index];
            item.hidden = !checked;
            this.refreshScriptInfo();
        },
        createUIAssetItem(data, iindex) {
            if (!this.$.classesPanel || !this.$.scriptItem)
                return;
            let item = this.$.scriptItem.cloneNode(true);
            let modelName = util_1.default.getClsNameElement(item, 'modelName');
            //@ts-ignore
            modelName.value = data.name + ': ';
            modelName.style.width = `100px`;
            let asset = util_1.default.getTagNameElement(item, 'ui-asset');
            //@ts-ignore
            asset.value = data.classPath;
            if (iindex == 1)
                asset.removeAttribute("readonly");
            let itemName = util_1.default.getClsNameElement(item, 'layerName');
            itemName.onkeyup = () => {
                this.checkItemName(itemName);
                this.previewTempResult(iindex);
            };
            let file = util_1.default.getTagNameElement(item, 'ui-file');
            //@ts-ignore
            file.value = data.outPath.replace(dbHead, projectHead);
            if (data.link) {
                let clsSelect = util_1.default.getClsNameElement(item, 'LinkItem');
                clsSelect.hidden = false;
                _vLinkItem[iindex] = new linkItem_1.LinkItem(clsSelect, data, this.refreshScriptInfo.bind(this));
            }
            this.$.classesPanel.appendChild(item);
            item.onclick = () => {
                this.previewTempResult(iindex);
            };
            return item;
        },
        /** 根据模板生成功能列表 */
        async initFuncList() {
            if (!this.$.funcList)
                return;
            let templateList = (0, main_1.getTemplateList)();
            let index = 0;
            for (let template of templateList) {
                let iindex = index;
                let input2Item = this.createUIAssetItem(template, iindex);
                if (!input2Item) {
                    console.warn('-- create template faild: ', util_1.default.Obj2String(template));
                    continue;
                }
                let input = document.createElement("input");
                input.type = 'checkbox';
                input.checked = true;
                input.id = `${BaseID}${template.name}`;
                input.name = template.name;
                input.tabIndex = iindex;
                mapSelect2ScriptItem.set(iindex, { item: input2Item, data: template });
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
        initTempLateScripts() {
            let templateList = (0, main_1.getTemplateList)();
            const assetTempPath = path_1.default.join(Editor.Project.path, '.creator/asset-template/typescript');
            for (let template of templateList) {
                let baseName = path_1.default.basename(template.classPath);
                let tempLatePath = baseName.replace(path_1.default.extname(baseName), '');
                util_1.default.readFile(path_1.default.join(assetTempPath, tempLatePath)).then(res => {
                    mapTemplateScript.set(template.name, res);
                });
            }
        },
        refreshScriptInfo(ev) {
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
                    //@ts-ignore
                    itemName.value = `${nameVal}${v.data.name[0].toUpperCase() + v.data.name.slice(1)}`;
                    this.checkItemName(itemName);
                }
                //文件路径
                let itemPath = util_1.default.getTagNameElement(v.item, 'ui-file');
                if (itemPath) {
                    if (v.data.autoPath) {
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
            this.previewTempResult();
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
        readyCreateScripts() {
            let name = this.$.scriptName;
            if (!name)
                return;
            let faild = false;
            let vReadyScripts = [];
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
                    vReadyScripts.push(v);
                }
            }
            if (faild) {
                console.log('warning !!!');
                return;
            }
            if (vReadyScripts.length)
                this.syncCreateScripts(vReadyScripts);
        },
        async getUserInfo() {
            if (!_userInfo) {
                _userInfo = await Editor.User.getData();
            }
            return _userInfo;
        },
        async syncCreateScripts(vReadyScripts) {
            console.log('create scripts~~~~');
            let userInfo = await this.getUserInfo();
            let count = 0;
            for (let obj of vReadyScripts) {
                let lb = util_1.default.getClsNameElement(obj.item, 'layerName');
                let path = util_1.default.getTagNameElement(obj.item, 'ui-file');
                //@ts-ignore
                let ppath = path.value.replace(projectHead, dbHead);
                //@ts-ignore
                await util_1.default.createFile(ppath + '/' + lb.value + '.ts', await this.formatScriptTemplate(ppath, lb.value, obj.data, userInfo)).catch((err) => {
                    console.warn(err);
                });
                count++;
            }
            console.log('create scripts end~~~~');
        },
        async previewTempResult(index) {
            this.refreshMVCModelData();
            index = index !== null && index !== void 0 ? index : _previewIndex;
            if (!this.$.mainCode)
                return;
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
            let userInfo = await this.getUserInfo();
            let lb = util_1.default.getClsNameElement(obj.item, 'layerName');
            let path = util_1.default.getTagNameElement(obj.item, 'ui-file');
            //@ts-ignore
            let ppath = path.value.replace(projectHead, dbHead);
            //@ts-ignore
            this.$.mainCode.innerHTML = await this.formatScriptTemplate(ppath, lb.value, obj.data, userInfo);
        },
        /** 格式化脚本模板 */
        formatScriptTemplate(path, scriptName, model, userInfo) {
            return wtemplate_1.wtemplate.format(mapTemplateScript.get(model.name), {
                path: path,
                scriptName: scriptName,
                model: model,
                userInfo: userInfo,
                mvc: _mvcModel,
            });
        },
        addListener() {
            this.$.scriptName && (this.$.scriptName.onkeyup = this.refreshScriptInfo.bind(this));
            this.$.btnCreate && (this.$.btnCreate.onclick = this.readyCreateScripts.bind(this));
            mvc_1.mvc.messageMgr().setResChangeCall(this.refreshScriptInfo.bind(this));
        }
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
