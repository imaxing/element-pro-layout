<template>
  <div id="app" style="height: 100vh">
    <pro-layout
      :fixed-header="false"
      menu-active="/material/supplierpro"
      logo="https://tva1.sinaimg.cn/large/008i3skNgy1gz8i4tglttj308207z749.jpg"
      :collapsed.sync="collapsed"
      :theme.sync="theme"
      :menus="menus"
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
        path: '/material/category'
      }
    ]
  },
  {
    meta: { icon: 'el-icon-s-tools', title: '供应商产品管理' },
    name: '供应商产品管理',
    path: '/material/supplierpro'
  },
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
  },
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
export default {
  name: 'App',
  data: () => ({
    collapsed: false,
    theme: '#D7C3C3',
    menus
  })
}
</script>
