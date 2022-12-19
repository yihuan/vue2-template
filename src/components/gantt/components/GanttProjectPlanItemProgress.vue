<template>
  <div class="plan-item-progress">
    <div class="title">
      <span>{{ data[prop.name || 'name'] }}</span>
    </div>
    <div class="progress-bars">
      <div class="bar-item">
        <span>需求</span>
        <el-progress
          :percentage="reqPercentage"
          :color="reqColor"
          :format="getReqFormat"
          class="req"
        />
      </div>
      <div class="bar-item">
        <span>任务</span>
        <el-progress
          :percentage="taskPercentage"
          :color="taskColor"
          class="task"
          :format="getTaskFormat"
        />
      </div>
      <div class="bar-item">
        <span>缺陷</span>
        <el-progress
          :percentage="bugPercentage"
          :color="bugColor"
          class="bug"
          :format="getBugFormat"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// 暂时未使用
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      name: '',
      finishedReq: 0,
      finishedTask: 0,
      finishedBug: 0,
      totalReq: 0,
      totalTask: 0,
      totalBug: 0
    })
  },
  prop: {
    type: Object,
    default: () => ({
      name: 'name',
      finishedReq: 'finishedReq',
      finishedTask: 'finishedTask',
      finishedBug: 'finishedBug',
      totalReq: 'totalReq',
      totalTask: 'totalTask',
      totalBug: 'totalBug'
    })
  }
})

const reqColor = '#84adff'
const taskColor = '#2cc085'
const bugColor = '#ffcc99'

const reqPercentage = computed(() => {
  const finished = props.data[props.prop.finishedReq || 'finishedReq']
  const total = props.data[props.prop.totalReq || 'totalReq']
  if (!finished || !total) {
    return 0
  }

  return Number.parseFloat(finished / total).toFixed(2) * 100
})

function getReqFormat() {
  return `${props.data[props.prop.finishedReq || 'finishedReq'] || 0} / ${
    props.data[props.prop.totalReq || 'totalReq'] || 0
  }`
}

const taskPercentage = computed(() => {
  const finished = props.data[props.prop.finishedTask || 'finishedTask']
  const total = props.data[props.prop.totalTask || 'totalTask']
  if (!finished || !total) {
    return 0
  }

  return Number.parseFloat(finished / total).toFixed(2) * 100
})

function getTaskFormat() {
  return `${props.data[props.prop.finishedTask || 'finishedTask'] || 0} / ${
    props.data[props.prop.totalTask || 'totalTask'] || 0
  }`
}

const bugPercentage = computed(() => {
  const finished = props.data[props.prop.finishedBug || 'finishedBug']
  const total = props.data[props.prop.totalBug || 'totalBug']
  if (!finished || !total) {
    return 0
  }

  return Number.parseFloat(finished / total).toFixed(2) * 100
})

function getBugFormat() {
  return `${props.data[props.prop.finishedBug || 'finishedBug'] || 0} / ${
    props.data[props.prop.totalBug || 'totalBug'] || 0
  }`
}
</script>

<style lang="scss" scoped>
.plan-item-progress {
  padding: $base-gap * 3;

  .title {
    margin-bottom: $base-gap * 6;

    & > span {
      color: $font-color;
      font-size: $font-size;
      font-weight: 500;
    }
  }

  .progress-bars {
    .bar-item {
      display: flex;
      align-items: center;
      margin: $base-gap * 3 0;

      & > span {
        flex: 0 0 60px;
        font-weight: 500;
        color: $font-color;
        font-size: $font-size;
      }

      :deep(.el-progress) {
        flex: 1 1 auto;

        &.req {
          .el-progress-bar__outer {
            background-color: #d2e1ff;
          }
        }

        &.task {
          .el-progress-bar__outer {
            background-color: #b8efd5;
          }
        }

        &.bug {
          .el-progress-bar__outer {
            background-color: #ffe4d0;
          }
        }
      }
    }
  }
}
</style>
