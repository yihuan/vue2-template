<template>
  <el-drawer
    custom-class="ee-base__drawer"
    :visible.sync="visible"
    :direction="direction"
    :destroy-on-close="true"
    :show-close="showClose"
    :wrapper-closable="wrapperClosable"
    :modal="modal"
    :size="size"
    :before-close="beforeClose"
  >
    <template #title>
      <slot name="title"></slot>
    </template>
    <slot></slot>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </el-drawer>
</template>
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  direction: String,
  modal: Boolean,
  showClose: Boolean,
  wrapperClosable: Boolean,
  size: {
    type: String,
    default: '600px'
  },
  beforeClose: {
    type: Function,
    default: () => {}
  }
})

const visible = ref(false)
watch(
  () => props.visible,
  (val) => {
    visible.value = val
  }
)
</script>
