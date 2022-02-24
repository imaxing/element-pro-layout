import Vue from 'vue'
import App from './App.vue'
import ElementUi from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUi, { size: 'small' })
Vue.config.productionTip = false

import ProLayout from '../packages'
Vue.use(ProLayout)
new Vue({
  render: h => h(App)
}).$mount('#app')
