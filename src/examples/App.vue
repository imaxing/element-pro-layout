<template>
  <div id="app" style="height: 100vh">
    <pro-layout
      title="SRM"
      :menu-active="menuActive"
      :collapsed.sync="collapsed"
      :loading="loading"
      :theme="theme"
      :theme-reverse="colorReverse(theme)"
      :menus="menus"
      :render-collapse-button="h => h('i', { class: 'el-icon-menu' })"
      :right-icons="[
        {
          render: h =>
            h('el-color-picker', {
              props: { value: theme, size: 'mini' },
              on: { change: onThemeChange }
            })
        },
        {
          title: '通知',
          icon: 'el-icon-bell',
          count: 10,
          popperOptions: {
            width: 350,
            children: h => h('h1', '123')
          }
        },
        { title: '全屏', icon: 'el-icon-full-screen' },
        { title: '反馈', icon: 'iconfont icon-feedback' },
        {
          title: '多语言',
          icon: 'iconfont icon-language',
          dropdownOptions: {
            onCommand: v => this.$emit('opt-change', v),
            data: languages
          }
        },
        {
          icon: 'el-icon-user',
          render: h =>
            h('img', {
              style: 'max-width: 30px',
              attrs: { src: 'https://tva1.sinaimg.cn/large/e6c9d24egy1gzpuhh1kk1j20u00u0q44.jpg' }
            }),
          dropdownOptions: {
            onCommand: v => this.$emit('opt-change', v),
            data: [
              { label: '首页', path: '/' },
              { label: '个人中心', path: '/profile', condition: Math.random() * 10 > 5 }
            ]
          }
        }
      ]"
    >
      <el-button type="primary">
        hello world
      </el-button>
    </pro-layout>
  </div>
</template>

<script>
const menus = [
  {
    meta: { icon: 'el-icon-eleme', title: '品类管理' },
    name: '品类管理',
    path: '/material/category',
    children: [
      {
        meta: { icon: 'el-icon-check', title: '品管' },
        path: '/material/a',
        children: [
          {
            meta: { icon: 'el-icon-check', title: '品管' },
            path: '/material/b',
            children: [
              {
                meta: { icon: 'el-icon-check', title: '品管' },
                path: '/material/c'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    meta: { icon: 'el-icon-s-tools', title: '供应商产品管理' },
    name: '供应商产品管理',
    path: '/material/supplierpro'
  }
]
import Fullscreen from '@iamgx/fullscreen'
import modifyTheme from '@iamgx/element-ui-theme-set'
import colorReverse from '@iamgx/color-reverse'
import loadStyle from '@iamgx/load-style'
const { toggle } = Fullscreen
export default {
  name: 'App',
  data: () => ({
    collapsed: false,
    loading: false,
    theme: '#20222a',
    menuActive: '/material/a',
    menus: [],
    languages: [
      { label: '中文', value: 'ch', disabled: true },
      { label: '英文', value: 'en' }
    ]
  }),
  mounted() {
    loadStyle('https://at.alicdn.com/t/font_3206016_nq7r8gbdo8s.css')
    this.onThemeChange(this.theme)
    this.loading = true
    setTimeout(() => {
      this.menus = menus
      this.loading = false
    }, 4000)
  },
  methods: {
    colorReverse,
    toggle,
    onThemeChange(theme) {
      this.theme = theme
      modifyTheme({
        elementUiCdn: 'https://cdn.jsdelivr.net/npm/element-ui@2.15.6/lib/theme-chalk/index.css',
        theme,
        themeName: '--primary-theme'
      })
    }
  }
}
</script>
