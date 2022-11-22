<template>
  <draggable v-model="list" v-bind="options" @end="handleEnd">
    <transition-group type="transition" name="flip-list">
      <slot />
    </transition-group>
    <template #header>
      <slot name="header" />
    </template>
    <template #footer>
      <slot name="footer" />
    </template>
  </draggable>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'
import draggable from 'vuedraggable'
import cloneDeep from 'lodash/cloneDeep'

const props = defineProps({
  value: {
    type: Array,
    default: () => []
  },
  group: {
    type: String,
    default: 'sortable'
  },
  editable: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['input'])

const list = ref([])
const options = computed(() => {
  return {
    animation: 150,
    group: props.group,
    disabled: !props.editable,
    ghostClass: 'ghost'
  }
})

watchEffect(() => {
  list.value = props.value
})

const handleEnd = () => {
  emit('input', cloneDeep(list.value))
}
</script>

<style lang="scss" scoped>
:deep(.flip-list-move) {
  transition: transform 0.5s;
}

:deep(.ghost) {
  opacity: 0.7;
  box-shadow: 3px 5px 5px 1px #c7c7c9;
}

:deep(.sortable-drag) {
  opacity: 0;
}
</style>
