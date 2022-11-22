<template>
  <div class="component-demos">
    <div class="demo-navs">
      <router-link to="/demo/draggable">Draggable Demo</router-link>
    </div>
    <router-view />
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.component-demos {
  height: 100%;
  padding: $base-gap * 2;

  .demo-navs {
    width: 100%;
    margin: $base-gap * 5 0;

    a:not(:last-child) {
      margin-right: $base-gap * 2;
    }
  }
}
</style>
