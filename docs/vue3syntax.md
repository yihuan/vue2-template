# Vue Composition API 用法示例

## 如何使用

### 使用 `<script setup>`

```html
<template>
  <div>
    <HelloWorld ref="hello" msg="Hello" />
    <el-table :data="users" style="width: 100%">
      <el-table-column prop="date" label="日期" width="180" />
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column prop="address" label="地址" />
    </el-table>
  </div>
</template>
```

```js
<script>
// 禁止属性继承，需要单独添加一个 script 块
export default {
  inheritAttrs: false
}
</script>
<script setup>
// 引入组件，可直接使用
import HelloWorld from '@/components/HelloWorld.vue'
import { onMounted, reactive, ref, useAttrs, useSlots } from 'vue'
// 以后不用了
// import { useRouter, useRoute } from '@/router/router.use' // 封装的支持 Composition API 的获取router (this.$router) 方式
import { useRouter, useRoute } from 'vue-router/composables'
import userApi from '@/request/modules/user.api'

const router = useRouter() // 对应 this.$router
const route = useRoute() // 对应 this.$routte

// defineProps, defineEmits 属于宏命令，可直接使用
const props = defineProps({ // 定义属性
  name: {
    type: String
  }
})

const slots = useSlots() // 使用 slots，类似 this.$slots
const attrs = useAttrs() // 使用 attrs，类似 this.$attrs

const hello = ref(null) // 定义 ref
hello.value.focus() // 使用 ref 类型的值
const users = ref([])
// 或者使用 reactie
const state = reactive({ // reactive 只能初始化对象
  users: []
})

const emit = defineEmits(['change', 'submit']) // 定义事件

emit('change') // 触发事件

console.log(props.name) // 使用定义的属性

function getUsers() {
  userApi.getUsers().then(res => {
    users.value = res?.length ? [...res] : []
    // 使用 reactive 则不需要通过 .value 来赋值
    state.users = res?.length ? [...res] : []
  })
}

defineExpose({
  users
})

onMounted(() => { // 页面加载完成，与 Vue2 mounted 类似
  console.log('mounted')
})
</script>
```

### 使用 `setup` 方法

```html
<template>
  <div>
    <HelloWorld ref="hello" msg="Hello" />
    <el-table :data="users" style="width: 100%">
      <el-table-column prop="date" label="日期" width="180" />
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column prop="address" label="地址" />
    </el-table>
  </div>
</template>
```

```js
<script>
import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue'
import HelloWorld from '@/components/HelloWorld.vue'
// import { useRouter, useRoute } from '@/router/router.use' // 以后不用了
import { useRouter, useRoute } from 'vue-router/composables'
import userApi from '@/request/modules/user.api'

// export default {}
export default defineComponent({ // 类型推断及提示
  components: { HelloWorld }, // 引入组件，与 Vue2 类似
  props: { // 定义属性，与 Vue2 类似
    name: {
      type: String
    }
  },
  emits: ['change', 'submit'], // 定义事件
  expose: ['users', 'getUsers'],
  setup(props, { emit, attrs, slots }) { // 或者直接使用 context 对象：setup(props, context)
    const hello = ref(null)
    // const router = useRouter()
    // const route = useRoute()
    const users = ref([])
    const state = reactive({
      users: [],
      // ... 定义其他变量
    })

    console.log(props.name) // 使用定义的属性

    emit('change') // 触发事件
    // context.emit('change') // 使用 context 对象

    function getUsers() {
      userApi.getUsers().then(res => {
        users.value = res?.length ? [...res] : []
        state.users = res?.length ? [...res] : []
      })
    }

    getUsers() // 获取用户列表

    onMounted(() => { // 页面加载完成，与 Vue2 mounted 类似
      console.log('mounted')
    })

    return { // 在此处返回的变量才可以在模板中使用
      hello,
      users, // 用户数据
      ...toRefs(state), // state 中定义的变量可以直接在模板中使用
    }
  }
})
</script>
```
