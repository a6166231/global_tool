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
exports.wtemplate = exports.TemplateScriptMap = exports.TemplateStr = void 0;
const path_1 = __importStar(require("path"));
const main_1 = require("../../main");
const MVCModel_1 = require("./MVCModel");
const util_1 = __importDefault(require("./util"));
const package_json_1 = __importDefault(require("../../../package.json"));
const CINoticeTable_1 = require("./customInject/CINoticeTable");
const CIBase_1 = require("./customInject/CIBase");
const CILayerTable_1 = require("./customInject/CILayerTable");
const CIWorldMediatorTable_1 = require("./customInject/CIWorldMediatorTable");
const CIWorldProxyTable_1 = require("./customInject/CIWorldProxyTable");
const CIProxyLink_1 = require("./customInject/CIProxyLink");
const CIProxyTable_1 = require("./customInject/CIProxyTable");
const CIJumpLayerProxy_1 = require("./customInject/CIJumpLayerProxy");
const CIMediatorLink_1 = require("./customInject/CIMediatorLink");
const CILayerLink_1 = require("./customInject/CILayerLink");
var TemplateStr;
(function (TemplateStr) {
    TemplateStr["Author"] = "<%Author%>";
    TemplateStr["Time"] = "<%DateTime%>";
    TemplateStr["URL"] = "<%URL%>";
    TemplateStr["ClassName"] = "<%CamelCaseClassName%>";
    TemplateStr["TypeClass"] = "<%TypeClassName%>";
    TemplateStr["InterfaceClassName"] = "<%InterfaceClassName%>";
    TemplateStr["AppendPath"] = "<%AppendPath%>";
    TemplateStr["Constructor"] = "<%Constructor%>";
    TemplateStr["ProxyReq"] = "<%ProxyReq%>";
    TemplateStr["ProxyReqID"] = "<%ProxyReqID%>";
    TemplateStr["ProxyRes"] = "<%ProxyRes%>";
    TemplateStr["ProxyResID"] = "<%ProxyResID%>";
    TemplateStr["IndexStr"] = "<%IndexStr%>";
    TemplateStr["SelectDivStr"] = "<%SelectDivStr%>";
    TemplateStr["PrefabTemplate"] = "PrefabTemplate";
})(TemplateStr = exports.TemplateStr || (exports.TemplateStr = {}));
exports.TemplateScriptMap = {
    selectDiv: `<option value="${TemplateStr.SelectDivStr}">${TemplateStr.SelectDivStr}</option>`,
    mediatorConstructor: `${TemplateStr.Constructor};
        this._url = Global.MMO.PATH_PREFAB_GAME + "${TemplateStr.AppendPath}/${TemplateStr.InterfaceClassName}";
        this._scriptName = ${TemplateStr.InterfaceClassName};
        this._layerType = LayerType.Mult;
        this._type = Global.MMO.UI_NORMAL;`,
    mediatorConstructor2: `${TemplateStr.Constructor};
        // this._url = Global.MMO.PATH_PREFAB_GAME + "${TemplateStr.InterfaceClassName}";
        this._scriptName = ${TemplateStr.InterfaceClassName};
        this._layerType = LayerType.Mult;
        this._type = Global.MMO.UI_NORMAL;`,
    proxyConstructor: `${TemplateStr.Constructor};
        this.ModelType = ${TemplateStr.InterfaceClassName};`,
    proxyConstructor2: `${TemplateStr.Constructor};`,
    /** 请求 */
    proxyRequest: `
    public ${TemplateStr.ProxyReq}() {
        this.model.send${TemplateStr.IndexStr}();
    }`,
    /** 返回 */
    proxyResponse: `
    public on${TemplateStr.ProxyRes}(cmd: number, data: ${TemplateStr.ProxyRes}) {
        console.log('--------- ${TemplateStr.ProxyRes}', cmd, data);
    }`,
    noticeOpenStr: `Layer_${TemplateStr.InterfaceClassName}_Open`,
    noticeCloseStr: `Layer_${TemplateStr.InterfaceClassName}_Close`,
    noticeFuncStr: `public RegisterNotification(callMap: Map<NoticeTable, DisposeHandle>): void {
        callMap.set(Global.NTable.Layer_${TemplateStr.InterfaceClassName}_Open, this.OpenLayer);
        callMap.set(Global.NTable.Layer_${TemplateStr.InterfaceClassName}_Close, this.CloseLayer);
    }`
};
class wtemplate {
    static async format(str = "", param, bPreview) {
        if (!str || str.length == 0)
            return { str };
        str = this.formatStrByTemplate(str, param.scriptName, TemplateStr.ClassName);
        str = this.formatStrByTemplate(str, (new Date()).toString(), TemplateStr.Time);
        str = this.formatStrByTemplate(str, param.path + '/' + param.scriptName + '.ts', TemplateStr.URL);
        str = this.formatStrByTemplate(str, param.userInfo.nickname, TemplateStr.Author);
        return await this.formatClassInterface(str, param, bPreview);
    }
    static async formatPrefab(fname) {
        let ppath = path_1.default.join(Editor.Package.getPath(package_json_1.default.name) || '', 'src/prefab/CustomPrefabTemplate.prefab');
        if (!util_1.default.existsSync(ppath)) {
            ppath = path_1.default.join(Editor.Package.getPath(package_json_1.default.name) || '', 'src/prefab/PrefabTemplate.prefab');
        }
        if (!util_1.default.existsSync(ppath))
            return;
        let prefab = await util_1.default.readFile(ppath);
        prefab = this.formatStrByTemplate(prefab, TemplateStr.PrefabTemplate, fname);
        return prefab;
    }
    static formatStrByTemplate(str, tar, type) {
        return str.replace(new RegExp(type, 'g'), tar);
    }
    /** 根据不同接口类型格式化导出数据结构 */
    static async formatClassInterface(str, param, bPreview) {
        let model = param.model;
        if (!model.classPath)
            return { str };
        let extendsCls = path_1.default.basename(model.classPath).replace('.ts', '');
        let exportModel = { str, CIList: [] };
        switch (model.name) {
            case MVCModel_1.MVCModelName.Mediator:
                exportModel = await this._formatMediator(str, param, param.mvc, extendsCls, bPreview);
                break;
            case MVCModel_1.MVCModelName.Proxy:
                exportModel = await this._formatProxy(str, param, param.mvc.proxy, extendsCls, bPreview);
                break;
            case MVCModel_1.MVCModelName.Layer:
                exportModel = await this._formatLayer(str, param, bPreview);
                break;
        }
        return exportModel;
    }
    static async _formatMediator(str, param, mvc, extendsCls, bPreview) {
        var _a, _b, _c;
        let linkObj = ((_a = mvc.mediator) === null || _a === void 0 ? void 0 : _a.link) || {};
        let linkLayerName = '';
        let exportModel = {
            str,
            CIList: [],
        };
        let linkPath = null;
        //extends
        if (mvc.layer && ((_c = (_b = mvc.mediator) === null || _b === void 0 ? void 0 : _b.link) === null || _c === void 0 ? void 0 : _c.status)) {
            linkPath = (0, path_1.join)(mvc.layer.path.replace('project://', ''), mvc.layer.name + '.ts');
            linkLayerName = mvc.layer.name;
            //mediator 绑定 layer
            let extendsStr = `extends ${extendsCls}`;
            str = str.replace(extendsStr, `${extendsStr}<${linkLayerName}>`);
            let constructorStr = `super(${param.scriptName}.NAME)`;
            str = str.replace(constructorStr, mvc.layer.constAppend ? exports.TemplateScriptMap.mediatorConstructor : exports.TemplateScriptMap.mediatorConstructor2);
            str = this.formatStrByTemplate(str, constructorStr, TemplateStr.Constructor);
            str = this.formatStrByTemplate(str, linkLayerName, TemplateStr.InterfaceClassName);
            str = this.formatStrByTemplate(str, mvc.layer.appendPath || "", TemplateStr.AppendPath);
            let index = str.indexOf('public RegisterNotification');
            if (index >= 0) {
                str = str.slice(0, index) + this.formatNoticeListener(linkLayerName);
                str += '\n}';
            }
        }
        else if (linkObj && linkObj.item && !linkObj.item.dropLinkHiddent) {
            if (linkObj.status && linkObj.script) {
                linkPath = linkObj.script.path.replace(Editor.Project.path, '');
                linkLayerName = linkObj.script.trueName;
                //mediator 绑定 目标layer
                let extendsStr = `extends ${extendsCls}`;
                str = str.replace(extendsStr, `${extendsStr}<${linkLayerName}>`);
                let constructorStr = `super(${param.scriptName}.NAME)`;
                str = str.replace(constructorStr, exports.TemplateScriptMap.mediatorConstructor2);
                str = this.formatStrByTemplate(str, constructorStr, TemplateStr.Constructor);
                str = this.formatStrByTemplate(str, linkLayerName, TemplateStr.InterfaceClassName);
                let index = str.indexOf('public RegisterNotification');
                if (index >= 0) {
                    str = str.slice(0, index) + this.formatNoticeListener(linkLayerName);
                    str += '\n}';
                }
            }
        }
        //此处不保存 且 要提前加载 所以直接create
        let link = await CIBase_1.CIBase.create({
            CIWay: CIMediatorLink_1.CIMediatorLink,
            lpath: linkPath,
            // fpath: linkObj?.script?.path.replace(Editor.Project.path, ''),
            buffer: str,
            opath: path_1.default.join(Editor.Project.path, param.path, param.scriptName + '.ts').replace('db:', ''),
        });
        str = link.getFullText();
        if (!bPreview) {
            if (linkLayerName.length) {
                //noticeTable中插入消息
                exportModel.CIList.push({
                    CIWay: CINoticeTable_1.CINoticeTable,
                    fpath: (await (0, main_1.getCfgJson)()).NoticeTable,
                    readyList: [
                        this.formatStrByTemplate(exports.TemplateScriptMap.noticeOpenStr, linkLayerName, TemplateStr.InterfaceClassName),
                        this.formatStrByTemplate(exports.TemplateScriptMap.noticeCloseStr, linkLayerName, TemplateStr.InterfaceClassName),
                    ],
                    opath: (await (0, main_1.getCfgJson)()).NoticeTable,
                });
                //jumplayerproxy插入
                exportModel.CIList.push({
                    CIWay: (CIJumpLayerProxy_1.CIJumpLayerProxy),
                    fpath: (await (0, main_1.getCfgJson)()).JumpLayerProxy,
                    readyList: [
                        {
                            open: this.formatStrByTemplate(exports.TemplateScriptMap.noticeOpenStr, linkLayerName, TemplateStr.InterfaceClassName),
                            close: this.formatStrByTemplate(exports.TemplateScriptMap.noticeCloseStr, linkLayerName, TemplateStr.InterfaceClassName),
                            layer: linkLayerName
                        }
                    ],
                    opath: (await (0, main_1.getCfgJson)()).JumpLayerProxy,
                });
            }
            //worldMeditorTable中插入引用
            exportModel.CIList.push({
                CIWay: CIWorldMediatorTable_1.CIWorldMediatorTable,
                fpath: (await (0, main_1.getCfgJson)()).WorldMediatorTable,
                readyList: [
                    param.scriptName,
                ],
                opath: (await (0, main_1.getCfgJson)()).WorldMediatorTable,
                lpath: param.path,
            });
        }
        exportModel.str = str;
        return exportModel;
    }
    static async _formatProxy(str, param, proxy, extendsCls, bPreview) {
        var _a;
        let constructorStr = `super(${param.scriptName}.NAME)`;
        //proxy 绑定 model
        let linkObj = proxy === null || proxy === void 0 ? void 0 : proxy.link;
        let exportModel = {
            str,
            CIList: [],
        };
        let linkScript = linkObj && linkObj.status && linkObj.script;
        //proxy这里要预览结果 所以要提前解析一次
        let ci = await CIBase_1.CIBase.create({
            CIWay: CIProxyLink_1.CIProxyLink,
            fpath: (_a = linkScript === null || linkScript === void 0 ? void 0 : linkScript.path) === null || _a === void 0 ? void 0 : _a.replace(Editor.Project.path, ''),
            buffer: str,
            opath: path_1.default.join(Editor.Project.path, param.path, param.scriptName + '.ts').replace('db:', ''),
            bPreview,
        });
        str = ci.getFullText();
        if (linkScript) {
            let extendsStr = `extends ${extendsCls}`;
            str = str.replace(extendsStr, `${extendsStr}<${linkScript.trueName}>`);
            str = str.replace(constructorStr, exports.TemplateScriptMap.proxyConstructor);
            str = this.formatStrByTemplate(str, constructorStr, TemplateStr.Constructor);
            str = this.formatStrByTemplate(str, linkScript.trueName, TemplateStr.InterfaceClassName);
        }
        if (!bPreview) {
            exportModel.CIList.push({
                CIWay: CIWorldProxyTable_1.CIWorldProxyTable,
                fpath: (await (0, main_1.getCfgJson)()).WorldProxyTable,
                readyList: [
                    param.scriptName,
                ],
                opath: (await (0, main_1.getCfgJson)()).WorldProxyTable,
                lpath: param.path,
            });
            exportModel.CIList.push({
                CIWay: CIProxyTable_1.CIProxyTable,
                fpath: (await (0, main_1.getCfgJson)()).ProxyTable,
                readyList: [
                    param.scriptName,
                ],
                opath: (await (0, main_1.getCfgJson)()).ProxyTable,
            });
        }
        exportModel.str = str;
        return exportModel;
    }
    static async _formatLayer(str, param, bPreview) {
        var _a;
        let exportModel = {
            str,
            CIList: [],
        };
        if (!bPreview && ((_a = param.mvc.layer) === null || _a === void 0 ? void 0 : _a.name)) {
            exportModel.CIList.push({
                CIWay: CILayerTable_1.CILayerTable,
                fpath: (await (0, main_1.getCfgJson)()).LayerTable,
                readyList: [
                    param.scriptName
                ],
            });
        }
        let ci = await CIBase_1.CIBase.create({
            CIWay: CILayerLink_1.CILayerLink,
            buffer: str,
            opath: path_1.default.join(Editor.Project.path, param.path, param.scriptName + '.ts').replace('db:', ''),
            lpath: path_1.default.join(Editor.Project.path, param.model.classPath).replace('db:', ''),
            bPreview,
        });
        str = ci.getFullText();
        exportModel.str = str;
        return exportModel;
    }
    static formatNoticeListener(name) {
        return this.formatStrByTemplate(exports.TemplateScriptMap.noticeFuncStr, name, TemplateStr.InterfaceClassName);
    }
    /** 格式化驼峰命名 根据大写分割并转小写用 split填充间隔
     * @example TestClassName        NBClass
     * @returns test_class_name      NB_class
     */
    static formatHumpName(str, split = '_') {
        if (!str || str.length == 0)
            return "";
        let bakS = str[0];
        str = bakS.toUpperCase() + str.slice(1);
        let result = "";
        let reg = new RegExp('[A-Z][^A-Z]*', 'g');
        let match = str.match(reg) || [];
        for (let i = 0; i < match.length; i++) {
            if (match[i].length == 0)
                continue;
            if (match[i].length == 1) {
                result += match[i];
            }
            else {
                result += match[i].toLowerCase();
            }
            if (match[i + 1] && match[i + 1].length > 1) {
                result += split;
            }
        }
        if ((new RegExp('[a-z]')).test(bakS))
            result = bakS + result.slice(1);
        return result;
    }
}
exports.wtemplate = wtemplate;
