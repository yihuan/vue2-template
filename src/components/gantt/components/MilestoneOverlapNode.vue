<template>
  <div class="milestone-overlap-node">
    <PopoverInfo popper-class="overlap-node-pop" trigger="hover">
      <div class="day-nodes">
        <MilestoneNode
          v-for="m in nodes"
          :key="m.id"
          :object-id="objectId"
          :object-type="objectType"
          :data="m"
          :show-title="showTitle"
        />
      </div>
      <template #reference>
        <div class="node-content" :style="{ left: data.left + 'px' }">
          <template v-if="data.state === MILESTONE_STATE.COMPLETED">
            <i
              class="iconfont icon-icon-28-wanchenglichengbei icon-completed"
            />
            <i
              class="iconfont icon-icon-28-wanchenglichengbei icon-completed"
            />
          </template>
          <template v-else-if="data.state === MILESTONE_STATE.NOT_STARTED">
            <i
              class="iconfont icon-icon-28-weiwanchenglichengbei icon-uncompleted"
            />
            <i
              class="iconfont icon-icon-28-weiwanchenglichengbei icon-uncompleted"
            />
          </template>
          <template v-else>
            <i
              class="iconfont icon-icon-28-wanchenglichengbei icon-completed"
            />
            <i
              class="iconfont icon-icon-28-weiwanchenglichengbei icon-uncompleted"
            />
          </template>
        </div>
      </template>
    </PopoverInfo>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PopoverInfo from '@/components/common/PopoverInfo.vue'
import { MILESTONE_STATE, OBJECT_TYPE } from '@/constants/gantt.const'
import MilestoneNode from '@/components/gantt/components/MilestoneNode.vue'

const props = defineProps({
  objectId: {
    type: Number,
    required: true
  },
  objectType: {
    type: Number,
    required: true,
    validator: (value) => Object.values(OBJECT_TYPE).includes(value)
  },
  /**
   * {
   *  state: Number;
   *  left: Number;
   *  nodes: Array[Node];
   *  multiple: Boolean; // not useful here
   * }
   * Node:
   * {
   *  id: Number;
   *  status: Number;
   *  title: String;
   *  endDate: String;
   *  left: Number;
   * }
   */
  data: {
    type: Object,
    required: true
  },
  showTitle: {
    type: Boolean
  }
})

const nodes = computed(() => {
  // Do not need left for overlapped nodes as its postion is changed to static
  return props.data.nodes.map((node) => ({
    id: node.id,
    status: node.status,
    title: node.title,
    endDate: node.endDate
  }))
})
</script>

<style lang="scss" scoped>
.milestone-overlap-node {
  display: flex;
  align-items: center;
  position: relative;

  .node-content {
    display: flex;
    align-items: center;
    position: absolute;
    top: 0;
    bottom: 0;
    cursor: pointer;

    & > i:last-child {
      margin-left: $base-gap * -6;
    }

    .iconfont {
      font-size: 32px;

      &.icon-completed {
        color: $primary-color;
      }

      &.icon-uncompleted {
        color: $font-hint-color;
      }
    }
  }
}
</style>

<style lang="scss">
.overlap-node-pop {
  min-width: 100px;

  &.popover-info.el-popper[x-placement^='bottom'] {
    margin-top: $base-gap * -4;
  }

  .day-nodes {
    padding: $base-gap;
    display: flex;
    align-items: center;

    .milestone-node {
      .node-content {
        position: static;
      }
    }
  }
}
</style>
