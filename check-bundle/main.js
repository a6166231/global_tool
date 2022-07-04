'use strict';
const fs = require("fs")
const path = require('path');
const Parser = require("./parser");

//根据自己分包的命名逻辑来判断是不是分包
var isBundle = async function (str, dir = '') {
    return new Promise((call) => {
        if (dir == 'res.meta' || dir == 'resources.meta') {
            call(true)
            return;
        }
        fs.readFile(str, 'utf8', async (err, data) => {
            call(data && JSON.parse(data).isBundle)
        })
    })
}

var checkDir = async function (p) {
    return new Promise(call => call(fs.lstatSync(p).isDirectory()))
}

/** 返回ts脚本 */
var getTsList = async function (dir) {
    return new Promise((call) => {
        fs.readdir(dir, async (err, info) => {
            if (err) Editor.log(err);
            let list = [];
            for (let item of info) {
                if (await checkDir(path.join(dir, item))) {
                    list.push(...await getTsList(path.join(dir, item)))
                } else if (path.extname(item) === '.ts') {
                    list.push(path.join(dir, item));
                }
            }
            call(list)
        })
    })
}

/** 返回resList */
var getResList = async function (dir) {
    return new Promise((call) => {
        fs.readdir(dir, async (err, info) => {
            if (err) Editor.log(err);
            let listMeta = [];
            let listPrefab = [];
            for (let item of info) {
                if (await checkDir(path.join(dir, item))) {
                    let l = await getResList(path.join(dir, item))
                    listMeta.push(...l[0])
                    listPrefab.push(...l[1])
                } else {
                    if (path.extname(item) === '.meta') { //meta文件
                        listMeta.push(path.join(dir, item));
                    }
                    if (path.extname(item) === '.prefab' || path.extname(item) === '.fire') {
                        listPrefab.push(path.join(dir, item))
                    }
                }
            }
            call([listMeta, listPrefab])
        })
    })
}

var checkTsList = function (ppath, bundle, list) {
    for (let ts of list) {
        fs.readFile(ts, 'utf8', async (err, data) => {
            const lines = data.split(/\r?\n/);
            for (let line of lines) {
                if (line.indexOf("import") != -1) {
                    line = line.replace(/\//g, "\\");
                    let ds = line.split("\\");
                    ds = ds.splice(1, ds.length - 2)
                    for (let char of ds) {
                        if (char != bundle && isBundle(ppath)) {
                            Editor.error("bundle : ", bundle, " import ", char)
                            Editor.warn(ts)
                            Editor.warn(line)
                        }
                    }
                }
            }
        })
    }
}

var getResMap = function (resList) {
    return new Promise(async (callfunc) => {
        let map = {}
        for (let bundle in resList) {
            for (let dir of resList[bundle]) {
                const mpath = path.join(path.dirname(dir), path.basename(dir, ".meta"))
                let uuid = Editor.assetdb.fspathToUuid(mpath);
                if (uuid) {
                    map[uuid] = {
                        path: mpath,
                        bundle: bundle,
                    }
                }
                let info = Editor.assetdb.subAssetInfosByPath(mpath)[0];
                if(info){
                    map[info.uuid] = {
                        path: mpath,
                        bundle: bundle,
                    }
                }
            }
        }
        callfunc(map)
    })
}

var getNodePathByUidInTree = function (tree) {
    let npath = []
    if (!tree) return npath;
    for (let children of tree.children) {
        let uuid = containsValue(children.components, '__uuid__');
        if (uuid) {
            npath.push({
                uuid: uuid,
                npath: children.path
            })
        }
        npath.push(...getNodePathByUidInTree(children))
    }
    return npath;
}

var containsValue = function (object, value) {
    let result = '';
    const search = (_object) => {
        if (Parser.isObject(_object)) {
            for (const key in _object) {
                if (key === value) {
                    result = _object[key];
                    return;
                }
                search(_object[key]);
            }
        } else if (Array.isArray(_object)) {
            for (let i = 0, l = _object.length; i < l; i++) {
                search(_object[i]);
            }
        }
    }
    search(object);
    return result;
}

var checkPrefabByMap = async function (prefabList, resMap) {
    return new Promise(async (endcall) => {
        for (let bundle in prefabList) {
            for (let prefabPath of prefabList[bundle]) {
                await new Promise((callfunc) => {
                    fs.readFile(prefabPath, 'utf8', (err, data) => {
                        for (let uidData of getNodePathByUidInTree(Parser.convert(JSON.parse(data)))) {
                            if (resMap[uidData.uuid] && resMap[uidData.uuid].bundle != bundle &&
                                resMap[uidData.uuid].bundle != 'res' && resMap[uidData.uuid].bundle != 'resources') {
                                let obj = `\n"user path": ${Editor.assetdb.fspathToUrl(prefabPath).replace('db://','')}`;
                                obj += `,\n"nodePath": ${uidData.npath}`;
                                obj += `,\n"asset path": ${Editor.assetdb.fspathToUrl(resMap[uidData.uuid].path).replace('db://','')}`;
                                obj += `,\n"uuid": ${uidData.uuid}`;
                                Editor.warn("bundle: " + bundle + " use " + resMap[uidData.uuid].bundle + " asset. infomation :", obj);
                            }
                        }
                        callfunc();
                    });
                })
            }
        }
        endcall();
    })
}


/** 检测分包脚本引用 */
var checkScript = async function () {
    const PPATH = Editor.Project.path;
    const ASSETS_Path = PPATH + '\\assets';
    Editor.log("start check script import .... ")

    fs.readdir(ASSETS_Path, async (err, bundleList) => {
        for (let dir of bundleList) {
            if (isBundle(dir)) {
                let list = await getTsList(path.join(ASSETS_Path, dir))
                if (list.length == 0) continue;
                checkTsList(path.join(ASSETS_Path, dir), dir, list)
            }
        }
        Editor.success("check Over")
    })
}

/** 检测分包资源引用 */
var checkResources = function () {
    const PPATH = Editor.Project.path;
    const ASSETS_Path = PPATH + '\\assets';
    Editor.log("start check res import .... ")
    //当前只在assets下的文件夹分包  只检测其中的   其他的情况不考虑
    fs.readdir(ASSETS_Path, async (err, bundleList) => {
        let prefabAry = {};
        let resAry = {};
        for (let dir of bundleList) {
            if (dir.indexOf('.meta') > -1 && await isBundle(path.join(ASSETS_Path, dir), dir)) {
                const sDir = dir.split('.meta')[0]
                let list = await getResList(path.join(ASSETS_Path, sDir))
                resAry[sDir] = list[0];
                prefabAry[sDir] = list[1];
            }
        }
        let resMap = await getResMap(resAry)
        await checkPrefabByMap(prefabAry, resMap);
        Editor.success("check Over")
    })
}

module.exports = {
    load() {

    },

    unload() {

    },

    messages: {
        // 'check-bundle:script'() {
        // checkScript()
        // },
        'check-bundle:res'() {
            checkResources()
        },
    },
};