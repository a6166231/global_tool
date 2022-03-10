'use strict';
const fs = require("fs")
const path = require('path');

//根据自己分包的命名逻辑来判断是不是分包
//本项目中所有分包命名都是数字
var isBundle = function (str) {
    return !isNaN(str);
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

var checkTsList = function (bundle, list) {
    for (let ts of list) {
        fs.readFile(ts, 'utf8', (err, data) => {
            const lines = data.split(/\r?\n/);
            for (let line of lines) {
                if (line.indexOf("import") != -1) {
                    line = line.replace(/\//g, "\\");
                    let ds = line.split("\\");
                    ds = ds.splice(1, ds.length - 2)
                    for (let char of ds) {
                        if (char != bundle && isBundle(char)) {
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

var checkResList = function (bundle, list) {
    for (let ts of list) {
        fs.readFile(ts, 'utf8', (err, data) => {
            const lines = data.split(/\r?\n/);
            for (let line of lines) {
                if (line.indexOf("import") != -1) {
                    line = line.replace(/\//g, "\\");
                    let ds = line.split("\\");
                    ds = ds.splice(1, ds.length - 2)
                    for (let char of ds) {
                        if (char != bundle && isBundle(char)) {
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
                await new Promise((callfunc) => {
                    fs.readFile(dir, 'utf8', (err, data) => {
                        let obj = JSON.parse(data)
                        if (obj.uuid) {
                            map[obj.uuid] = {
                                path: path.join(path.dirname(dir) , path.basename(dir,".meta")),
                                obj: obj,
                                bundle: bundle,
                            }
                        }
                        let name = path.basename(dir).split(".")[0];
                        if (obj.subMetas[name] && obj.subMetas[name].uuid) {
                            map[obj.subMetas[name].uuid] = {
                                path: path.join(path.dirname(dir) , path.basename(dir,".meta")),
                                obj: obj,
                                bundle: bundle,
                            }
                        }
                        callfunc();
                    })
                })
            }
        }
        callfunc(map)
    })
}

var checkPrefabByMap = async function (prefabList, resMap) {
    return new Promise(async(endcall)=>{
        for (let bundle in prefabList) {
            for (let prefabPath of prefabList[bundle]) {
                await new Promise((callfunc) => {
                    fs.readFile(prefabPath, 'utf8', (err, data) => {
                        let lines = data.split(/\r?\n/);
                        for (let line of lines) {
                            if (line.indexOf('__uuid__') != -1) {
                                let useUuid = JSON.parse(`{${line}}`)["__uuid__"]
                                if (resMap[useUuid]) {
                                    if (resMap[useUuid].bundle != bundle) {
                                        let obj = `\n"user path": ${prefabPath},\n"asset path": ${resMap[useUuid].path},\n"uuid": ${useUuid}`
                                        Editor.warn("bundle: " + bundle + " use " + resMap[useUuid].bundle + " asset. infomation :", obj);
                                    }
                                }
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
    fs.readdir(ASSETS_Path, async (err, bundleList) => {
        for (let dir of bundleList) {
            if (isBundle(dir)) {
                let list = await getTsList(path.join(ASSETS_Path, dir))
                if (list.length == 0) continue;
                checkTsList(dir, list)
            }
        }
    })
}

/** 检测分包资源引用 */
var checkResources = function () {
    const PPATH = Editor.Project.path;
    const ASSETS_Path = PPATH + '\\assets';
    Editor.log("start check res import .... ")
    fs.readdir(ASSETS_Path, async (err, bundleList) => {
        let prefabAry = {};
        let resAry = {};

        for (let dir of bundleList) {
            if (isBundle(dir)) {
                let list = await getResList(path.join(ASSETS_Path, dir))
                resAry[dir] = list[0];
                prefabAry[dir] = list[1];
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
        'check-bundle:script'() {
            checkScript()
        },
        'check-bundle:res'() {
            checkResources()
        },
    },
};