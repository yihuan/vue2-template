# 快速上手 Vue3 语法

为方便后端同学快速上手新语法，添加 Vue3 跟 Vue2 对应语法示例

## SFC 文件声明

### Vue2

```js
<script>
export default {}
</script>
```

### Vue3

```js
// 使用 setup script（建议）
<script setup>
</script>
```

```js
// 使用 setup 方法
<script>
export default {
  setup() {}
}
</script>
```

## 引入组件

### Vue2

```html
<template>
  <HelloWorld />
</template>
```

```js
<script>
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  components: { HelloWorld } // 需要通过 `components` 注册才能使用
}
</script>
```

### Vue3 (setup script)

```html
<template>
  <HelloWorld />
</template>
```

```js
<script setup>
// 引入后可直接使用
import HelloWorld from '@/components/HelloWorld.vue'
</script>
```

- Vue3 setup 方法

```html
<template>
  <HelloWorld />
</template>
```

```js
<script>
import HelloWorld from '@/components/HelloWorld.vue'
export default {
  components: { HelloWorld },
  setup() {}
}
</script>
```

## 使用路由及 Store

### Vue2

```html
<template>
  <HelloWorld />
</template>
```

```js
<script>
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  components: { HelloWorld } // 需要通过 `components` 注册才能使用
  created() {
    // 获取路由参数
    const query = this.$route.query
    const params = this.$route.params

    // 获取 store 的值（以前使用的 Vuex）
    const user = this.$store.state.user
  },
  methods: {
    goTo() {
      // 跳转路由
      this.$router.push({ name: 'hello-world' })
    },
    updateStoreValue() {
      // 更新 store 的值
      this.$store.commit('updateUser', user)
    }
  },
}
</script>
```

### Vue3 (setup script)

```html
<template>
  <HelloWorld />
</template>
```

[Pinia使用方法](./pinia.md)

```js
<script setup>
// 引入后可直接使用
import HelloWorld from '@/components/HelloWorld.vue'
//import { useRouter, useRoute } from '@/router/router.use' // 以后不用了
import { useRouter, useRoute } from 'vue-router/composables'
import { useUserStore } from '@/stores/user.store'

// 获取路由对象
const router = useRouter()
const route = useRoute

// 获取 store 对象（现在使用的 Pinia，操作及创建 store 更方便，使用方法见上面链接）
const userStore = useUserStore()

const user = userStore.user

// 获取路由参数
const query = route.query


function goTo() {
  // 路由跳转
  router.push({ name: 'HelloWorld' })
}

// 更新 store 的值
function updateStoreValue() {
  userStore.user = { name: 'Sky' }
}

</script>
```

## 变量及方法定义

### Vue2

```html
<template>
  <span>{{ user.name }}</span>
</template>
```

```js
<script>
export default {
  // 数据必须定义到 data 里
  data() {
    return {
      user: {
        name: '',
        gender: '',
        address: ''
      }
    }
  },
  // 方法必须定义到方法里
  methods: {
    hello() {
      console.log('Hello Vue2')
    }
  }
}
</script>
```

### Vue3 (setup script)

```html
<template>
  <span>{{ user.name }}</span>
</template>
```

```js
<script setup>
import { ref } from 'vue'

// 通过 ref 定义，可直接在 template 中使用（ref 需引入）
conse user = ref({ // 由于不是真正 Vue 3 版本，所有变量的响应式原理与 Vue 2 相同，还得这么定义
  name: '',
  gender: '',
  address: ''
})
// 唯一要注意的地方是获取值的时候必须要加 .value，但在 template 中不用
console.log('name:', user.value.name)

// 方法可直接定义，然后可以直接在 template 中使用
function hello() {
  console.log('Hello Vue3')
}
</script>
```

## computed & watch

### Vue 2

```html
<template>
  <span>{{ fullName }}</span>
</template>
```

```js
<script>
export default {
  props: {
    title: {
      type: String
    }
  },
  data() {
    return {
      firstName: '',
      lastName: ''
    }
  },
  computed: {
    fullName() {
      return this.firstName + ' ' + this.lastName
    }
  },
  watch: {
    // 监听属性变化
    title: {
      handler(val) {
        console.log('title changed:', val)
      }
    },
    fullName: {
      immediate: true, // 立即执行
      handler(val) {
        conosle.log('fullName changed:', val)
      }
    }
  },
}
</script>
```

### Vue 3 (setup script)

```html
<template>
  <span>{{ fullName }}</span>
</template>
```

```js
<script setup>
import { computed, ref, watch, watchEffect } from 'vue'

const props = defineProps({
  title: {
    type: String
  }
})

const firstName = ref('')
const lastName = ref('')

const fullName = computed(() => firstName.value + ' ' + lastName.value)

// 只有变化时触发
watch(fullName, (val) => {
  console.log('fullName changed:', val)
})

// 监听属性变化
watch(
  () => props.title, // 注意：此处需要回调函数
  (val) => {
    console.log('title changed:', val)
  }
)

// 相当于 Vue2 中 watch 的 immediate 参数为 true
watchEffect(() => {
  // 注意：computed 返回会 ref 类型，所以获取数据必须加 .value
  console.log('fullName changed:', fullName.value)
})
</script>
```

## 属性、事件及slot定义和使用

### Vue2

```html
<template>
  <slot name="title"></slot>
</template>
```

```js
<script>
export default {
  // props 属性中定义组件属性
  props: {
    title: {
      type: String
    }
  },
  methods: {
    hello() {
      // 使用属性
      console.log(this.title)

      // 子组件返回事件
      this.$emit('update')

      // 获取当前组件的 slots
      console.log(this.$slots.title)
    }
  }
}
</script>
```

### Vue3 (setup script)

```html
<template>
  <slot name="title"></slot>
</template>
```

```js
// 使用 setup script
<script setup>
import { useAttrs, useSlots } from 'vue'

// 使用宏命令定义属性，不需要引入
const props = defineProps({
  title: {
    type: String
  }
})
// 定义事件
const emit = defineEmits(['update'])

// 获取 slots
const slots = useSlots() // 需引入
const attrs = useAttrs()
console.log(slots.title)

function hello() {
  // 使用属性
  console.log(props.title)
  // 子组件返回事件
  emit('update')
}
</scripjiant>
```

## 生命周期

### Vue2

```js
<script>
export default {
  created() {

  },
  mounted() {

  },
  beforeDestroy() {

  },
}
</script>
```

### Vue3 (setup script)

  详情参考[官方文档](https://vuejs.org/api/composition-api-lifecycle.html)

```js
<script setup>
import { onBeforeMount, onMounted onUpdated, ref } from 'vue'
import userApi from '@/request/apis/user.api'

const users = ref([])

// 直接执行相当于是 Vue 2 的 created 方法里
getUsers()

function getUsers() {
  userApi.getUsers().then((res) => {
    users.value = res?.data?.length ? [...res.data] : []
  })
}

onBeforeMount(() => {

})

onMounted(() => {

})

onUpdated(() => {

})
</script>
```
