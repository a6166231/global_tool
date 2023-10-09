"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetHandlers = exports.configs = exports.unload = exports.load = void 0;
const load = function () {
    console.debug('cocos-build-template load');
};
exports.load = load;
const unload = function () {
    console.debug('cocos-build-template unload');
};
exports.unload = unload;
const hooks_web = {
    hooks: './hooks',
};
exports.configs = {
    'web-mobile': hooks_web,
    'web-desktop': hooks_web
};
exports.assetHandlers = './asset-handlers';
