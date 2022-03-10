# global_tool
## check-bundle ##
- 找出当前项目互相引用分包的脚本
- 找出当前项目分包之间资源的互相引用

## bitmapfont ##
- 修改cocos扩展商店上的bitmapfont位图字体工具  （自用
   - [x] 保存图片文件时路径报错
   - [ ] 增加导出图片POT设置
   - [ ] 增加导出图片自动调整尺寸设置
## wwwtool ##  
- 多项目需求打包场景下，引用当前项目路径gulp自动化流程  

## textureUnpacker ##
- plist图集文件拆分插件，可以操作当前项目下的plist/指定的plist

**插件保存到任意路径下 ，创建  _软链接_  到cocos全局插件路径下，同样可以加载插件**

windows
>mklink ~/User/.CocosCreator/packages/wwwtool ~/wwwtool  

mac
>ln -s ~/wwwtool ~/User/.CocosCreator/packages/wwwtool  

