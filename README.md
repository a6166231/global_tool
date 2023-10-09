# global_tool

依赖于cocos creator编辑器实现的插件

## mvc ##

- 基于mvc模板生成对应的mvc子类、零件

   - 提前预览输出类的内容
   - 链接指定类作为类型声明
   - 同名（大小写）类 _禁止输出_ 、已经存在的输出路径 _警告_
   - 解析和服务器交互消息方法
      - todo 补全方法部分
         - 参数
         - 返回
         - 类型
         - 注释


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
   - 3.7.x 不再支持全局插件

**插件保存到任意路径下 ，创建  _目录链接_  到cocos全局插件路径下，同样可以加载插件**

windows
>mklink /J ~/User/.CocosCreator/packages/wwwtool ~/wwwtool  

mac
>ln -s ~/wwwtool ~/User/.CocosCreator/packages/wwwtool  
