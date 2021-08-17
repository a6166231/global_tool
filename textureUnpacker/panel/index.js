const {
    EDEADLK
} = require('constants');
const Fs = require('fs');
const path = require('path');
const PlistTool = require("./plistTool.js");

const {
    dialog
} = require('electron').remote;

var template = Fs.readFileSync(__dirname + '\\index.html') + "";
var style = Fs.readFileSync(__dirname + '\\index.css');

//读取项目路径下所有plist文件
let plistFile = PlistTool.getAllPlistFile(path.join(Editor.Project.path, "assets"));

let tempadd = `<select id="plistDiv"><option value="null">选择plist</option>`;
for (let name of plistFile) {
    let ext = path.extname(name);
    tempadd += `
        <option value="${path.basename(name,ext)}">${path.basename(name,ext)}</option>
    `
}
tempadd += `</select>`;
template = template.replace('<div id="plistDiv"></div>', tempadd)

Editor.Panel.extend({
    style: style,
    template: template,
    $: {
        selectDiv: "#select",
        nowPathDiv: "#now",
        plistTexture: "#ptexture",
        choice1: "#choice1",
        choice2: "#choice2",
        plistDiv: "#plistDiv",
        exportBtn1: "#exportBtn1",
        exportBtn2: "#exportBtn2",
    },

    ready() {
        this.addListener();


    },

    addListener() {
        this.$choice1.onclick = this.onChangeRes.bind(this, 1);
        this.$choice2.onclick = this.onChangeRes.bind(this, 2);

        this.$plistDiv.onchange = this.onChangePlist.bind(this);

        this.$exportBtn1.onclick = this.exportCall1.bind(this);
        this.$exportBtn2.onclick = this.exportCall2.bind(this);
    },

    /** 选择其他plist文件 */
    onChangePlist() {
        let index = this.$plistDiv.selectedIndex;
        this.$plistTexture.style = index == 0 ? "display:none;" : "display:block;";
        this.$exportBtn1.style = index == 0 ? "visibility: hidden;" : "visibility: visible;";
        this.selectPlistPath = null;

        if (index == 0) return;

        let plist = plistFile[index - 1];
        plist = plist.replace(/\//g, "\\");
        let pngpath = path.dirname(plist) + `\\${this.$plistDiv.options[index].value}.png`;

        this.$plistTexture.innerHTML = `<div>
            <img id="plistImg" src="${pngpath}" alt="loading..." board="3px" ></img>
        </div>`;

        this.selectPlistPath = plist;
    },

    onChangeRes(id) {
        this.$selectDiv.style = id == 1 ? "display:none;" : "display:block;"
        this.$nowPathDiv.style = id == 2 ? "display:none;" : "display:block;"
    },

    exportCall1() {
        if (!this.selectPlistPath) return;
        this.selectFolder((dirpath) => {
            PlistTool.unpack(this.selectPlistPath, dirpath);
        })
    },
    exportCall2() {

    },

    selectFolder(func) {
        //showSaveDialog(): Promise
        dialog.showSaveDialog({
            properties: ['openDirectory', ]
        }).then((result) => {
            func(result.filePath);
        });
    },
});