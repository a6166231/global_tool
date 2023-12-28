# global_tool

依赖于cocos creator编辑器实现的插件

  >npm install  //使用前都需要在对应文件夹下初始化依赖


## tree ##

- 基于ccc的节点树预览插件功能做的扩展功能

  - 指定节点搜索功能
  - 快速选择节点功能（类似于h5的节点检查，鼠标移入节点区域内即高亮显示，并快速定位）
  - 引擎逻辑暂停（方便于 _快速选择节点功能_ ，节点树频繁刷新的界面里可以暂停选择 ）

## mvc ##

- 基于mvc模板生成对应的mvc子类、零件、预制体

   - 提前预览输出类的内容
   - 链接指定类作为类型声明（按项目框架增加各模块的泛型）
   - 同名（大小写）类 _禁止输出_ 、已经存在的输出路径 _警告_
   - 解析和服务器交互消息方法（方法参数类型有则保留、导入，没有则推断）
   - 对应注入全局消息类、初始化代理类等文件

<a id='tsc'></a>

## tsc ##

- 使用node的typescript库编译项目中的ts文件，检测项目中ts的文件报错问题

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
  - [ ] 2.x版本插件升到3.x

## wwwtool ##  

- 多项目需求打包场景下，引用当前项目路径gulp自动化流程  

## textureUnpacker ##

- plist图集文件拆分插件，可以操作当前项目下的plist/指定的plist

**插件保存到任意路径下 ，创建  _目录链接_  到cocos全局插件路径下，同样可以加载插件**

_ccc 3.8.x之后引擎的加载流程改动，不再支持软链_

windows
>mklink /J ~/User/.CocosCreator/packages/wwwtool ~/wwwtool  

mac
>ln -s ~/wwwtool ~/User/.CocosCreator/packages/wwwtool  
