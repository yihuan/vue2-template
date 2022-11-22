<template>
  <el-tooltip
    :placement="placement"
    :effect="effect"
    :content="content"
    :disabled="disabled"
  >
    <template #content>
      <slot name="content" />
    </template>
    <slot />
  </el-tooltip>
</template>

<script setup>
defineProps({
  placement: {
    type: String,
    default: 'top'
  },
  effect: {
    type: String,
    default: 'dark'
  },
  content: String,
  disabled: Boolean
})
</script>

<style lang="scss" scoped></style>
