# global_tool

依赖于cocos creator编辑器实现的插件

  >npm install  //使用前都需要在对应文件夹下初始化依赖


## <a href='https://github.com/a6166231/global_tool/tree/main/tree'>tree</a> ##

- 基于ccc的节点树预览插件功能做的扩展功能

  - 指定节点搜索功能
  - 快速选择节点功能（类似于web浏览器debug功能里的节点检查，鼠标移入节点区域内即高亮显示，并快速定位）
  - 节点拖动功能
  - 引擎逻辑暂停（方便于 _快速选择节点功能_ ，节点树频繁刷新的界面里可以暂停选择 ）
  - 通过vscode打开节点挂载的script 文件
  - 通过cc editor打开节点的prefab预制体文件，并置cc editor为前台
  - ts代码的热加载，配合插件<a href='https://github.com/a6166231/global_tool/tree/main/notice_extends'>notice_extends</a>的消息处理实现（半成品，无法投入生产环境）
    - 在vscode端代码保存后，切到preview端，会发消息通知cc editor端编译ts代码
    - ts代码编译结束后，返回本次编译后变化的所有的文件列表（增、删、改）
    - 对更新后的ts文件中的所有export对象重新import
    - <font color="#FF0000">如果被更新的ts文件里的export对象在其他文件中被引用过，热加载后的就刷新不到该引用的</font>

    todo:

        [ ] restart之后手动将注册的所有类重新导入一次（应该可以解决被被引用过的无法刷新的问题，但是流程就变了）


## <a href='https://github.com/a6166231/global_tool/tree/main/notice_extends'>notice_extends</a> ##

在cc editor中的自定义消息的扩展

   - open-prefab: 通过传入的资源的uuid来打开cc editor的资源文件
   - open-script: 通过传入的scirpt文件的相对路径，使用vscode来打开指定文件
   - refresh-scripts: 对于文件监听系统中发生变化的script文件进行编译，并在编译后返回所有的变化的文件列表

## <a href='https://github.com/a6166231/global_tool/tree/main/mvc'>mvc</a> ##

- 基于mvc模板生成对应的mvc子类、零件、预制体、资源文件

   - 提前预览输出类的内容
   - 预览即将导入的资源，可选择性的进行剔除
   - 链接指定类作为类型声明（按项目框架增加各模块的泛型）
   - 同名（大小写）类 _禁止输出_ 、已经存在的输出路径 _警告_
   - 解析和服务器交互消息方法（方法参数类型有则保留、导入，没有则推断）
   - 对应注入全局消息类、初始化代理类等文件

<a id='tsc'></a>

## <a href='https://github.com/a6166231/global_tool/tree/main/tsc'>tsc</a> ##

- 使用node的typescript库编译项目中的ts文件，检测项目中ts的文件报错问题

  - 输出所有的报错（过滤引擎库：*.d.ts之类的）
  - 输出所有的报错（不过滤引擎库）
  - 打开所有之前报错的ts文件

## <a href='https://github.com/a6166231/global_tool/tree/main/check-bundle'>check-bundle</a> ##

- ~~找出当前项目互相引用分包的脚本~~（已屏蔽）
- 找出当前项目分包之间资源的互相引用（不考虑分包引用res、resources资源的情况）
  - 检测项目配置分包的互相引用，输出**预制体路径**、**引用资源的节点树**、**资源路径**
- todo
  - ~~[ ] 检测脚本中是否存在报错~~
  - ~~[ ] 脚本缺失引用（引用错误）~~
  - ~~[ ] 脚本是否缺失括号等问题~~
  - 已在<a href="#tsc">tsc</a>插件中实现

## <a href='https://github.com/a6166231/global_tool/tree/main/bitmapfont'>bitmapfont</a> ##

- 修改cocos扩展商店上的bitmapfont位图字体工具  （自用
  - [x] 保存图片文件时路径报错
  - [x] 2.x版本插件升到3.x <a href='https://github.com/a6166231/global_tool/tree/main/bmfont3'>链接</a>

## wwwtool ##  

- 多项目需求打包场景下，引用当前项目路径gulp自动化流程  

## textureUnpacker ##

- plist图集文件拆分插件，可以操作当前项目下的plist/指定的plist


## <a href='https://github.com/a6166231/global_tool/tree/main/img_finder'>img_finder</a>

对ai大模型的尝试, 试图通过图片识别来快速查找项目里的资源或者直接拆分示意图生成prefab

  - 识图的部分需要进行项目资源的针对训练，目前识别出的是用的别人训练好的大模型，跟项目无关
  - 项目资源需要人力去进行标记
  - 不同的项目需要在每次资源发生变化的时候重新训练并同步模型


**插件保存到任意路径下 ，创建  _目录链接_  到cocos全局插件路径下，同样可以加载插件**

_ccc 3.8.x之后引擎的加载流程改动，不再支持软链链接单个插件，所以直接把extensions路径作为软链链接_

windows
>mklink /D ~/User/.CocosCreator/packages/wwwtool ~/wwwtool  

mac
>ln -s ~/wwwtool ~/User/.CocosCreator/packages/wwwtool  
