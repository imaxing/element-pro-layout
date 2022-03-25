# pro layout


> ProLayout 可以提供一个标准又不失灵活的中后台标准布局，同时提供一键切换布局形态，自动生成菜单等功能。与 PageContainer 配合使用可以自动生成面包屑，页面标题，并且提供低成本方案接入页脚工具栏。   - ant-pro-layout
> 
> 在我个人开发管理后台的过程中有多套系统拆分的需求, 将公共的layout模块拆分单独出来方便系统之间同步功能
> 注意: 此包没有实现ant-pro-layout的所有功能, 目前供公司内部使用中... 欢迎pr

## 安装

```
npm i @iamgx/pro-layout
```

## 使用

``` javascript
import ProLayout from '@iamgx/pro-layout'
Vue.use(ProLayout)
```

```html
<pro-layout
  logo="https://tva1.sinaimg.cn/large/008i3skNgy1gz8i4tglttj308207z749.jpg"
  :menu-active="$route.path"
  :collapsed.sync="collapsed"
  :theme.sync="theme"
  :menus="menus"
  :languages="languages"
  :top-menus="topMenus"
  router
  @top-menu-click="onTopMenuClicked"
>
  <router-view />
</pro-layout>
```


## 配置

* 参数传递时使用驼峰写法
contentTransition,
     
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| menus | 侧边栏菜单数据 | array | [] |
| logo | 侧边栏顶部Logo | string | - |
| title | 侧边栏顶部标题 | string | Pro Layout |
| sideBarWidth | 侧边栏宽度 | string | Pro Layout |
| collapsed | 侧边栏是否展开 | boolean | false |
| uniqueOpened | 菜单是否只打开单个 | boolean | true |
| mobile | 当前是否是手机尺寸 支持.sync修饰符 | boolean | false |
| theme | Layout 主题色 | string | 十六进制颜色值 |
| themeReverse | Layout 主题翻转色 | string | 十六进制颜色值 |
| loading | 侧边栏加载数据时展示loading | boolean | false |
| menuActive | 命中菜单 | string | - |
| menuActiveText | 命中菜单文字颜色 | string | #fafafa |
| topIcons | header左侧横向菜单展示 | array | [] |
| rightIcons | header右侧横向菜单展示 | array | [] |
| renderContent | 自定义渲染内容区域 | function | null-|
| renderHeaderBottom | 自定义渲染header底部区域 | function | - |
| renderHeaderLeft | 自定义渲染header左侧区域 | function | - |
| renderHeaderCenter | 自定义渲染header中级区域 | function | - |
| renderSidebarHeader | 自定义渲染侧边栏顶部区域 | function | - |
| renderHeaderRight | 自定义渲染header右侧区域 | function | - |
| renderCollapseButton | 自定义渲染toggle button | function | - |

## live demo

[![Edit pro-layout-example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/pro-layout-example-jmvbhr?fontsize=14&hidenavigation=1&theme=dark&file=/src/App.vue)

## 其他工具

* [quick-el-modal](https://github.com/imaxing/quick-el-modal)
* [quick-el-drawer](https://github.com/imaxing/quick-el-drawer)
* [quick-modal\(an-design-vue版本\)](https://github.com/imaxing/quick-modal)
* [quick-drawer\(an-design-vue版本\)](https://github.com/imaxing/quick-modal)