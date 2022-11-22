<template>
  <div class="gantt-table-title">
    <div class="title-left">
      <div class="icon" :style="{ cursor: editable ? 'pointer' : 'default' }">
        <img :src="typeIcon" />
      </div>
      <div class="title" :style="{ cursor: editable ? 'pointer' : 'default' }">
        <el-input
          v-if="editable"
          v-model="editTitle"
          size="mini"
          @change="handleTitleUpdate"
        ></el-input>
        <BaseTooltip :content="title">
          <span class="title__text ellipsis" @click="handleTitleClick">
            {{ title }}
          </span>
        </BaseTooltip>
      </div>
      <BaseTooltip content="已逾期">
        <img
          v-if="showExpiredIcon && isExpired"
          class="icon-risk"
          :src="riskIcon"
        />
      </BaseTooltip>
    </div>
    <div class="actions">
      <i
        v-if="allowAdd && isParent"
        class="iconfont icon-icon-16-tianjia1 icon-add"
        title="快速创建任务"
        @click="handleAdd"
      />
      <i
        v-if="allowRemove"
        class="iconfont icon-icon-16-shanchu icon-del"
        title="删除任务"
        @click="handleDelete"
      />
    </div>
    <i v-if="props.childrenCount > 0" class="iconfont icon-icon-16-heji1">
      {{ childrenCount }}
    </i>
  </div>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import BaseTooltip from '@/components/common/BaseTooltip.vue'

const typeIcon = require('@/assets/icons/icon-project-plan.webp')
const riskIcon = require('@/assets/icons/icon-type-risk.webp')

const props = defineProps({
  title: {
    type: String
  },
  showExpiredIcon: {
    type: Boolean,
    default: true
  },
  parentId: {
    type: Number,
    default: 0
  },
  allowAdd: {
    type: Boolean,
    default: true
  },
  allowRemove: {
    type: Boolean,
    default: true
  },
  isExpired: Boolean,
  // TODO: ???
  editable: {
    type: Boolean,
    default: false
  },
  // TODO: ???
  childrenCount: {
    type: Number,
    default: 0
  },
  click: {
    type: Function,
    default: () => {}
  },
  update: {
    type: Function,
    default: () => {}
  },
  add: {
    type: Function,
    default: () => {}
  },
  delete: {
    type: Function,
    default: () => {}
  }
})
const emit = defineEmits(['click', 'update'])

const editTitle = ref(props.title)
const isParent = computed(() => props.parentId === 0)

watch(
  () => props.title,
  (title) => {
    editTitle.value = title
  }
)

const handleTitleClick = () => {
  props.click()
  emit('click')
}
const handleTitleUpdate = (event) => {
  if (props.editable) {
    props.update(event)
    emit('update', event)
  }
}

const handleAdd = () => {
  props.add()
}

const handleDelete = () => {
  props.delete()
}
</script>
<style lang="scss" scoped>
$title-width: 170px; // 标题至少12个字符
$icon-size: 16px;

.gantt-table-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    .actions {
      display: block;
    }
  }

  .title-left {
    display: flex;
    align-items: center;
    width: $title-width + $icon-size * 2;

    .icon {
      & > img {
        transform: translateY(3px);
        width: $icon-size;
        height: $icon-size;
      }
    }
    .title {
      color: $font-color;

      :deep(.el-input) {
        max-width: $title-width;
        display: inline-block;
      }

      &__text {
        display: block;
        align-items: center;
        margin-left: 5px;
        max-width: $title-width;
        cursor: pointer;
      }
    }

    .icon-risk {
      width: $icon-size;
      height: $icon-size;
      margin-left: $base-gap * 2;
    }
  }

  .actions {
    padding: 0 $base-gap * 2;
    display: none;

    & > i {
      color: $icon-color-base;
      cursor: pointer;

      &.icon-add {
        font-size: 12px;
        border: 1px solid $icon-color-base;
        border-radius: 50%;
        margin-right: $base-gap * 4;
      }

      &.icon-del {
        font-size: 14px;
      }
    }
  }
}
</style>
