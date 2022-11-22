# 云效2.0基座项目

云效2.0基座项目，通过 [`qiankun`](https://qiankun.umijs.org/zh/guide) 加载其他子项目

## 项目启动

### 本地开发

- 包管理工具：yarn（建议，远程打包机器也是用的yarn）
- Node 版本：14.19.2
- 本地安装：`yarn` or `yarn install`
- 本地删除重新安装：`yarn reinstall`
- 本地启动：`yarn start`
- 编译打包：`yarn build`
- Lint：`yarn lint`

### 子应用配置

菜单或页面中需要记载子应用页面的配置

- 在 `app.const.js` 中 `SUB_APPS` 中配置子应用详细信息

  ```js
  // key: 唯一值，区分子应用，路由配置需要
  // domain: 子应用域名
  // shortPath: 短路径名称
  export const SUB_APPS = freeze({
    IWORK: freeze({
      key: 'iwork',
      domain: isProd
        ? `${origin}/fe-yunxiao-iwork2/`                // 远程环境配置
        : 'http://lee.58v5.cn:5801/fe-yunxiao-iwork2/', // 本地配置
      shortPath: 'w'
    })
  }
  ```

- 在路由 `router/index.js` 中配置路由

  ```js
  // router/index.js
  {
    name: 'HomeIwork',
    path: SUB_APPS.IWORK.shortPath,
    component: () => import('@/views/HomeIwork.vue')
  }
  ```

  在需要插入子应用页面的地方引入 `SubAppEntry`

  ```html
  // HomeIwork.vue
  <template>
    <SubAppEntry />
  </template>
  <script setup>
  import SubAppEntry from '@/components/common/SubAppEntry.vue'
  </script>
  ```

  路由页面中指定位置引入子应用可参考[这里](https://qiankun.umijs.org/zh/faq#%E5%A6%82%E4%BD%95%E5%9C%A8%E4%B8%BB%E5%BA%94%E7%94%A8%E7%9A%84%E6%9F%90%E4%B8%AA%E8%B7%AF%E7%94%B1%E9%A1%B5%E9%9D%A2%E5%8A%A0%E8%BD%BD%E5%BE%AE%E5%BA%94%E7%94%A8)

### 后端接口域名配置

`http.js` 中的 `BASE_URL` 定义。

```js
export const BASE_URL = isProd
  ? window.location.origin + '/api-yunxiao-iwork2/'                   // 线上
  : window.location.protocol + '//ee-dev.58v5.cn/api-yunxiao-iwork2/' // 本地
```

### 静态资源更新

一些第三方库及静态资源存放在 [`Arthur`](http://arthurci.58corp.com/) 上，如 `Vue`、`Element UI` 等。云效2.0项目存放文件夹为：`/arthurupload/teg/yunxiao/static`。

#### 项目中引用的静态资源路径

> **注**：如果只有一个文件，直接放在根文件夹下，如果有多个，如 `iconfont`，则新建一个文件夹。

- Vue, VueRouter 等，直接放在根目录下，`/arthurupload/teg/yunxiao/static`。
- `Element UI` 路径：`/arthurupload/teg/yunxiao/static/element-ui`，主题文件：`/arthurupload/teg/yunxiao/static/theme`
- `Iconfont` 图标路径：`/arthurupload/teg/yunxiao/static/iconfont`
- `TineyMCE` 相关资源路径：`/arthurupload/teg/yunxiao/static/tinymce`

#### 更新方式

- 登录 `Arthur`[http://arthurci.58corp.com]
- 最上面菜单选择【上传文件】，左侧【文件上传】菜单
- 文件目录出选择路径，输入：`yunxiao/static` 搜索确定，选择文件点击上传
- 登录【工单系统】[https://order.58corp.com/]，在【申请工单】（左侧菜单）页找到【静态资源（CDN）管理】，选择【静态资源（CDN）刷新】
- 更具要求输入更新后要刷新的完整 CDN 地址，确定后会自动审批处理

## 文档说明

- [开发规范及相关](./docs/dev.md)
- [Vue3 基础语法使用示例](./docs/vue3syntax.md)
- [Vue3 语法快速上手（与 Vue 2 对比用法）](./docs/vue3easystart.md)
- [Pinia 用法示例](./docs/pinia.md)
- [代码提交规范](./docs/commit.md)
- [公用组件](./docs/components.md)
