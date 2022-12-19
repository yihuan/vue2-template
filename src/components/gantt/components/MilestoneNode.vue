<template>
  <div class="milestone-node">
    <PopoverInfo
      :key="data.id"
      popper-class="milestone-info"
      trigger="hover"
      @show="handleShow(data.id)"
    >
      <template #title>
        <div class="info-title">
          <i
            :class="[
              'iconfont',
              isCompleted(milestone.status)
                ? 'icon-icon-28-wanchenglichengbei'
                : 'icon-icon-28-weiwanchenglichengbei'
            ]"
          />
          <span class="info-title__text">
            {{ stateMap[milestone.status] }}
          </span>
        </div>
      </template>
      <el-form
        ref="form"
        v-loading="detailLoading"
        :model="milestone"
        :rules="milestoneRules"
        class="ee-form"
        label-width="80px"
        label-position="left"
      >
        <el-form-item label="名称" prop="title">
          <div
            v-if="!editFlag.title"
            :title="milestone.title"
            class="item-title ellipsis"
            :class="{ pointer: !disabled && !isCompleted(milestone.status) }"
            @click="handleEdit('title', milestone.status)"
          >
            {{ milestone.title }}
          </div>
          <el-input
            v-else
            :ref="(el) => (refs.title = el)"
            v-model="milestone.title"
            size="mini"
            maxlength="50"
            placeholder="请输入名称"
            @blur="handleBlur('title')"
          />
        </el-form-item>
        <el-form-item label="预计完成" prop="planEndDate">
          <span
            v-if="!editFlag.planEndDate"
            :class="{ pointer: !disabled && !isCompleted(milestone.status) }"
            @click="handleEdit('planEndDate', milestone.status)"
          >
            {{ milestone.planEndDate }}
          </span>
          <el-date-picker
            v-else
            :ref="(el) => (refs.planEndDate = el)"
            v-model="milestone.planEndDate"
            placeholder="请选择日期"
            type="datetime"
            size="mini"
            :value-format="dateFormat"
            @blur="handleBlur('planEndDate')"
          />
        </el-form-item>
        <el-form-item v-if="isCompleted(milestone.status)" label="实际完成">
          {{ milestone.realEndDate }}
        </el-form-item>
        <el-form-item label="描述" class="info-desc">
          <div
            v-if="!editFlag.description"
            class="item-desc"
            :class="{ pointer: !disabled && !isCompleted(milestone.status) }"
            :title="milestone.description"
            @click="handleEdit('description', milestone.status)"
          >
            {{ milestone.description || '&nbsp;' }}
          </div>
          <el-input
            v-else
            :ref="(el) => (refs.description = el)"
            v-model="milestone.description"
            placeholder="请输入描述"
            type="textarea"
            :rows="4"
            :maxlength="150"
            @blur="handleBlur('description')"
          />
        </el-form-item>
        <el-form-item class="info-buttons">
          <el-button
            size="mini"
            :disabled="disabled"
            @click="handleDel(data.id)"
          >
            删除
          </el-button>
          <el-button
            v-if="!isCompleted(milestone.status)"
            type="primary"
            size="mini"
            :disabled="disabled"
            @click="handleShowCompleteDialog(data.id)"
          >
            完成该里程碑
          </el-button>
        </el-form-item>
      </el-form>
      <template #reference>
        <div class="node-content" :style="nodeStyle">
          <i
            :class="[
              'iconfont',
              isCompleted(data.status)
                ? 'icon-icon-28-wanchenglichengbei icon-finished'
                : 'icon-icon-28-weiwanchenglichengbei icon-unfinished'
            ]"
          />
          <span v-if="showTitle" class="node-text">{{ data.title }}</span>
        </div>
      </template>
    </PopoverInfo>
    <BaseDialog
      v-model="completeDialogVisible"
      title="完成里程碑"
      body-padding="0 24px 0 24px"
      width="550px"
    >
      <el-form
        ref="updateRef"
        :model="updateForm"
        class="ee-form"
        size="mini"
        label-width="120px"
        label-position="left"
        :rules="updateRules"
      >
        <el-form-item label="实际完成时间" prop="realEndDate">
          <el-date-picker
            v-model="updateForm.realEndDate"
            type="datetime"
            :value-format="dateFormat"
            placeholder="请选择日期"
          />
        </el-form-item>
        <el-form-item>
          <div style="text-align: right">
            <el-button @click="completeDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              :loading="completeLoading"
              @click="handleComplete"
            >
              完成
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </BaseDialog>
  </div>
</template>

<script setup>
import { reactive, ref, nextTick, computed } from 'vue'
import { MILESTONE_STATE } from '@/constants/gantt.const'
import PopoverInfo from '@/components/common/PopoverInfo.vue'
import { confirm } from '@/utils/message.util'
import BaseDialog from '@/components/common/BaseDialog.vue'
import Message from 'element-ui/lib/message'
import { OBJECT_TYPE } from '@/constants/gantt.const'
import { useMilestone } from '@/hooks/useMilestone'

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
  /** {
   *  id: Number;
   *  status: Number; // MILESTONE_STATE in gantt.const.js
   *  title: String;
   *  endDate: String;
   *  left: Number; // Distance to left
   * }
   */
  data: {
    type: Object,
    required: true,
    default: () => ({})
  },
  disabled: Boolean,
  showTitle: {
    type: Boolean
  },
  updateMilestone: {
    type: Function,
    default: () => {}
  }
})
const emit = defineEmits(['milestone-update'])

const stateMap = {
  [MILESTONE_STATE.NOT_STARTED]: '未完成',
  [MILESTONE_STATE.COMPLETED]: '已完成'
}
const dateFormat = 'yyyy-MM-dd HH:mm:ss'

const {
  getMilestoneDetail,
  updateMilestone,
  deleteMilestone,
  completeMilestone
} = useMilestone(props.objectId, props.objectType)

const nodeStyle = computed(() => {
  return props.data.left ? { left: props.data.left + 'px' } : { left: 0 }
})

const milestone = ref({
  title: '',
  description: '',
  planEndDate: '',
  realEndDate: '',
  status: 1
})
const milestoneRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  planEndDate: [
    { required: true, message: '请选择计划结束时间', trigger: 'blur' }
  ]
}
const completeDialogVisible = ref(false)
const completeLoading = ref(false)
const updateForm = reactive({
  id: 0,
  realEndDate: ''
})
const updateRef = ref(null)
const updateRules = {
  realEndDate: {
    required: true,
    message: '请选择完成日期',
    trigger: ['change', 'blur']
  }
}
const editFlag = reactive({
  title: false,
  planEndDate: false,
  description: false
})
const editableProps = reactive({
  title: '',
  planEndDate: '',
  description: ''
})
const form = ref(null)
const refs = reactive({
  title: ref(null),
  planEndDate: ref(null),
  description: ref(null)
})
const detailLoading = ref(false)

function isCompleted(state) {
  return state === MILESTONE_STATE.COMPLETED
}

function handleShow(id) {
  detailLoading.value = true
  getMilestoneDetail(id)
    .then((res) => {
      const data = res?.data
      if (data) {
        milestone.value = { ...milestone.value, ...data }
        Object.keys(editableProps).forEach((key) => {
          editableProps[key] = data[key]
        })
      }
    })
    .finally(() => {
      detailLoading.value = false
    })
}

function handleEdit(key, state) {
  if (props.disabled || isCompleted(state)) return

  editFlag[key] = true
  nextTick(() => {
    refs[key].focus()
  })
}

function handleBlur(key) {
  const current = milestone.value
  if (editableProps[key] === current[key]) {
    editFlag[key] = false
    return
  }

  form.value.validate((valid) => {
    if (valid) {
      updateMilestone(milestone.value).then(() => {
        Message.success('更新成功')
        editFlag[key] = false
        emit('milestone-update')
        props.updateMilestone()
      })
    }
  })
}

function handleDel(id) {
  confirm('确认删除')
    .then(() => {
      deleteMilestone(id).then(() => {
        Message.success('删除成功')
        emit('milestone-update')
        props.updateMilestone()
      })
    })
    .catch(() => {})
}

function handleShowCompleteDialog(id) {
  completeDialogVisible.value = true
  updateForm.id = id
}

function handleComplete() {
  updateRef.value.validate((valid) => {
    if (valid) {
      completeLoading.value = true
      completeMilestone(updateForm)
        .then(() => {
          emit('milestone-update')
          props.updateMilestone()
          completeDialogVisible.value = false
        })
        .finally(() => {
          completeLoading.value = false
        })
    }
  })
}
</script>

<style lang="scss" scoped>
.milestone-node {
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

    .iconfont {
      font-size: 32px;
    }

    .icon-finished {
      color: $primary-color;
    }

    .icon-unfinished {
      color: $font-hint-color;
    }

    .node-text {
      color: $font-color;
      font-size: 12px;
      font-weight: 400;
      margin-left: $base-gap * 2;
    }
  }
}
</style>

<style lang="scss">
$item-width: 180px;

.milestone-info {
  color: $font-color;
  padding: $base-gap * 4;

  .info-title {
    display: flex;
    align-items: center;

    .iconfont {
      font-size: 25px;
      color: $font-hint-color;
      margin-right: $base-gap;
      margin-left: $base-gap * -1;
    }

    .icon-icon-28-wanchenglichengbei {
      color: $primary-color;
    }

    &__text {
      font-size: 14px;
      font-weight: 500;
    }
  }

  .el-form {
    .el-form-item {
      margin-bottom: 0;

      &.info-buttons {
        margin-top: $base-gap * 2;
      }

      &.info-desc {
        .el-form-item__label {
          line-height: 20px;
        }
      }

      .el-form-item__content {
        text-align: right;

        .item-title {
          max-width: $item-width;
        }

        .item-desc {
          width: $item-width;
          line-height: 1.2;
          text-align: left;
          @include ellipsis-line(4);
        }
      }
    }
  }
}
</style>
