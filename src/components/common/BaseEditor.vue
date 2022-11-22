<template>
  <div
    v-loading="loading"
    element-loading-spinner="el-icon-loading"
    class="ee-editor"
  >
    <!-- eslint-disable vue/v-on-event-hyphenation -->
    <Editor
      v-model="content"
      :init="init"
      :plugins="plugins"
      :toolbar="toolbar"
      :disabled="disabled"
      :inline="inline"
      :tag-name="tagName"
      :output-format="outputFormat"
      @onInit="handleInit"
      @onKeyup="handleKeyup"
      @onChange="handleChange"
      @onBlur="handleBlur"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import tinymce from 'tinymce'
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/plugins/link'
import 'tinymce/plugins/table'

const props = defineProps({
  value: {
    type: String
  },
  disabled: {
    type: Boolean
  },
  inline: {
    type: Boolean
  },
  tagName: {
    type: String
  },
  height: {
    type: Number
  },
  menubar: {
    type: Boolean
  },
  outputFormat: {
    type: String,
    default: 'html'
  },
  isFixed: {
    type: String,
    default: ''
  },
  minHeight: {
    type: Number
  },
  maxHeight: {
    type: Number
  },
  projectId: Number,
  workBaseId: Number,
  workBaseType: Number
})

const emit = defineEmits(['input', 'blur', 'keyup', 'change'])

const cdnDomain = 'https://j1.58cdn.com.cn'
const baseUrl = cdnDomain + '/arthurupload/teg/yunxiao/static/tinymce'

const init = {
  menubar: props.menubar,
  branding: false,
  base_url: baseUrl,
  plugins: ['autoresize'],
  max_height: props.maxHeight,
  min_height: props.minHeight
}
const plugins = 'fullscreen lists link image table code wordcount code'
const toolbar = `fullscreen | undo redo | bold italic underline |
    forecolor backcolor | bullist numlist | link | table`

const content = ref('')
const loading = ref(true)

watch(
  () => props.value,
  (value) => {
    content.value = value
  }
)

watch(content, (val) => {
  emit('input', val)
})

onMounted(() => {
  tinymce.init({})
})

const handleInit = () => {
  loading.value = false
}

const handleKeyup = (event) => {
  emit('keyup', event)
}

const handleChange = (event) => {
  emit('change', event)
}

const handleBlur = () => {
  emit('blur')
}
</script>

<style lang="scss">
.tox.tox-silver-sink.tox-tinymce-aux {
  display: none;
}
.ee-editor {
  .tox.tox-tinymce {
    .tox-editor-container {
      .tox-editor-header {
        position: v-bind(isFixed);
        top: 10px;
        .tox-toolbar__primary {
          .tox-toolbar__group:not(:last-of-type) {
            border-right: 1px dashed #ccc;
          }
        }
      }
    }
  }
}
</style>
