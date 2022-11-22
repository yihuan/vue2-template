<template>
  <el-tooltip class="item" effect="dark" content="点击移除时间" placement="top">
    <i
      :id="`task-${id}-remove`"
      class="iconfont icon-icon-16-shanchu ee_task_remove"
      @click="onRemove"
    ></i>
  </el-tooltip>
</template>
<script>
export default {
  props: {
    id: {
      type: String
    },
    remove: Function
  },
  methods: {
    onRemove() {
      this.remove()
    }
  }
}
</script>
