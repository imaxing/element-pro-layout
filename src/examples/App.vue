<template>
  <div id="app" style="height: 100vh">
    <pro-layout
      logo="https://tva1.sinaimg.cn/large/008i3skNgy1gz8i4tglttj308207z749.jpg"
      element-ui-cdn="https://cdn.jsdelivr.net/npm/element-ui@2.15.6/lib/theme-chalk/index.css"
      :menu-active.sync="menuActive"
      :collapsed.sync="collapsed"
      :theme.sync="theme"
      title="SRM"
      :menus="menus"
      :languages="languages"
      :top-menus="topMenus"
      :notice-count="11"
      :right-icons="[
        {
          onClick: onIconClicked,
          render: h => h('el-badge', { props: { value: 10 } }, [h('i', { class: 'iconfont icon-feedback' })])
        },
        {
          title: '通知',
          icon: 'el-icon-bell',
          count: 10,
          popperProps: { width: 350 },
          popperChildren: h => h('h1', '123')
        }
      ]"
      @top-menu-click="onTopMenuClicked"
    >
      <p v-for="item in 20" :key="item">
        <el-button type="primary">
          hello world
        </el-button>
      </p>
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
        path: '/material/a'
      }
    ]
  },
  {
    meta: { icon: 'el-icon-s-tools', title: '供应商产品管理' },
    name: '供应商产品管理',
    path: '/material/supplierpro'
  }
]

const systemApps = [
  {
    meta: { icon: 'el-icon-s-goods', title: '供应商新品管理' },
    name: '供应商新品管理',
    path: '/material/newpro'
  },
  {
    meta: { icon: 'el-icon-s-data', title: '物料新品申请' },
    name: '物料新品申请',
    path: '/material/apply'
  },
  {
    meta: { icon: 'el-icon-date', title: '物料主数据' },
    name: '物料主数据',
    path: '/material/info'
  }
]

const apps = [
  {
    meta: { icon: 'el-icon-folder', title: '物料变更申请' },
    name: '物料变更申请',
    path: '/material/updapply'
  },
  {
    meta: { icon: 'el-icon-monitor', title: '价格申请' },
    name: '价格申请',
    path: '/material/priceapply'
  },
  {
    meta: { icon: 'el-icon-reading', title: '价格主数据' },
    name: '价格主数据',
    path: '/material/price'
  }
]

const topMenus = [
  {
    icon: 'el-icon-folder',
    text: '我的应用'
  },
  {
    icon: 'el-icon-monitor',
    text: 'OA系统'
  },
  {
    meta: { icon: 'el-icon-reading', title: '价格主数据' },
    icon: 'el-icon-reading',
    text: '系统配置'
  }
]

export default {
  name: 'App',
  data: () => ({
    collapsed: false,
    theme: '#20222a',
    menuActive: '/material/a',
    menus,
    topMenus,
    languages: [
      { label: '中文', value: 'ch', disabled: true },
      { label: '英文', value: 'en' }
    ]
  }),
  methods: {
    onIconClicked() {
      console.log('icon click')
    },
    onTopMenuClicked(menu, index) {
      this.menus = [menus, systemApps, apps][index]
    }
  }
}
</script>
