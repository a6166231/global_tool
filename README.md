# global_tool 

<a id='tsc'></a>
## tsc ## 
- 使用node的typescript库编译项目中的ts文件，检测项目中ts的文件报错问题 

  >npm install -g typescript
   - 输出所有的报错（过滤引擎库：*.d.ts之类的）
   - 输出所有的报错（不过滤引擎库）
   - 打开所有之前报错的ts文件

## check-bundle ##
- ~~找出当前项目互相引用分包的脚本~~（已屏蔽）
- 找出当前项目分包之间资源的互相引用（不考虑分包引用res、resources资源的情况）
   - 检测项目配置分包的互相引用，输出**预制体路径**、**引用资源的节点树**、**资源路径**
- todo
   - ~~[ ] 检测脚本中是否存在报错~~
   - ~~[ ] 脚本缺失引用（引用错误）~~
   - ~~[ ] 脚本是否缺失括号等问题~~
   - 已在<a href="#tsc">tsc</a>插件中实现

## bitmapfont ##
- 修改cocos扩展商店上的bitmapfont位图字体工具  （自用
   - [x] 保存图片文件时路径报错
   
## wwwtool ##  
- 多项目需求打包场景下，引用当前项目路径gulp自动化流程  

## textureUnpacker ##
- plist图集文件拆分插件，可以操作当前项目下的plist/指定的plist

**插件保存到任意路径下 ，创建  _软链接_  到cocos全局插件路径下，同样可以加载插件**

windows
>mklink ~/User/.CocosCreator/packages/wwwtool ~/wwwtool  

mac
>ln -s ~/wwwtool ~/User/.CocosCreator/packages/wwwtool  

