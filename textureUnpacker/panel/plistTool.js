const Fs = require('fs');
const path = require('path');

const plist = require('plist');
const sharp = require('sharp');

const getIntArray = function (str) {
    return str.replace(/[^\-?(0-9)]+/ig, ' ').trim().split(' ').map((s) => {
        return parseInt(s);
    });
};

/**
 * 
 * @param {*} frame 数据格式
 * @param {*} format plist文件的数据类型标识
 * @returns 
 */
const parseFrame = function (frame, format) {
    let frameInfo = {};
    if (format == 1 || format == 2) {
        frameInfo.rotated = frame.rotated;
        frameInfo.frame = getIntArray(frame.frame);
        frameInfo.offset = getIntArray(frame.offset);
        frameInfo.sourceSize = getIntArray(frame.sourceSize);
    } else if (format == 3) {
        frameInfo.rotated = frame.textureRotated;
        frameInfo.frame = getIntArray(frame.textureRect);
        frameInfo.offset = getIntArray(frame.spriteOffset);
        frameInfo.sourceSize = getIntArray(frame.spriteSourceSize);
    }
    //add
    else if (format == 0) {
        frameInfo.rotated = false;
        frameInfo.frame = getIntArray(`{{${frame.x},${frame.y}},{${frame.width},${frame.height}}}`);
        frameInfo.offset = getIntArray(`{${frame.offsetX},${frame.offsetY}}`);
        frameInfo.sourceSize = getIntArray(`{${frame.originalWidth},${frame.originalHeight}}`);
    } else {
        Editor.error();
        ('sprite frame format is not support.');
    }
    return frameInfo;
};

module.exports = {
    getAllPlistFile(dirpath) {
        let ary = [];

        function findPlist(dpath) {
            let files = Fs.readdirSync(dpath);
            for (let filename of files) {
                let filedir = dpath + "/" + filename;
                let stat = Fs.statSync(filedir);
                if (stat.isDirectory()) {
                    findPlist(filedir)
                    continue;
                }
                if (stat.isFile() && path.extname(filedir) === '.plist') {
                    ary.push(filedir);
                }
            }
        }
        findPlist(dirpath);
        return ary;
    },
    unpack(plistPath, outputDir) {
        if (outputDir == null) {
            outputDir = plistPath.substring(0, plistPath.lastIndexOf('.'));
        }
        if (Fs.existsSync(outputDir) == false) {
            Fs.mkdirSync(outputDir);
        }
        plistPath = path.resolve(plistPath);
        let fileContent = Fs.readFileSync(plistPath, 'utf-8');
        let parsedFile = plist.parse(fileContent);
        let frames = parsedFile.frames;
        let metadata = parsedFile.metadata;

        let format = metadata.format;
        //图片路径使用绝对路径
        let imgPath = path.dirname(plistPath) + "/" + metadata.textureFileName;

        for (let frameName in frames) {
            let frame = frames[frameName];
            let frameInfo = parseFrame(frame, format);
            if (!frameInfo.frame) continue;
            let imgSharp = sharp(imgPath);
            let [left, top, width, height] = frameInfo.frame;
            if (frameInfo.rotated) {
                let t = width;
                width = height;
                height = t;
            }

            //根据配置文件读取图片素材坐标大小
            imgSharp = imgSharp.extract({
                left: left,
                top: top,
                width: width,
                height: height
            });

            //读取文件流
            imgSharp.raw()
                .toBuffer()
                .then((data) => {
                    //buffer数据转成uint8数组矩阵
                    const pixelArray = new Uint8ClampedArray(data);
                    let png = sharp(pixelArray, {
                            raw: {
                                width: width,
                                height: height,
                                channels: 4
                            }
                        })
                        .png()
                    //像素矩阵先生成  再旋转
                    if (frameInfo.rotated) {
                        png = png.rotate(-90);
                    }
                    png.toFile(`${outputDir}/${frameName}`);
                })
        }
    }
}