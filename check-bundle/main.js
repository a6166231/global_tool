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

var checkBundle = async function () {
    const PPATH = Editor.Project.path
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

module.exports = {
    load() {

    },

    unload() {

    },

    messages: {
        'checkBundle:check'() {
            checkBundle()
        }
    },
};