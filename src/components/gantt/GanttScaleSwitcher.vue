<template>
  <SecondaryTabMenu v-model="menu" :menus="menus" @change="handleChange" />
</template>

<script setup>
import { ref, watch } from 'vue'
import SecondaryTabMenu from '@/components/common/SecondaryTabMenu.vue'
import { SCALE } from '@/constants/gantt.const'

const props = defineProps({
  value: {
    type: String,
    default: SCALE.DAY
  }
})
const emit = defineEmits(['input', 'change'])

const menu = ref(SCALE.DAY)
const menus = [
  {
    label: '日',
    value: SCALE.DAY
  },
  {
    label: '周',
    value: SCALE.WEEK
  },
  {
    label: '月',
    value: SCALE.MONTH
  }
]

watch(
  () => props.value,
  (val) => {
    menu.value = val
  }
)

function handleChange(event) {
  emit('input', event)
  emit('change', event)
}
</script>

<style lang="scss" scoped></style>
