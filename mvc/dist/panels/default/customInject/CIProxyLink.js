"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIProxyLink = void 0;
const CIBase_1 = require("./CIBase");
const AST_1 = require("../ts-morph/AST");
const path_1 = require("path");
class CIProxyLink extends CIBase_1.CIBase {
    constructor() {
        super(...arguments);
        this.proxyFile = null;
    }
    async readyToInject() {
        //该proxy解析
        this.proxyFile = await AST_1.AST.formatSourceByStr(this._CIItemData.opath.replace('db:', ''), this._CIItemData.buffer);
        if (this._CIItemData.fpath) {
            let extName = (0, path_1.extname)(this._CIItemData.fpath);
            let fileName = (0, path_1.basename)(this._CIItemData.fpath).replace(extName, '');
            //解析class的方法 太太太费性能了
            let vResponseImport = this._injectReqRes(fileName);
            // 非预览状态再注入import 否则浪费性能
            // import插入
            !this._CIItemData.bPreview && CIBase_1.CIBase.injectImport(vResponseImport, this.sourceFile, this.proxyFile);
        }
    }
    /** 请求、返回 */
    _injectReqRes(fileName) {
        let vResponseImport = [fileName];
        let modelClass = this.sourceFile.getClass(fileName);
        if (!modelClass)
            return vResponseImport;
        let _enumDec = this.sourceFile.getEnum(`${fileName}CMD`);
        let membs = (_enumDec === null || _enumDec === void 0 ? void 0 : _enumDec.getMembers()) || [];
        let vRequest = [];
        let vResponse = [];
        for (let _enum of membs) {
            let request = _enum.getName().slice(0, 3).toLowerCase() == 'req';
            request ? vRequest.push(_enum) : vResponse.push(_enum);
        }
        let reqHead = vRequest.length > 0 ? '----------------------request------------------------' : '';
        let resHead = vResponse.length > 0 ? '----------------------response------------------------' : '';
        let tarClass = this.proxyFile.getClasses()[0];
        for (let i = 0; i < vRequest.length; i++) {
            let _enum = vRequest[i];
            let _enumFunName = `send${_enum.getName()}`;
            if (tarClass.getMethod(_enumFunName))
                continue;
            let funcName = `send${Number(_enum.getValue()) % 1000}`;
            let tarFunc = modelClass.getMethod(funcName);
            let docs = (tarFunc === null || tarFunc === void 0 ? void 0 : tarFunc.getJsDocs().reduce((ary, v) => {
                ary.push(v.getInnerText());
                return ary;
            }, [])) || [];
            i == 0 && docs.splice(0, 0, reqHead);
            let vParam = [];
            let parameters = tarFunc === null || tarFunc === void 0 ? void 0 : tarFunc.getParameters().reduce((ary, v) => {
                var _a, _b;
                vParam.push(v.getName());
                ary.push({
                    name: v.getName(),
                    type: (_a = v.getTypeNode()) === null || _a === void 0 ? void 0 : _a.getText()
                });
                vResponseImport.push(((_b = v.getTypeNode()) === null || _b === void 0 ? void 0 : _b.getText()) || "");
                return ary;
            }, []);
            let resultFunc = tarClass.addMethod({
                docs: docs,
                name: _enumFunName,
                parameters: parameters,
            });
            resultFunc.setBodyText(`this.model.${funcName}(${vParam.join(',')})`);
        }
        for (let i = 0; i < vResponse.length; i++) {
            let _enum = vResponse[i];
            let _enumFunName = _enum.getName().slice(3);
            if (tarClass.getMethod(_enumFunName))
                continue;
            let docs = (_enum === null || _enum === void 0 ? void 0 : _enum.getJsDocs().reduce((ary, v) => {
                let txt = '\n' + _enum.getValue().toString() + '\n' + v.getInnerText();
                ary.push(txt);
                return ary;
            }, [])) || [];
            i == 0 && docs.splice(0, 0, resHead);
            let funcName = _enum.getName();
            let tarFunc = modelClass.getMethod('on' + funcName);
            let dataVar = tarFunc === null || tarFunc === void 0 ? void 0 : tarFunc.getVariableDeclaration('data');
            let tsType = dataVar === null || dataVar === void 0 ? void 0 : dataVar.getTypeNode();
            let dataType = 'any';
            if (tsType) {
                dataType = tsType.getText();
            }
            else {
                switch (dataVar === null || dataVar === void 0 ? void 0 : dataVar.getStructure().initializer) {
                    case "{}":
                        dataType = funcName;
                        vResponseImport.push(funcName);
                        break;
                    case "[]":
                        dataType = 'Array<any>';
                        break;
                }
            }
            let parameters = [
                {
                    name: 'cmd',
                    type: 'number',
                },
                {
                    name: 'data',
                    type: dataType,
                },
            ];
            let resultFunc = tarClass.addMethod({
                docs: docs,
                name: 'on' + _enum.getName(),
                parameters: parameters,
            });
            resultFunc.setBodyText(`console.log("------------ ${'on' + _enum.getName()}", cmd, data)`);
        }
        return vResponseImport;
    }
    getFullText() {
        var _a;
        return ((_a = this.proxyFile) === null || _a === void 0 ? void 0 : _a.getFullText()) || "";
    }
    async save() {
        try {
            await this.sourceFile.save();
        }
        catch (error) {
            console.log(`保存失败：${this.sourceFile.getFilePath()}. `, error);
        }
        try {
            await this.proxyFile.save();
        }
        catch (error) {
            console.log(`保存失败：${this.proxyFile.getFilePath()}. `, error);
        }
    }
}
exports.CIProxyLink = CIProxyLink;
