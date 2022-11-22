# 开发相关规范及文档

## 项目文件组织结构及命名规范

- assets
  静态资源文件
  - styles 样式文件
    - var.less 样式常量定义，会自动引入直接使用。命名规范：以`$`开头，多个字母以`-`分隔。

- components
  组件文件夹，包含所有 views 页面用到的组件，根据业务逻辑区分，比如 `common` 存放项目中公用的组件，其他比如可以根据模块及业务区分，比如 bug 相关，创建一个 bug 文件夹。
  Vue SFC 组件命名规范参考[这里](https://v2.vuejs.org/v2/style-guide/?redirect=true#Multi-word-component-names-essential)
- constants
  一些固定常量的定义，比如当前项目相关的一些公用常量会放到 `app.const.js` 中，文件命名规则是 `xx.const.js`
  xx 为业务或逻辑区分的命名。
- docs
  项目相关的一些文档
- request
  API 请求相关
  - modules 请求相关模块，命名规范：`user.api.js`
  - api.js 定义接口 URL
- router
  路由相关
  - index.js 路由定义及初始化
  - router.user.js 兼容 Compositon API 的路由使用方式（Deprecated）
  > **注**：`vue-router` 3.6.0 开始支持 composables，使用方式如下：

  ```js
  import { useRoute, useRouter } from 'vue-router/composables'
  const route = useRoute()
  const router = useRouter()
  ```

- stores
  状态管理相关，当前项目中使用 `Pinia`。使用方法见：[Pinia 用法示例](./pinia.md)
- uses
  (Vue3 相关) Composable 方法相关，函数命名规范: `useXxx`，文件命名规范：`xxx.use.js`。
  详情参考 [Composables](https://vuejs.org/guide/reusability/composables.html)
- utils
  一些工具类方法，比如防抖、节流等会放在 `app.util.js` 中。文件命名规范：`xx.util.js`。
- views
  页面组件，router 中定义的路由可访问的页面
  - components 当前路由对应页面相关组件

  Vue SFC 组件命名规范参考[这里](https://v2.vuejs.org/v2/style-guide/?redirect=true#Multi-word-component-names-essential)

Vue 相关规范参考[这里](https://v2.vuejs.org/v2/style-guide/)

## 开发工具

推荐使用 [Visual Studio Code](https://code.visualstudio.com/download)

Vue 开发相关插件推荐：

项目中使用 `ESLint` 和 `Prettier` 进行语法和格式规范校验，安装相应插件可及时查看错误信息，安装 `Prettier` 后建议打开 IDE (Visual Studio Code) 的保存自动格式化功能，会自动修正格式问题（Settings -> Editor: Format On Save）。
如果打开这个设置后还不生效，就在文件上点右键，选择’`格式化文档...`‘，在弹框中选择 `Prettier` 为默认格式化选项。

- [Auto Close Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag)

- [Auto Import](https://marketplace.visualstudio.com/items?itemName=steoates.autoimport)

- [Auto Rename Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag)

- [Babel JavaScript](https://marketplace.visualstudio.com/items?itemName=mgmcdermott.vscode-language-babel)

- (必装)[EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

- (必装)[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

- [JavaScript(ES6) code snippets](https://marketplace.visualstudio.com/items?itemName=xabikos.JavaScriptSnippets)

- [Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)

- (必装)[Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

- [Split HTML Attributes (Vue, React, Angular)](https://marketplace.visualstudio.com/items?itemName=dannyconnell.split-html-attributes)

- [Template String Converter](https://marketplace.visualstudio.com/items?itemName=meganrogge.template-string-converter)

- (必装)[vue](https://marketplace.visualstudio.com/items?itemName=jcbuisson.vue)

- (必装)[Vue Language Features (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
