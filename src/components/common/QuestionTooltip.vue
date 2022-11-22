<template>
  <el-tooltip :placement="placement" :effect="effect">
    <template #content>
      <slot />
    </template>
    <i class="iconfont icon-bangzhu"></i>
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
    default: 'light'
  }
})
</script>

<style lang="scss" scoped></style>
