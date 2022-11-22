# How to use Pinia

Pinia's [official documentation](https://pinia.vuejs.org/introduction.html)

## Defining a Store

```js
// app.store.js
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => {
    return {
      name: '',
      counter: 0
    }
  },
  getters: {
    doubleCounter(state) {
      return state.counter * 2
    }
  }
})
```

## Use Store

- Options API
  官方文档参考[这里](https://pinia.vuejs.org/cookbook/options-api.html)

  ```js
  import { useAppStore } from '@/stores/app.store'
  import { mapState, mapWritableState, mapActions } from 'pinia' // 使用 mapState

  const store = useAppStore()

  export default {
    computed: {
      // 可以通过 this.name 来访访问
      // 与通过 store 直接访问类似：store.name
      ...mapState(useAppStore, ['name']),
      // 与上面类似，但可以通过 this.myOwnName 来访问
      ...mapState(useAppStore, {
        myOwnName: 'counter',
        // 还可以自定义一个方法来访问 store
        // double: (store) => store.counter * 2
        double: (store) => store.doubleCounter
      }),
      // 允许通过 this.counter++ 来修改值
      // 与 store.counter 类似
      ...mapWritableState(useAppStore, ['counter'])
      // same as above but registers it as this.myOwnName
      ...mapWritableState(useAppStore, {
        myOwnName: 'counter',
      }),
      // 可通过 this.increment() 调用
      ...mapActions(useAppStore, ['increment'])
    },
    mounted() {
      // 与 watch 的区别是调用 $patch 后只触发一次
      store.$subscribe((mutation, state) => {
        mutation.type // MutationType from 'pinia'
        mutation.storeId // main
        mutation.payload // patch object passed to cartStore.$patch()

        localStorage.setItem('main', JSON.stringify(state))
      })
    },
    methods: {
      updateValue() {
        // 除了通过 store.counter 更新值，还可以通过调用 $patch 方法，通过调用 $patch 方法可以同时更新多个值
        store.$patch({
          counter: store.counter + 1,
          name: 'Sky2'
        })

        store.$patch((state) => {
          state.items.push({ name: 'shoes', quantity: 1 })
          state.hasChanged = true
        })
      }
    },
  }
  ```

  > 提示
  > 不需要 `mapWritableState()` 来操作集合类型，比如数组，除非你想用 `arr = []` 替换整个数组，`mapState()` 允许调用集合上的所有方法

- Composition API
  - 访问 state，可以直接通过 store 进行操作

    ```js
    const store = useAppStore()
    store.name = 'Sky'
    ```

  - 重置 state 到初始值

    ```js
    const store = useAppStore()
    store.$reset()

    store.$patch({
      counter: store.counter + 1,
      name: 'Sky2'
    })

    store.$patch((state) => {
      state.items.push({ name: 'shoes', quantity: 1 })
      state.hasChanged = true
    })
    ```

  - 订阅 state 变化

    ```js
    // 与 watch 的区别是调用 $patch 后只触发一次
    store.$subscribe((mutation, state) => {
      mutation.type // MutationType from 'pinia'
      mutation.storeId // main
      mutation.payload // patch object passed to cartStore.$patch()

      localStorage.setItem('main', JSON.stringify(state))
    })
    ```
