import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import { createPinia, PiniaVuePlugin } from 'pinia'

import router from './router'

import ElementUI from 'element-ui'
import filters from './filters'

import './assets/styles/reset.scss'
import './assets/styles/base.scss'

Vue.config.productionTip = false
Vue.config.devtools = process.env.NODE_ENV !== 'production' ? true : false
// eslint-disable-next-line
Vue.config.errorHandler = function (err, vm, info) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line
    console.error('Error:', err)
  }
}

Vue.use(ElementUI)
Vue.use(filters)

const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace

VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err)
}
VueRouter.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch((err) => err)
}

const pinia = createPinia()
Vue.use(PiniaVuePlugin)

new Vue({
  router,
  pinia,
  render: (h) => h(App)
}).$mount('#app')
