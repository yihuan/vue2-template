<template>
  <div class="gantt-table-title">
    {{ title }}
  </div>
</template>
<script setup>
const props = defineProps({
  title: {
    type: String
  }
})
</script>
<style lang="scss" scoped>
.gantt-table-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
