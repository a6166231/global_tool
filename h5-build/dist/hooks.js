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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAfterBuild = void 0;
const fs = __importStar(require("fs"));
const _CCSettings = 'window._CCSettings = undefined;';
const onAfterBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('wwwwww');
        console.log('===================');
        const appjs = result.paths.applicationJS;
        yield unReleaseCCSetting(appjs);
        console.log('===================');
    });
};
exports.onAfterBuild = onAfterBuild;
var unReleaseCCSetting = function (appJS) {
    return __awaiter(this, void 0, void 0, function* () {
        let f = yield fs.readFileSync(appJS, 'utf-8');
        // console.log(f)
        yield fs.writeFileSync(appJS, f.replace(_CCSettings, `// ${_CCSettings}`));
    });
};
// interface IOptions {
//     commonTest1: number;
//     commonTest2: 'opt1' | 'opt2';
//     webTestOption: boolean;
// }
// const PACKAGE_NAME = 'asdasdaaaa';
// interface ITaskOptions extends IBuildTaskOption {
//     packages: {
//         'cocos-plugin-template': IOptions;
//     };
// }
// function log(...arg: any[]) {
//     return console.log(`[${PACKAGE_NAME}] `, ...arg);
// }
// let allAssets = [];
// export const throwError: BuildHook.throwError = true;
// export const load: BuildHook.load = async function () {
//     console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
//     allAssets = await Editor.Message.request('asset-db', 'query-assets');
// };
// export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options) {
//     // Todo some thing
//     log(`${PACKAGE_NAME}.webTestOption`, 'onBeforeBuild');
// };
// export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options, result) {
//     const pkgOptions = options.packages[PACKAGE_NAME];
//     if (pkgOptions && pkgOptions.webTestOption) {
//         console.debug('webTestOption', true);
//     }
//     // Todo some thing
//     console.debug('get settings test', result.settings);
// };
// export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options, result) {
//     // Todo some thing
//     console.log('webTestOption', 'onAfterCompressSettings');
// };
// // export const onAfterBuild: BuildHook.onAfterBuild = async function (options, result) {
// //     // change the uuid to test
// //     const uuidTestMap = {
// //         image: '57520716-48c8-4a19-8acf-41c9f8777fb0',
// //     };
// //     for (const name of Object.keys(uuidTestMap)) {
// //         const uuid = uuidTestMap[name];
// //         console.debug(`containsAsset of ${name}`, result.containsAsset(uuid));
// //         console.debug(`getAssetPathInfo of ${name}`, result.getAssetPathInfo(uuid));
// //         console.debug(`getRawAssetPaths of ${name}`, result.getRawAssetPaths(uuid));
// //         console.debug(`getJsonPathInfo of ${name}`, result.getJsonPathInfo(uuid));
// //     }
// // };
// export const unload: BuildHook.unload = async function () {
//     console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
// };
// export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
//     console.log(`onBeforeMake: root: ${root}, options: ${options}`);
// };
// export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
//     console.log(`onAfterMake: root: ${root}, options: ${options}`);
// };
