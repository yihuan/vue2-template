<template>
  <el-dialog
    :custom-class="`base-dialog ${customClass || ''}`"
    :title="title"
    :visible.sync="visible"
    :width="width"
    :top="top"
    :fullscreen="fullscreen"
    :close-on-click-modal="false"
    :destroy-on-close="destroyOnClose"
    :before-close="beforeClose"
    :append-to-body="appendToBody"
    :modal-append-to-body="modalAppendToBody"
    :close-on-press-escape="closeOnPressEscape"
    @open="handleOpen"
    @close="close"
  >
    <template #title>
      <slot name="title" />
    </template>
    <slot />
    <template #footer>
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  value: {
    type: Boolean,
    required: true
  },
  title: String,
  top: {
    type: String,
    default: '15vh'
  },
  destroyOnClose: Boolean,
  customClass: String,
  fullscreen: Boolean,
  appendToBody: Boolean,
  modalAppendToBody: {
    type: Boolean,
    default: true
  },
  width: {
    type: String,
    default: '600px'
  },
  beforeClose: {
    type: Function
  },
  closeOnPressEscape: Boolean,
  bodyPadding: {
    type: String,
    default: '24px 24px 0 24px'
  }
})
const emit = defineEmits(['input', 'open', 'close'])

const visible = ref(false)

watch(
  () => props.value,
  (val) => {
    visible.value = val
  }
)

function handleOpen() {
  emit('open')
}

function close() {
  visible.value = false
  emit('input', false)
  emit('close')
}
</script>

<style lang="scss" scoped>
$close-button-color: #202d41;
$dialog-border-radius: 12px;

:deep(.base-dialog.el-dialog) {
  border-radius: $dialog-border-radius;

  &.is-fullscreen {
    border-radius: 0;

    .el-dialog__header {
      .el-dialog__title {
        color: #202d41;
        margin-left: $base-gap * 19;
        font-size: 16px;
        font-weight: 500;
        line-height: 22px;
        position: relative;

        &::before {
          content: ' ';
          position: absolute;
          display: inline-block;
          width: 1px;
          height: 14px;
          top: 5px;
          left: -13px;
          background-color: #c9cdd4;
        }
      }

      .el-dialog__headerbtn {
        left: 20px;
        right: unset;

        &::after {
          content: '退出';
          font-size: 16px;
          font-weight: 400;
          color: $close-button-color;
          margin-left: $base-gap;
        }

        .el-dialog__close {
          color: $close-button-color;
        }
      }
    }

    .el-dialog__body {
      height: calc(100% - 54px);
      overflow: auto;
      padding: 0;
    }
  }

  .el-dialog__header {
    .el-dialog__title {
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
    }
  }

  .el-dialog__body {
    max-height: 550px;
    padding: v-bind(bodyPadding);
    overflow: auto;
  }
}
</style>
