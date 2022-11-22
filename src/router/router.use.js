/**
 * @Deprecated 以后就不用这个版本了，vue-router 3.6.4 已经支持 composable 方式，如下：
 * `import { useRoute, useRouter } from 'vue-router/composibles`
 *
 * 兼容 Composition API 语法的 router 获取
 */

import { computed, getCurrentInstance, reactive } from 'vue'

export function useRoute() {
  const { proxy } = getCurrentInstance()
  const currentRoute = computed(() => proxy.$route)

  const protoRoute = Object.keys(currentRoute.value).reduce((acc, key) => {
    acc[key] = computed(() => currentRoute.value[key])
    return acc
  }, {})

  return reactive(protoRoute)
}

export function useRouter() {
  const { proxy } = getCurrentInstance()
  return proxy.$router
}
