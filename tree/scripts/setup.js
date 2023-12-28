const fse = require('fs-extra');
const path = require('path');

const localTemplatePath = path.join(__dirname, '../release/');
const projectTemplatePath = 'E:/projects/wzmb/creator_client';

if (!fse.existsSync(projectTemplatePath)) {
    console.error('project path not exist');
    return;
}
fse.copy(localTemplatePath, projectTemplatePath).then(() => {
    console.log('更新预览模板成功');
}).catch(err => {
    console.error('更新预览模板失败', err);
});