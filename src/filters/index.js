import date from './date.filter'

export default {
  install(Vue) {
    Vue.filter('date', date)
  }
}
