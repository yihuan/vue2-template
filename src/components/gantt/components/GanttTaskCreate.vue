<template>
  <div class="gantt-create-plan">
    <el-input v-model="input" placeholder="" @input="handleInput" />
    <span class="btn btn-cancel" @click="handleCancel">取消</span>
    <div class="btn btn-create" @click="handleConfirm">
      <span>创建</span>
      <!-- TODO: hidden temporarily-->
      <!-- <i class="iconfont icon-a-icon-16-fuzhi4x" /> -->
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'

const props = defineProps({
  value: String,
  placeholder: {
    type: String,
    default: '请输入'
  },
  confirm: {
    type: Function,
    default: () => {}
  },
  cancel: {
    type: Function,
    default: () => {}
  }
})
const emit = defineEmits(['input', 'cancel', 'confirm'])

const input = ref('')

watchEffect(() => {
  input.value = props.value
})

function handleInput(event) {
  emit('input', event)
}

function handleConfirm() {
  props.confirm(input.value)
  emit('confirm')
}

function handleCancel() {
  props.cancel()
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.gantt-create-plan {
  display: flex;
  align-items: center;
  border: 1px solid $border-color;
  border-radius: $base-border-radius;
  width: 100%;
  height: 44px;
  padding: 0 $base-gap * 3;
  background-color: #fff;

  :deep(.el-input) {
    .el-input__inner {
      border: none;
      padding: 0;
    }
  }

  &:hover {
    border: 1px solid $primary-color;
  }
  .btn {
    cursor: pointer;
    height: 22px;
    line-height: 22px;
    font-size: $font-size;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    color: #45474d;
    display: inline-block;

    &.btn-cancel {
      width: 30px;
    }

    &.btn-create {
      color: $primary-color;
      margin-left: $base-gap * 4;
      display: flex;
      align-items: center;

      & > span {
        width: 30px;
      }

      & > i {
        margin-left: $base-gap;
        font-size: 16px;
        color: $primary-color;
      }
    }
  }
}
</style>
