<template>
  <EeSelect
    v-model="selected"
    class="project-plan-states"
    :width="60"
    :filterable="false"
    :multiple="false"
    :disabled="disabled"
    :options="options"
    @change="handleChange"
    @popover-visible="handleVisible"
  >
    <template #reference>
      <div class="label" :style="labelStyle" @click="handleClick">
        <span>{{ state.label }}</span>
      </div>
    </template>
  </EeSelect>
</template>

<script setup>
import { reactive, computed, watchEffect, ref } from 'vue'
import EeSelect from '@/components/common/EeSelect.vue'

const props = defineProps({
  value: {
    type: Number
  },
  options: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean
  },
  change: {
    type: Function,
    default: () => {}
  }
})
const emit = defineEmits(['input', 'change'])

const state = reactive({
  isEdit: false,
  color: '',
  bgColor: '',
  label: '--',
  value: 0
})
const selected = ref()

const labelStyle = computed(() => ({
  color: state.color,
  backgroundColor: state.bgColor
}))

watchEffect(() => {
  if (props.value) {
    const s = props.options.find((x) => x.value === props.value)
    state.label = s?.label || '--'
    state.color = s?.color || ''
    state.bgColor = s?.bgColor || ''
    selected.value = props.value
  }
})

function handleClick() {
  state.isEdit = true
}

function handleChange(event) {
  const s = props.options.find((x) => x.value == event)
  state.color = s.color
  state.bgColor = s.bgColor
  state.label = s.label
  state.isEdit = false

  // emit while value changes
  if (event != props.value) {
    props.change(s.value)
    emit('input', s.value)
    emit('change', s.value)
  }
}

function handleVisible(visible) {
  state.isEdit = visible
}
</script>

<style lang="scss" scoped>
.project-plan-states {
  .label {
    width: 60px;
    height: 24px;
    line-height: 22px;
    cursor: pointer;
    border-radius: $base-border-radius;
    padding: 0 $base-gap * 3;

    & > span {
      font-size: 12px;
      font-weight: 400;
    }
  }
}
</style>
