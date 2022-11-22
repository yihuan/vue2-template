<template>
  <BaseDraggable v-model="list">
    <div v-for="l in list" :key="l.id" class="list-item">
      {{ l.name }}
    </div>
  </BaseDraggable>
</template>

<script setup>
import BaseDraggable from '@/components/common/BaseDraggable.vue'
import { ref } from 'vue'

const list = ref([
  {
    id: 1,
    name: 'Sky'
  },
  {
    id: 2,
    name: 'Tom'
  },
  {
    id: 3,
    name: 'Eve'
  }
])
</script>

<style lang="scss" scoped>
.list-item {
  padding: $base-gap * 2;
  margin: $base-gap * 2;
  cursor: move;
  background-color: #e4e7ed;
}
</style>
