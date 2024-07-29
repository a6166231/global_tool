# 图片的相似查找

使用cocos creator 3.x版本开发的插件，想做到的程度是通过截图功能，然后从项目资源中查找相似图片并展示或跳转
---

目前的方式是：

- 1.生成特征库：提前处理项目中所有纹理的特征信息，并生成唯一的hash值做主键保存，如果纹理发生了变化则hash值变化，就重新生成一次特征信息

- 2.生成截图特征：通过截图时生成的新纹理，生成对应特征，对某些特征占比非常小的直接丢弃 目前是0.1

- 3.查找：目前只通过特征的是否相同来进行检索，即可能会出现完全不搭嘎的两张图，因为他俩的某一个特征可能相同

使用到的node库：
``` typescript
import * as tf from '@tensorflow/tfjs';
//模型
import * as mobilenet from '@tensorflow-models/mobilenet';

//md5
import fs from 'fs';
import crypto from 'crypto';
const hash = crypto.createHash('md5');
const stream = fs.createReadStream(filePath);
stream.on('data', (chunk) => {
    hash.update(chunk);
});
stream.on('end', () => {
    resolve(hash.digest('hex'));
});
```

todo:

- 1.训练自定义的模型，而不是使用tensorflow-models/mobilenet，对于项目中的绝大多数资源还是通过特征向量之间的余弦相似度来对比

- 2.平替其他的已经训练好的模型，目前的cocos creator的插件系统是通过electron实现的，使用的版本非常低，很多的node第三方库无法被正确导入，导致无法使用

- 3.没有实现出来自己想做出来的程度，暂时这样了，后面的资源跳转、预览等功能先割了
