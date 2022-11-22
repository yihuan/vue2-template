<template>
  <el-table
    v-loading="loading"
    class="base-table"
    :data="tableData"
    :height="height"
    :max-height="maxHeight"
    :stripe="stripe"
    :border="border"
    :show-header="showHeader"
    :row-class-name="rowClassName"
    :row-key="rowKey"
    @cell-mouse-enter="handleCellMouseEnter"
    @cell-mouse-leave="handleCellMouseLeave"
  >
    <template #empty>
      <slot name="empty">
        <span class="no-data">
          <img :src="noDataImg" />
          <span>暂无数据</span>
        </span>
      </slot>
    </template>
    <el-table-column
      v-for="c in tableColumns"
      :key="c.key"
      :label="c.name"
      :width="c.width"
      :min-width="c.minWidth"
      :show-overflow-tooltip="c.tooltip"
      :align="c.align || 'left'"
    >
      <template slot="header" slot-scope="scope">
        <template v-if="c.headerSlot">
          <slot :name="`${c.key}Header`" :scope="scope" />
        </template>
        <template v-else>
          {{ c.name }}
        </template>
      </template>
      <template slot-scope="scope">
        <template v-if="c.key === 'sortable'">
          <i
            :style="{
              visibility: showDragButton(scope.$index) ? 'visible' : 'hidden'
            }"
            class="iconfont icon-icon-24-yidong icon-move"
            :class="[canDrag ? '' : 'disabled']"
          />
        </template>
        <template v-else-if="!!c.slot">
          <slot :name="c.slot" :scope="scope"></slot>
          <span
            v-show="c.showActions && scope.row.showButtons"
            class="btn-actions"
          >
            <slot :name="`${c.key}Actions`" :scope="scope">
              <i
                class="iconfont icon-icon-16-bianji"
                @click="handleSettings(scope.row)"
              ></i>
              <i
                class="iconfont icon-icon-16-shanchu"
                @click="handleDel(scope.row)"
              ></i>
            </slot>
          </span>
        </template>
        <template v-else>
          <div class="ellipsis">{{ scope.row[c.key] || '--' }}</div>
          <span
            v-show="c.showActions && scope.row.showButtons"
            class="btn-actions"
          >
            <slot :name="`${c.key}Actions`" :scope="scope">
              <i
                class="iconfont icon-icon-16-bianji"
                @click="handleSettings(scope.row)"
              ></i>
              <i
                class="iconfont icon-icon-16-shanchu"
                @click="handleDel(scope.row)"
              ></i>
            </slot>
          </span>
        </template>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { computed, ref, watchEffect, nextTick } from 'vue'
import noDataImg from '@/assets/images/no-data.png'
import Sortable from 'sortablejs'

const props = defineProps({
  loading: {
    type: Boolean
  },
  columns: {
    type: Array,
    default: () => []
  },
  data: {
    type: Array
  },
  draggable: {
    type: Boolean
  },
  canDrag: {
    type: Boolean,
    default: true
  },
  notDraggableIndices: {
    type: Array,
    default: () => []
  },
  height: {
    type: [String, Number]
  },
  maxHeight: {
    type: [String, Number]
  },
  stripe: {
    type: Boolean
  },
  border: {
    type: Boolean
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  rowClassName: {
    type: [Function, String]
  },
  rowKey: {
    type: [Function, String]
  }
})
const emit = defineEmits([
  'setting',
  'del',
  'cell-mouse-enter',
  'cell-mouse-leave',
  'drag-update'
])

const list = ref(props.data)

const showButtons = computed(() => !!props.columns.find((x) => x.showActions))
const tableColumns = computed(() => {
  return props.draggable
    ? [
        {
          name: '',
          key: 'sortable',
          width: '30px'
        }
      ].concat(props.columns)
    : props.columns
})
const tableData = computed(() => {
  return showButtons.value
    ? props.data?.map((x) => ({ ...x, showButtons: false }))
    : props.data
})
const draggableSelectors = computed(() => {
  return new Array(props.data.length)
    .fill(1)
    .reduce((ret, curr, index) => {
      if (showDragButton(index)) {
        ret += `, .el-table__row:nth-child(${index + 1})`
      }
      return ret
    }, '')
    ?.substring(1)
})

watchEffect(() => {
  if (draggableSelectors.value.length && props.canDrag) {
    list.value = [...props.data]

    nextTick(() => {
      dragNDrop()
    })
  }
})

function dragNDrop() {
  const tbody = document.querySelector('.base-table .el-table__body tbody')
  Sortable.create(tbody, {
    group: {
      name: 'field',
      pull: true,
      put: true
    },
    animation: 150,
    easing: 'cubic-bezier(1, 0, 0, 1)',
    draggable: draggableSelectors.value,
    onEnd: ({ oldIndex, newIndex }) => {
      if (oldIndex !== newIndex) {
        const targetRow = list.value.splice(oldIndex, 1)[0]
        list.value.splice(newIndex, 0, targetRow)
        emit('drag-update', [...list.value])
      }
    }
  })
}

function showDragButton(index) {
  return props.draggable && !props.notDraggableIndices.includes(index)
}

function handleCellMouseEnter(row) {
  row.showButtons = true
  emit('cell-mouse-enter', row)
}

function handleCellMouseLeave(row) {
  row.showButtons = false
  emit('cell-mouse-leave', row)
}

function handleSettings(row) {
  emit('cell-setting', row)
}

function handleDel(row) {
  emit('cell-del', row)
}
</script>

<style lang="scss">
.base-table.el-table {
  .sortable-ghost {
    opacity: 0.7;
    box-shadow: 3px 5px 5px 1px #c7c7c9;
  }

  .sortable-drag {
    opacity: 0;
  }

  .el-table__body-wrapper {
    .el-table__empty-block {
      .no-data {
        display: flex;
        flex-direction: column;
        align-items: center;

        img {
          width: 131px;
          height: auto;
        }

        span {
          color: #1d2129;
          font-size: 14px;
          height: 22px;
          line-height: 22px;
        }
      }
    }

    .el-table__row {
      td.el-table__cell {
        border-bottom: none;

        .cell {
          min-height: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-right: $base-gap * 10;

          a {
            text-decoration: none;
            color: $font-color;
          }

          .icon-move {
            font-size: 18px;
            cursor: move;
            color: $icon-color-base;
            margin-right: $base-gap * 2;
          }

          .btn-actions {
            display: flex;

            i {
              margin: 0 $base-gap * 2;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
}
</style>
