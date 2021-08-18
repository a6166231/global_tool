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
        plistTexture1: "#ptexture1",
        plistTexture2: "#ptexture2",
        choice1: "#choice1",
        choice2: "#choice2",
        plistDiv: "#plistDiv",
        exportBtn1: "#exportBtn1",
        exportBtn2: "#exportBtn2",
        selectFrame: "#selectFrame",
        tips: "#tips",
    },

    ready() {
        this.addListener();
    },

    addListener() {
        this.$choice1.onclick = this.onChangeRes.bind(this, 1);
        this.$choice2.onclick = this.onChangeRes.bind(this, 2);

        this.$exportBtn1.onclick = this.exportCall.bind(this);
        this.$exportBtn2.onclick = this.exportCall.bind(this);

        this.$plistDiv.onchange = this.onChangePlist.bind(this);

        this.$selectFrame.ondragenter = this.dragenter.bind(this);
        this.$selectFrame.ondragover = this.dragover.bind(this);
        this.$selectFrame.ondrop = this.drop.bind(this);
        this.$selectFrame.onclick = this.selectPlist.bind(this);
    },

    dragenter(event) {
        event.preventDefault();
        event.stopPropagation();
    },
    dragover(event) {
        event.preventDefault();
        event.stopPropagation();
    },
    drop(event) {
        event.preventDefault();
        event.stopPropagation();
        let dt = event.dataTransfer;
        let file = dt.files;
        if (file[0]) {
            let blob = file[0];
            // let url = URL.createObjectURL(blob)
            // Editor.log(url)
            var reader = new FileReader();
            Editor.log(reader)
            reader.onload = (() => {
                Editor.log(reader.result)
            })
            reader.readAsDataURL(blob);
        }
    },

    selectPlist() {
        let plistpath = this.selectFile();
        if (plistpath) {
            this.$tips.style = "display: none;";
            this.$exportBtn2.style = "visibility: visible;";
            this.showPng(String(plistpath), this.$plistTexture2);
        }
    },

    showPng(plistpath, div) {
        let pngpath = plistpath.substring(0, plistpath.lastIndexOf(".")) + ".png"

        let flag = Fs.existsSync(pngpath);
        if (flag) {
            div.innerHTML = `<div>
                    <img src="${pngpath}" alt="图片文件不存在" board="3px" ></img>
                </div>`;
            this.selectPlistPath = plistpath;
        } else {
            Editor.error("png文件不存在！-", pngpath)
        }
    },


    /** 选择其他plist文件 */
    onChangePlist() {
        let index = this.$plistDiv.selectedIndex;
        this.$plistTexture1.style = index == 0 ? "display:none;" : "display:block;";
        this.$exportBtn1.style = index == 0 ? "visibility: hidden;" : "visibility: visible;";
        this.selectPlistPath = null;

        if (index == 0) return;

        let plistpath = plistFile[index - 1];
        plistpath = plistpath.replace(/\//g, "\\");
        this.showPng(plistpath, this.$plistTexture1);
    },

    onChangeRes(id) {
        this.selectPlistPath = null;

        this.$exportBtn1.style = "visibility: hidden;";
        this.$exportBtn2.style = "visibility: hidden;";

        this.$tips.style = "display: block;";

        this.$plistTexture1.innerHTML = ``;
        this.$plistTexture2.innerHTML = ``;

        this.$selectDiv.style = id == 1 ? "display:none;" : "display:block;"
        this.$nowPathDiv.style = id == 2 ? "display:none;" : "display:block;"
    },

    exportCall() {
        if (!this.selectPlistPath) return;
        let dirpath = this.selectFolder();
        PlistTool.unpack(this.selectPlistPath, dirpath);
    },

    selectFile() {
        let filePath = dialog.showOpenDialogSync({
            filters: [{
                name: 'plist',
                extensions: ['plist']
            }],
            properties: ['openFile', ],
        })
        return filePath;
    },

    selectFolder() {
        let filePath = dialog.showSaveDialogSync({
            properties: ['openDirectory', ]
        })
        return filePath;
    },
});