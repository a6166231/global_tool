
import { BuildPlugin } from '../@types';

export const load: BuildPlugin.load = function () {
    console.debug('cocos-build-template load');
};

export const unload: BuildPlugin.load = function () {
    console.debug('cocos-build-template unload');
};

const hooks_web = {
    hooks: './hooks',
}

export const configs: BuildPlugin.Configs = {
    'web-mobile': hooks_web,
    'web-desktop': hooks_web
}

export const assetHandlers: BuildPlugin.AssetHandlers = './asset-handlers';
