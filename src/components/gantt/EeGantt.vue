<template>
  <div class="ee-gantt">
    <div
      id="ganttContainer"
      ref="ganttContainer"
      v-loading="ganttLoading"
      class="ee_gantt_container"
      :style="{ height: height + 'px' }"
    />
    <div class="btt" @click="handleToToday">
      <i
        v-show="showIcon"
        class="iconfont icon-icon-12-xialajiantou btt-icon__left"
      />
      <span class="btt-text">回到今天</span>
      <i
        v-show="!showIcon"
        class="iconfont icon-icon-12-xialajiantou btt-icon__right"
      />
    </div>
  </div>
</template>

<script setup>
import Vue, {
  nextTick,
  watch,
  onMounted,
  onUnmounted,
  ref,
  watchEffect,
  computed
} from 'vue'
import { gantt } from 'dhtmlx-gantt'
import has from 'lodash/has'
import GanttComponent from './components'
import { STATE_PROJECT_PLAN } from '@/constants/project.const'
import {
  SCALE,
  SIZE,
  COLUMN_TYPE,
  DRAG_MODE,
  DRAG_DIRECTION,
  SORT,
  CUSTOM_CLASS,
  OBJECT_TYPE,
  TIME_UNIT
} from '@/constants/gantt.const'
import { Message } from '@/utils/message.util'
import { formatDate, isAfter, get } from '@/utils/date.util'
import { UNIT } from '@/constants/date.const'

const props = defineProps({
  loading: Boolean,
  height: Number,
  startDate: {
    type: Date,
    default: () => new Date(2021, 0, 1)
  },
  endDate: {
    type: Date,
    default: () => new Date(2025, 12, 31)
  },
  columns: {
    type: Array,
    default: () => []
  },
  tasks: {
    type: Array,
    default: () => []
  },
  /**
   * objectId and objectType are required if milestone is needed
   */
  objectId: Number,
  objectType: {
    type: Number,
    validator: (value) => Object.values(OBJECT_TYPE).includes(value)
  },
  /**
   * 甘特图列表状态列数据
   * 格式：
   * [
   *  {
   *    label: String;
   *    value: String|Number;
   *    color: String;
   *    bgColor: String;
   *  }
   * ]
   */
  states: {
    type: Array,
    default: () => null
  },
  // Icons in Arthur CDN
  milestoneIcon: {
    type: String,
    default: 'icon-milestone.png'
  },
  /**
   * Format:
   * [{
   *  id: Number; // gantt 任务专用 id
   *  baseId: Number; // 后端数据用的 id, lazy load 时需要提供
   *  status: Number;
   *  title: Striing;
   *  endDate: String;
   *  ancestors: Array; 懒加载的子任务层级超过1级就需要保存祖先id, eg: [0, 0-1, 0-1-1]
   * }]
   */
  milestones: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  scale: {
    type: String,
    default: SCALE.DAY
  },
  showUnscheduled: {
    type: Boolean,
    default: true
  },
  gridMinWidth: {
    // 左侧网格区域最小尺寸
    type: Number,
    default: 240
  },
  gridWidth: {
    // 左侧网格区域固定尺寸, 内容超过该尺寸，将生成水平滚动条
    type: Number,
    default: 400
  },
  autofit: {
    type: Boolean,
    default: true
  },
  expand: {
    type: Boolean,
    default: false
  },
  // 水平滚动条
  scrollX: {
    type: Boolean,
    default: false
  },
  allowGridRowMerge: {
    type: Boolean,
    default: false
  },
  gridRowMergeProp: {
    type: String,
    default: ''
  },
  allowRemoveOnBar: Boolean,
  showTooltip: {
    // 任务的详情 tooltip 及 任务进度 0/0
    type: Boolean,
    default: true
  },
  showExpiredIcon: {
    // title上是否需要显示 expired 图标
    type: Boolean,
    default: true
  },
  showErrors: Boolean,
  lazy: Boolean,
  load: {
    type: Function,
    default: () => {}
  },
  updateState: {
    type: Function,
    default: () => {}
  },
  updatePerson: {
    type: Function,
    default: () => {}
  },
  createTask: {
    type: Function,
    default: () => {}
  },
  updateTask: {
    type: Function,
    default: () => {}
  },
  deleteTask: {
    type: Function,
    default: () => {}
  },
  getPersons: Function
})
const emit = defineEmits('title-click', 'data-loaded', 'milestone-update')

const ganttContainer = ref(null)
const ganttLoading = ref(false)
const showIcon = ref(true)

const imgCDNPath =
  'https://j1.58cdn.com.cn/arthurupload/teg/yunxiao/static/images/'
const NEW_TASK_ID = 'newTask'
const FILL_TASK_ID = 'fillTask'
const MILESTONE_ID = 'milestoneId'
const PSEUDO_CHILD_ID = 'pseudoChildId'
const oneDayMilliseconds = 86400000
const halfDayMilliseconds = oneDayMilliseconds / 2
const MILESTONE_HEIGHT = 40

// @see https://docs.dhtmlx.com/gantt/desktop__configuring_time_scale.html
// @see https://docs.dhtmlx.com/gantt/desktop__date_format.html
const SCALE_CONFIG = {
  [SCALE.DAY]: [
    { unit: SCALE.MONTH, step: 1, format: '%Y年%m月' },
    {
      unit: SCALE.DAY,
      step: 1,
      format: '%d',
      css: (date) => {
        const cls = []
        if (!gantt.isWorkTime({ date: date, unit: SCALE.DAY })) {
          cls.push('ee_gantt_weekend')
        }

        if (isToday(date)) {
          cls.push('ee_gantt_today')
        }

        return cls.join(',')
      }
    }
  ],
  [SCALE.WEEK]: [
    { unit: SCALE.MONTH, step: 1, format: '%Y年%m月' },
    {
      unit: SCALE.WEEK,
      step: 1,
      format: (date) => {
        const weekDay = gantt.date.add(date, 1, TIME_UNIT.WEEK)
        const endOfWeek = gantt.date.add(weekDay, -1, TIME_UNIT.DAY)
        const startDay = get(UNIT.DATE, date)
        const endDay = get(UNIT.DATE, endOfWeek)
        return `${gantt.date.getWeek(date)}周(${String(startDay).padStart(
          2,
          '0'
        )}-${String(endDay).padStart(2, '0')})`
      }
    }
  ],
  [SCALE.MONTH]: [
    { unit: SCALE.YEAR, step: 1, format: '%Y年' },
    { unit: SCALE.MONTH, step: 1, format: '%m月' }
  ]
}

const defaultConfig = {
  min_column_width: SIZE.MIN_COLUMN_WIDTH,
  scale_height: SIZE.SCALE_HEIGHT,
  row_height: SIZE.ROW_HEIGHT,
  bar_height: SIZE.BAR_HEIGHT,
  min_task_grid_row_height: SIZE.MIN_TASK_GRID_ROW_HEIGHT,
  resize_rows: false,
  show_unscheduled: props.showUnscheduled,
  date_format: '%Y-%m-%d',
  start_date: props.startDate,
  end_date: props.endDate,
  work_time: true, // 标注工作时间
  initial_scroll: true,
  show_progress: props.showProgress, // 显示拖动图层
  autofit: props.autofit,
  tooltip_offset_x: props.gridWidth,
  show_errors: props.showErrors,
  columns: [],
  scales: SCALE_CONFIG[SCALE.DAY],
  open_tree_initially: props.expand,
  drag_timeline: {
    ignore: '.gantt_task_line, .gantt_task_link',
    useKey: false
  },
  // grid_elastic_columns: true,
  external_render: {
    isElement: (element) => {
      return element instanceof Vue
    },
    // renders the Vue component into the container
    renderElement: (element, container) => {
      element.$mount(container.querySelector('.gantt_tree_content'))
    }
  },
  // @see https://docs.dhtmlx.com/gantt/desktop__layout_config.html#htmlasinnerview
  layout: {
    css: 'gantt_container',
    cols: [
      {
        width: props.gridWidth,
        min_width: props.gridMinWidth,
        rows: [
          {
            view: 'grid',
            scrollY: 'scrollVer'
          }
        ]
      },
      {
        html: "<div id='ee-gantt-date-car'></div>",
        css: 'ee-gantt-date-car',
        width: 1
      },
      {
        css: 'scrollbar-horizon',
        rows: [
          { view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' },
          { view: 'scrollbar', id: 'scrollHor', group: 'horizontal' }
        ]
      },
      { view: 'scrollbar', id: 'scrollVer' }
    ]
  }
}
const plugins = {
  marker: true,
  tooltip: true,
  drag_timeline: true,
  quick_info: true
}

// 指示线居中
const todayStart = gantt.date.day_start(new Date())
const todayMarker = {
  start_date: gantt.date.add(
    todayStart,
    halfDayMilliseconds / 1000 / 60 / 60 - 1, // 1 是 maker 这条线
    'hour'
  ),
  css: 'ee_gantt_today'
}

const scrollXHeight = computed(() => {
  return props.scrollX ? '4px' : '0px'
})

watchEffect(() => {
  ganttLoading.value = props.loading
})

watch(
  () => props.tasks,
  () => {
    loadData()
  }
)

watch(
  () => props.milestones,
  () => {
    loadData()
  }
)

watch(
  () => props.height, // 高度变化，需重新计算
  () => {
    calcFillingHeight()
  }
)

watch(
  () => props.scale,
  (scale) => {
    gantt.config.scales = SCALE_CONFIG[scale] || SCALE_CONFIG[SCALE.DAY]
    if (scale === SCALE.WEEK || scale === SCALE.MONTH) {
      gantt.config.min_column_width = SIZE.MIN_COLUMN_WIDTH * 7
    } else {
      gantt.config.min_column_width = SIZE.MIN_COLUMN_WIDTH
    }
    gantt.render()
    createMilestoneNodes()
  }
)

onMounted(() => {
  ganttLoading.value = true
  initGantt()
  loadData()
})

onUnmounted(() => {
  gantt.clearAll()
})

function handleToToday() {
  gantt.showDate(new Date())
}

function initGantt() {
  defaultConfig.columns = props.columns?.reduce((ret, column) => {
    column.onrender = (element) => handleColumnRender(element, column)
    // Reference: https://docs.dhtmlx.com/gantt/desktop__styling_guide.html#stylinggrid
    if (column.sort) {
      column.label = `${column.label}
          <button data-name="${column.name}" data-action="${SORT.ASCENT}" id="${column.name}_asc" class="ee_gantt_sort asc ">升序</button>
          <button data-name="${column.name}" data-action="${SORT.DESCENT}" id="${column.name}_desc" class="ee_gantt_sort desc ">降序</button>`
    }
    ret.push(column)
    return ret
  }, [])

  Object.keys(defaultConfig).forEach(
    (key) => (gantt.config[key] = defaultConfig[key])
  )

  gantt.plugins(plugins)
  gantt.addMarker(todayMarker)
  gantt.init(ganttContainer.value)

  initGanttEvents() // 事件
  initGanttTemplates() // 模版

  processAfterInit()
}

// Reference: https://docs.dhtmlx.com/gantt/api__refs__gantt_events.html
function initGanttEvents() {
  gantt.$previous_id = null
  gantt.$previousRow = null
  gantt.$previousRemoveId = null
  gantt.$previousRowNode = null
  gantt.$barsAreaEle = document.getElementsByClassName('gantt_bars_area')[0]

  gantt.attachEvent('onBeforeTaskDrag', handleBeforeTaskDrag)
  gantt.attachEvent('onAfterTaskDrag', handleAfterTaskDrag)
  gantt.attachEvent('onGridHeaderClick', handleGridHeaderClick)
  gantt.attachEvent('onTaskClick', handleTaskClick)
  gantt.attachEvent('onMouseMove', handleMouseMove)
  gantt.attachEvent('onEmptyClick', handleEmptyClick)
  gantt.attachEvent('onGanttScroll', handleGanttScroll)
  gantt.attachEvent('onBeforeGanttRender', () => {
    // Only display tooltips in timeline area
    const tooltips = gantt.ext.tooltips
    tooltips.tooltip.setViewport(gantt.$task_data)
  })
}

// Reference: https://docs.dhtmlx.com/gantt/api__refs__gantt_templates.html
function initGanttTemplates() {
  gantt.templates.scale_cell_class = () => {
    return 'ee_scale_cell_class'
  }

  gantt.templates.timeline_cell_class = (task, date) => {
    if (!gantt.isWorkTime({ date: date, unit: props.scale })) {
      return 'ee_gantt_weekend'
    }
  }

  gantt.templates.quick_info_class = () => {
    return 'task-details'
  }
  gantt.templates.quick_info_content = (start, end, task) => {
    return createTaskDetailCard(task)
  }
  gantt.templates.quick_info_date = () => {
    return ''
  }
  gantt.templates.quick_info_title = () => {
    return ''
  }

  gantt.templates.grid_row_class = function (start, end, task) {
    if (props.allowGridRowMerge && task[props.gridRowMergeProp]) {
      return 'ee_gantt_row_class'
    }
  }

  gantt.templates.task_row_class = function (start, end, task) {
    if (props.allowGridRowMerge && task[props.gridRowMergeProp]) {
      return 'ee_gantt_row_class'
    }
  }

  gantt.templates.task_class = (start, end, task) => {
    return getTaskClass(task)
  }

  gantt.templates.progress_text = (start, end, task) => {
    if (!task.direction) {
      return null
    }

    const dragDirection = task.direction
    const num = Math.min(task.index, task.$index)
    const posTop = -(num * SIZE.ROW_HEIGHT + 12)
    const height = props.height - posTop
    let borderStyle = ''

    if (dragDirection == DRAG_DIRECTION.LEFT) {
      borderStyle = 'border-left-width: 2px'
    }

    if (dragDirection == DRAG_DIRECTION.RIGHT) {
      borderStyle = 'border-right-width: 2px'
    }

    if (dragDirection == DRAG_DIRECTION.MOVE) {
      borderStyle = 'border-right-width: 2px; border-left-width: 2px'
    }

    return `<div id="${CUSTOM_CLASS.taskDragMask}-${task.id}"
      style="top: ${posTop}px; height: ${height}px; display: block; ${borderStyle}"
      class="ee_task_drag_mask"></div>`
  }

  gantt.templates.leftside_text = (start, end, task) => {
    if (task.direction == DRAG_DIRECTION.LEFT) {
      const sDate = formatDateToStr(start, '%Y年%m月%d日')

      return `<div id="${CUSTOM_CLASS.taskLeftSideText}-${task.id}">${sDate}</div>`
    }

    return null
  }

  gantt.templates.rightside_text = (start, end, task) => {
    if (task.id === MILESTONE_ID) {
      nextTick(() => {
        createMilestoneNodes()
      })
    }

    const sDate = formatDateToStr(start, '%Y年%m月%d日')
    const eDate = formatDateToStr(genEndDate(task), '%Y年%m月%d日')
    const removeContainer = props.allowRemoveOnBar
      ? `<div id="task-${task.id}-remove-container"></div>`
      : ''
    let rightsideText = `${removeContainer}${sDate}-${eDate}`

    if (props.showTooltip) {
      const totalCompleted =
        (task.completedIssue || 0) +
        (task.completedBug || 0) +
        (task.completedTask || 0)
      const total =
        (task.totalIssue || 0) + (task.totalBug || 0) + (task.totalTask || 0)

      rightsideText = `${rightsideText} ${totalCompleted}/${total}`
    }

    return task.id !== MILESTONE_ID ? rightsideText : ''
  }

  // @see https://docs.dhtmlx.com/gantt/desktop__tree_column.html
  gantt.templates.grid_open = (task) => {
    if (task.loading) {
      return `<i data-task-index="${task.index}" class="gantt-lazy-loading el-icon-loading"></i>`
    }

    if (task.$open) {
      return `<i data-task-index="${task.index}" class="gantt_tree_icon gantt_close iconfont icon-a-icon-8-xialajiantou3x"></i>`
    }

    return `<i data-task-index="${task.index}" class="gantt_tree_icon gantt_open iconfont icon-icon-8-youjiantou"></i>`
  }
}

/**
 * Something needs to be handled after initialization
 */
function processAfterInit() {
  // Remove the built-in tooltip handler from tasks(not displaying tooltips)
  gantt.ext.tooltips.detach(
    '[' + gantt.config.task_attribute + ']:not(.gantt_task_row)'
  )
}

function loadData() {
  try {
    ganttLoading.value = true
    gantt.clearAll()

    const data = props.tasks?.reduce((pre, cur, index) => {
      if (!cur.loaded && cur.hasChildren) {
        pre.push({
          id: PSEUDO_CHILD_ID + cur.id,
          parent: cur.id
        })
      }

      pre.push({
        ...cur,
        index,
        end_date: formatDate(genEndDate(cur, 'plus'))
      })

      return pre
    }, [])

    const msLen = props.milestones.length
    if (msLen) {
      const msFirstDate = props.milestones[0].endDate
      const msLastDate = props.milestones[msLen > 1 ? msLen - 1 : 0].endDate
      const milestoneTask = createBasicTask(MILESTONE_ID, 'milestone')
      milestoneTask.start_date = parseDate(msFirstDate)
      milestoneTask.end_date = parseDate(msLastDate)
      milestoneTask.unscheduled = false
      milestoneTask.row_height = MILESTONE_HEIGHT
      milestoneTask.bar_height = MILESTONE_HEIGHT
      data.unshift(milestoneTask)

      nextTick(() => {
        createMilestoneNodes()
      })
    }

    // The last task for filling the rest of the gantt
    data.push(createBasicTask(FILL_TASK_ID))

    gantt.parse({ data })
    calcFillingHeight()
    // addMarker is not a function happened each time (not know why)
    gantt.addMarker && gantt.addMarker(todayMarker)
    gantt.showDate(new Date())
    ganttLoading.value = false
    emit('data-loaded')
  } catch (e) {
    console.error('gantt load data error:', e)
  }
}

/**
 * Calculates height of filling the rest of gantt
 * @returns {Number}
 */
function calcFillingHeight() {
  // final height = props.height - ROW_HEIGHT * visibleTaskCount
  const rowHeight = props.height - gantt.getVisibleTaskCount() * SIZE.ROW_HEIGHT
  gantt.getTask(FILL_TASK_ID).row_height = rowHeight < 0 ? 0 : rowHeight
  gantt.render()
}

/**
 * Creates milestone nodes in timeline area
 */
function createMilestoneNodes() {
  const selector = `.gantt_task_line[task_id='${MILESTONE_ID}'] .gantt_task_progress_wrapper .gantt_task_progress`

  if (!document.querySelector(selector)) return null

  const firstNodeDate = props.milestones[0].endDate
  const baseLeftPos = getLeftPosFromDate(firstNodeDate)
  const milestones = props.milestones.map((x) => ({
    ...x,
    left: getLeftPosFromDate(x.endDate) - baseLeftPos
  }))

  return new GanttComponent.GanttMilestoneNodes({
    propsData: {
      objectId: props.objectId,
      objectType: props.objectType,
      disabled: props.disabled,
      milestones,
      milestoneUpdate: () => {
        emit('milestone-update')
      }
    }
  }).$mount(selector)
}

/**
 * Gets position by date
 * @param {String} date
 * @returns {Number}
 */
function getLeftPosFromDate(date) {
  return gantt.posFromDate(parseDate(date))
}

/**
 * Parses date according to current date format
 * @param {String} date
 * @returns {Date}
 */
function parseDate(date) {
  return gantt.date.parseDate(date, defaultConfig.date_format)
}

// 更新 task @see https://docs.dhtmlx.com/gantt/api__gantt_updatetask.html
function onTaskChange(task) {
  updateTaskInfo(task)
  const ntask = gantt.getTask(task.id)

  props
    .updateTask({ ...ntask, end_date: genEndDate(task) })
    .then((res) => {
      res && updateExpiredInfo(task.id, res)
    })
    .catch(() => {
      gantt.deleteTask(task.id)
    })
}

/**
 * Creates a task with basic info which can work well
 * @see https://docs.dhtmlx.com/gantt/desktop__loading.html#dataproperties
 * @param {Number} id - Task ID
 * @param {String} text - Task name
 * @returns {Object}
 */
function createBasicTask(id, text = '未命名') {
  return {
    id,
    text,
    unscheduled: true
  }
}

/**
 * Does not display task tooltip(detail card)
 * @param {Object} task
 * @returns {Boolean}
 */
function hideTooltip(task) {
  return [NEW_TASK_ID, MILESTONE_ID, FILL_TASK_ID].includes(task.id)
}

function updateTaskInfo(task) {
  const id = task.id
  if (!gantt.isTaskExists(id)) return
  const otask = gantt.getTask(task.id)
  const ntask = { ...otask, ...task }
  gantt.updateTask(id, ntask)
  return ntask
}

function handleTitleClick(task, index) {
  emit('title-click', task, index)
}

function changeHighlight(el, type) {
  if (el !== null) {
    el.classList[type]('gantt_selected')
    return
  }

  const elements = document.querySelectorAll(
    `.gantt_task_row[task_id="${gantt.$previous_id}"]`
  )

  for (let i = 0; i < elements.length; i++) {
    elements[i].classList[type]('gantt_selected')
  }
}

function createRemoveElement(taskId) {
  if (!props.allowRemoveOnBar) return

  if (gantt.$barsAreaEle && taskId) {
    let taskRemove = gantt.$barsAreaEle.querySelector(`#task-${taskId}-remove`)

    if (taskRemove == null) {
      const container = gantt.$barsAreaEle.querySelector(
        `#task-${taskId}-remove-container`
      )

      taskRemove = new GanttComponent.GanttTaskRemove({
        propsData: {
          id: taskId,
          remove: () => {
            onTaskChange({
              id: taskId,
              start_date: '',
              end_date: '',
              unscheduled: true
            })
          }
        }
      })

      container && taskRemove.$mount(container)
    }
  }
}

function changeDragMask(id, mode, e) {
  let direction = DRAG_DIRECTION.MOVE

  if (mode === DRAG_MODE.RESIZE) {
    if (
      e.target.classList.contains('task_left') ||
      e.target.dataset.bindProperty == 'start_date'
    ) {
      direction = DRAG_DIRECTION.LEFT
    }

    if (
      e.target.classList.contains('task_right') ||
      e.target.dataset.bindProperty == 'end_date'
    ) {
      direction = DRAG_DIRECTION.RIGHT
    }
  }

  if (
    mode === DRAG_MODE.MOVE &&
    (e.target.classList.contains('gantt_task_progress_wrapper') ||
      e.target.classList.contains('gantt_task_progress'))
  ) {
    direction = DRAG_DIRECTION.MOVE
  }

  gantt.updateTask(id, {
    ...gantt.getTask(id),
    direction
  })
}

function handleColumnRender(task, column) {
  if (task.id === FILL_TASK_ID) return ''

  if (task.id === NEW_TASK_ID) {
    if (column.type === COLUMN_TYPE.TITLE) {
      return new GanttComponent.GanttCreateProjectPlan({
        propsData: {
          placeholder: '请输入标题',
          confirm: (value) => {
            if (!value) {
              Message.warning('请输入标题')
              return
            }

            ganttLoading.value = true
            props
              .createTask(value, task.parent)
              .then((res) => {
                if (res) {
                  const parentId = task.parent
                  const children = gantt.getChildren(parentId)
                  if (children.length) {
                    gantt.addTask(res, parentId, children.length - 1)
                  }
                }
              })
              .catch(() => {
                Message.error('创建失败')
              })
              .finally(() => {
                ganttLoading.value = false
              })
          },
          cancel: () => {
            removeTask(NEW_TASK_ID)
          }
        }
      })
    } else {
      return '<span></span>'
    }
  }

  if (task.id === MILESTONE_ID) {
    if (column.type === COLUMN_TYPE.TITLE) {
      return createMilestoneTitle()
    } else {
      return '<span></span>'
    }
  }

  switch (column.type) {
    case COLUMN_TYPE.TITLE:
      return new GanttComponent.GanttTableTitle({
        propsData: {
          title: task.text,
          parentId: task.parent,
          workType: task.workType,
          isExpired: isTaskExpired(task),
          allowRemove: task.allowRemove,
          allowAdd: task.allowAdd,
          showExpiredIcon: props.showExpiredIcon,
          editable: false,
          disabled: props.disabled,
          click: () => {
            handleTitleClick(task, task.$index)
          },
          add: () => {
            const parentId = task.id
            removeTask(NEW_TASK_ID)
            gantt.open(task.id)
            gantt.addTask(createBasicTask(NEW_TASK_ID), parentId)
            gantt.showTask(NEW_TASK_ID)
          },
          delete: () => {
            ganttLoading.value = true
            const taskId = task.baseId || task.id
            props
              .deleteTask(taskId, task.parent === 0)
              .then(() => {
                removeTask(NEW_TASK_ID)
                gantt.deleteTask(task.id)
              })
              .finally(() => {
                ganttLoading.value = false
              })
          }
        }
      })
    case COLUMN_TYPE.STATE_SELECT:
      return new GanttComponent.GanttStateSelect({
        propsData: {
          value: task.status?.value || task.status,
          options: props.states || task.status?.options,
          disabled: props.disabled || task.status?.disabled,
          change: (value) => {
            ganttLoading.value = true
            task.status = value
            props
              .updateState(task)
              .then(() => {
                gantt.updateTask(task.id, task)
                gantt.render()
              })
              .finally(() => {
                ganttLoading.value = false
              })
          }
        }
      })
    case COLUMN_TYPE.PERSON_SINGLE: {
      const modelValue = []
      const options = []
      if (task.leader && task.leaderNickName) {
        modelValue.push(task.leader)
        options.push({
          msg: task.leaderNickName,
          code: task.leader,
          img: task.leaderImg
        })
      }
      return new GanttComponent.GanttPersonSelect({
        propsData: {
          multiple: false,
          modelValue: modelValue,
          readonly: props.disabled || task.leaderStatus == 1,
          options,
          change: (u) => {
            const [user] = u
            if (user.userName !== task.leader) {
              ganttLoading.value = true
              task.leader = user.userName
              task.leaderNickName = user.nickName
              task.leaderImg = user.img

              props
                .updatePerson(task)
                .then(() => {
                  gantt.updateTask(task.id, task)
                })
                .finally(() => {
                  ganttLoading.value = false
                })
            }
          },
          remoteMethod: props.getPersons
        }
      })
    }
    case COLUMN_TYPE.DATE:
      return new GanttComponent.GanttDatePicker({
        propsData: {
          current: task[column.name],
          changeFunc: (date) => {
            onTaskChange({ id: task.id, [column.name]: date })
          }
        }
      })
    default:
      if (column.component) {
        return new column.component({
          propsData: {
            change: () => {
              // TODO: customized component
            }
          }
        })
      }
  }
}

function handleBeforeTaskDrag(id, mode, e) {
  if (props.disabled) return false

  if (id === MILESTONE_ID) return false

  removeTask(NEW_TASK_ID)
  changeDragMask(id, mode, e)
  return true
}

/**
 * fires after the user has finished to drag and released the mouse button
 * @param {String|Number} id - the task id
 * @param {String} mode - the drag-and-drop mode ("resize", "progress", "move", "ignore")
 * @param {Event} e - a native event object
 */
async function handleAfterTaskDrag(id) {
  const task = gantt.getTask(id)
  const res = await props.updateTask({ ...task, end_date: genEndDate(task) })
  res && updateExpiredInfo(id, res)

  if (task.direction == DRAG_DIRECTION.RIGHT) {
    gantt.updateTask(id, {
      ...task,
      end_date: fixedDate(task),
      direction: undefined
    })
  }

  if (task.direction == DRAG_DIRECTION.LEFT) {
    gantt.updateTask(id, {
      ...task,
      start_date: fixedDate(task, 'start'),
      direction: undefined
    })
  }

  if (task.direction === DRAG_DIRECTION.MOVE) {
    gantt.updateTask(id, {
      ...task,
      direction: undefined
    })
  }
}

/**
 * 更新过期信息
 * @param {Number} id
 * @param {Object} task
 */
function updateExpiredInfo(id, task) {
  const updateTask = gantt.getTask(id)
  gantt.updateTask(id, {
    ...updateTask,
    overTimeDays: task?.overTimeDays
  })
}

function handleGridHeaderClick(_, e) {
  const el = e.target
  if (
    //【列排序】
    has(el?.dataset, 'action') &&
    [SORT.ASCENT, SORT.DESCENT].includes(el.dataset.action)
  ) {
    emit('sort', el.dataset.name, el.dataset.action)
  }
}

function handleTaskClick(id, e) {
  const el = e?.target

  if (el.classList.contains('title__text')) {
    removeTask(NEW_TASK_ID)
    return
  }

  if (!gantt.isTaskExists(id)) return

  showTaskDetail(gantt.getTask(id))

  // 点击图标展开
  if (el.classList.contains(CUSTOM_CLASS.ganttOpen)) {
    const task = gantt.getTask(id)

    try {
      // 不需要 lazy load 或 已经从后端加载过
      if (!props.lazy || task.loaded) {
        openTree([id])
      }

      // 加载子任务
      if (props.lazy && !task.loaded) {
        loadChild(task)
      }
    } catch (e) {
      Message.error('展开失败，请刷新重试!')
      console.error('展开工作项 error: %o', e)
    }

    return
  }

  // 点击图标折叠
  if (el.classList.contains(CUSTOM_CLASS.ganttClose)) {
    closeTree([id])
    return
  }
}

/**
 * Show task details(Quick Info)
 * @see https://docs.dhtmlx.com/gantt/desktop__quick_info.html (now)
 * @see https://docs.dhtmlx.com/gantt/desktop__tooltips.html (before)
 * @param {Object} task
 */
function showTaskDetail(task) {
  if (task && props.showTooltip && !hideTooltip(task)) {
    gantt.ext.quickInfo.show(task.id)
  }
}

function loadChild(task) {
  const ancestors = JSON.parse(JSON.stringify(task.ancestors))

  updateTaskInfo({ ...task, loading: true })
  ancestors.push(task.id)

  props
    .load({
      ancestors,
      index: task?.index,
      projectId: task?.projectId,
      baseId: task?.baseId
    })
    .then(() => {
      removeTask(`${PSEUDO_CHILD_ID}-${task.id}`)
      openTree([...task?.ancestors, task?.id])
    })
    .catch((e) => {
      // Message.error('展开失败，请刷新重试!')
      console.error('展开工作项 error: %o', e)
    })
}

/**
 * 逐级打开任务
 * @param {Array} treeIds, eg: [ancestor1, ancestor1-1, ancestor1-1-1]
 */
function openTree(treeIds) {
  if (!treeIds) return

  for (let i = 0; i < treeIds.length; i++) {
    const taskId = treeIds[i]

    if (gantt.isTaskExists(taskId)) {
      gantt.open(taskId)
    }
  }
  calcFillingHeight()
}

/**
 * 关闭任务
 * @param {Array} treeIds, eg: [ancestor1, ancestor1-1, ancestor1-1-1]
 */
function closeTree(treeIds) {
  for (let i = 0; i < treeIds.length; i++) {
    const taskId = treeIds[i]
    const task = gantt.getTask(taskId)

    if (gantt.isTaskExists(taskId)) {
      // ancestors: 重置祖先关系
      props.lazy && updateTaskInfo({ ...task, ancestors: [] })
      gantt.close(taskId)
    }
  }
  calcFillingHeight()
}

function handleMouseMove(id, e) {
  const el = e?.target
  const rowElement = el.parentElement

  if (rowElement && rowElement.classList.contains('gantt_task_row')) {
    const taskId = rowElement.dataset['taskId']
    const taskRowNode = gantt.getTaskRowNode(taskId)

    //hover grid task row
    if (gantt.$previousRowNode != taskRowNode) {
      if (gantt.$previousRow) {
        changeHighlight(gantt.$previousRowNode, 'remove')
      }

      gantt.$previousRowNode = taskRowNode
      changeHighlight(gantt.$previousRowNode, 'add')
    }

    if (gantt.$previousRow != rowElement) {
      if (gantt.$previousRow) {
        changeHighlight(gantt.$previousRow, 'remove')
      }

      gantt.$previousRow = rowElement
      changeHighlight(gantt.$previousRow, 'add')
    }
  }

  // fix bug: https://ee.58corp.com/w/bug/yunxiao-13229
  createRemoveElement(id)
  if (id && gantt.$previous_id != id) {
    if (gantt.$previous_id) {
      changeHighlight(null, 'remove')
    }

    gantt.$previous_id = id
    changeHighlight(null, 'add')
  }
}

function handleGanttScroll(left) {
  const date = gantt.dateFromPos(left)
  if (isAfter(date, new Date(), UNIT.DATE)) {
    showIcon.value = false
  } else {
    showIcon.value = true
  }

  if (gantt.$leftPos != left) {
    // do something
    gantt.$leftPos = left
  }
}

function handleEmptyClick(e) {
  if (props.disabled) return

  const el = e.target
  const parentNode = el.parentElement || el.parentNode
  const taskId = parentNode?.dataset['taskId']
  if (!taskId) return

  const task = gantt.getTask(taskId)
  if (task.id === FILL_TASK_ID) return

  if (!task.unscheduled && task.start_date && task.end_date) {
    gantt.showDate(task.start_date)
  } else {
    if (task.unscheduled && el.classList.contains('gantt_task_cell')) {
      const sDate = gantt.dateFromPos(el.offsetLeft)
      const eDate = gantt.date.add(sDate, 1, 'day')

      onTaskChange({
        id: taskId,
        start_date: sDate,
        end_date: eDate,
        unscheduled: false
      })
    }
  }
}

function isToday(dateStr) {
  let date = dateStr
  let today = new Date()

  date = gantt.date.date_part(dateStr)
  today = gantt.date.date_part(today)

  return new Date(date).getTime() === new Date(today).getTime()
}

// Reference: https://docs.dhtmlx.com/gantt/desktop__date_operations.html
function formatDateToStr(date, formatStr) {
  const format = gantt.date.date_to_str(formatStr)

  return format(date)
}

function createTaskDetailCard(task) {
  return `
    <div id="${task.id}" class="task-item-progress">
      <div class="title"><span>${task.text}</span></div>
      <div class="progress-bars">
        <div class="bar-item">
          <span>需求</span>
          <div class="progress-bar req">
            <div class="progress-bar__inner" style="width: ${
              task.issueCompletedPercent
            }%"></div>
          </div>
          <span>${task.completedIssue || 0} / ${task.totalIssue || 0}</span>
        </div>
        <div class="bar-item">
          <span>任务</span>
          <div class="progress-bar task">
            <div class="progress-bar__inner" style="width: ${
              task.taskCompletedPercent
            }%"></div>
          </div>
          <span>${task.completedTask || 0} / ${task.totalTask || 0}</span>
        </div>
        <div class="bar-item">
          <span>缺陷</span>
          <div class="progress-bar bug">
            <div class="progress-bar__inner" style="width: ${
              task.bugCompletedPercent
            }%"></div>
          </div>
          <span>${task.completedBug || 0} / ${task.totalBug || 0}</span>
        </div>
      </div>
    </div>
    `
}

function createMilestoneTitle() {
  return `
    <div class="milestone-title">
      <img class="milestone-title__icon" src="${
        imgCDNPath + props.milestoneIcon
      }">
      <span class="milestone-title__text">里程碑</span>
    </div>
  `
}

function getTaskClass(task) {
  if (task.id === MILESTONE_ID) return ''

  const status = task.status
  if (status === STATE_PROJECT_PLAN.FINISHED.value) {
    return 'gantt_task_completed'
  } else if (isTaskExpired(task)) {
    return 'gantt_task_risk'
  } else {
    return ''
  }
}

/**
 * 判断任务是否过期
 * @param {Object} task
 * @returns {Boolean}
 */
function isTaskExpired(task) {
  // 事项管理专用，通过后端来判断是否过期
  if (task.baseId) {
    // 如果有这个字段的则根据这个字段来判断是否过期
    if (task?.overTimeDays) {
      return true
    } else {
      return false
    }
  } else {
    if (
      task.unscheduled || // 未分配的
      !task.end_date ||
      task.status === STATE_PROJECT_PLAN.FINISHED.value
    ) {
      return false
    }

    const today = gantt.date.date_part(new Date())
    const endDate = gantt.date.date_part(genEndDate(task))
    return endDate.getTime() < today.getTime()
  }
}

// 拖拽时修正 gantt 显示的日期
function fixedDate(task, type = 'end') {
  if (task.unscheduled) return ''

  const endDate = new Date(task.end_date).valueOf()
  const startDate = new Date(task.start_date).valueOf()
  const diff = endDate - startDate

  if (type == 'end') {
    return diff <= halfDayMilliseconds
      ? new Date(startDate + oneDayMilliseconds)
      : task.end_date
  }

  if (type == 'start') {
    return diff <= halfDayMilliseconds
      ? new Date(endDate - oneDayMilliseconds)
      : task.start_date
  }
}

// 按照 gantt 上的格子计算 end_date
function genEndDate(task, type) {
  if (task.unscheduled) return ''

  const endDate = new Date(task.end_date).valueOf()
  const startDate = new Date(task.start_date).valueOf()
  const diff = endDate - startDate

  if (type == 'plus') {
    return new Date(endDate + oneDayMilliseconds)
  }

  return diff == 0 ? task.end_date : new Date(endDate - oneDayMilliseconds)
}

function removeTask(taskId) {
  const isExisted = gantt.isTaskExists(taskId)
  if (isExisted) {
    gantt.deleteTask(taskId)
  }
}
</script>

<style lang="scss">
// @see https://docs.dhtmlx.com/gantt/desktop__css_overview.html
$milestone-title-height: 40px;
$border-color: #ebebeb;
$new-task-height: 50px;

/**
  Gantt css structure

  .ee_gantt_container
    > .gantt_container
      > .gantt_layout_cell.gantt_layout_root.gantt_layout.gantt_layout_x
        > .gantt_layout_cell.grid_cell
          > .gantt_layout_content
            > .gantt_grid
        > .gantt_layout_cell.timeline_cell
          > .gantt_layout_content
            > .gantt_task
              > .gantt_task_scale
                > .gantt_scale_line
                  > .gantt_scale_cell
              > .gantt_task_area
                > .gantt_task_bg
                  >.gantt_task_row
                    > .gantt_task_cell
                > .gantt_bars_area
                  > .gantt_task_line
                    > .gantt_task_progress_wrapper
                      > .gantt_task_progress
                    > .gantt_task_progress_drag
                    > .gantt_side_content.gantt_right
                > .gantt_marker_area
                > .gantt_links_area
 */
.ee-gantt {
  position: relative;
  // height: 100%;

  .btt {
    position: absolute;
    right: $base-gap * 3;
    bottom: $base-gap * 5;
    border-radius: 20px;
    background-color: rgba(0, 0, 0, 0.7);
    height: 36px;
    line-height: 36px;
    padding: $base-gap $base-gap * 4;
    display: flex;
    align-items: center;
    cursor: pointer;

    .btt-icon__left {
      font-size: 12px;
      color: #ffffff;
      transform: rotate(90deg);
      margin-right: $base-gap;
    }

    .btt-text {
      font-size: 14px;
      color: #ffffff;
      font-weight: 400;
      height: 16px;
      line-height: 16px;
    }

    .btt-icon__right {
      font-size: 12px;
      color: #ffffff;
      transform: rotate(-90deg);
      margin-left: $base-gap;
    }
  }

  .ee_gantt_container {
    overflow: hidden;
    position: relative;
    height: 100%;

    .gantt_container {
      border: none;
      border-top: 1px solid $color-line;

      .gantt_grid {
        .gantt_grid_scale {
          border-color: $color-line;
          .gantt_grid_head_cell {
            color: #a8acb3;
            font-size: 14px;
            text-align: left;
            padding-left: 10px;
            padding-right: 10px;
          }
        }

        .gantt_grid_data {
          .gantt_row_task[task_id='fillTask'] {
            background-color: #ffffff;
          }

          .gantt_row_task[task_id='newTask'] {
            height: $new-task-height !important;
            z-index: 58;
            right: 0;

            .gantt_cell[data-column-index='0'] {
              background-color: #fff;
              position: absolute;
              top: 0;
              left: 0;
              width: 100% !important;
              padding-right: $base-gap * 6;
              padding-left: 0;
            }
          }

          .gantt_row_task[task_id='milestoneId'] {
            z-index: 58;
            right: 0;

            .gantt_cell[data-column-index='0'] {
              background-color: #fff;
              position: absolute;
              top: 0;
              left: 0;
              width: 100% !important;
              padding-left: 0;
              padding-right: 0;

              .milestone-title {
                display: flex;
                align-items: center;
                padding-left: $base-gap * 5;
                width: 100%;
                height: $milestone-title-height;
                border-bottom: 1px solid $border-color;

                &__icon {
                  width: 32px;
                  height: 32px;
                }

                &__text {
                  color: $font-color;
                  font-size: 14px;
                  font-weight: 500;
                  letter-spacing: 0.5;
                }
              }
            }
          }

          .gantt_cell {
            display: flex;
            align-items: center;
            padding-left: 10px;
            padding-right: 10px;

            .ee-person {
              width: 100%;
            }
          }
        }
      }

      .gantt_layout_cell.timeline_cell {
        .gantt_task {
          .gantt_cal_quick_info.task-details {
            border: none;
            width: auto;

            .gantt_cal_qi_title {
              border-radius: 0;
              border: none;
            }

            .gantt_cal_qi_content {
              .task-item-progress {
                width: 200px;

                .title {
                  margin-bottom: $base-gap * 6;
                  max-width: 200px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;

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

                      &:last-child {
                        margin-left: $base-gap * 2;
                        color: $secondary-text-color;
                      }
                    }

                    .progress-bar {
                      position: relative;
                      width: 100%;
                      height: 6px;
                      border-radius: 100px;
                      overflow: hidden;
                      vertical-align: middle;

                      &__inner {
                        position: absolute;
                        left: 0;
                        top: 0;
                        height: 100%;
                      }

                      &.req {
                        background-color: #d2e1ff;

                        .progress-bar__inner {
                          background-color: #84adff;
                        }
                      }

                      &.task {
                        background-color: #b8efd5;

                        .progress-bar__inner {
                          background-color: #2cc085;
                        }
                      }

                      &.bug {
                        background-color: #ffe4d0;

                        .progress-bar__inner {
                          background-color: #ffcc99;
                        }
                      }
                    }
                  }
                }
              }
            }

            .gantt_cal_qi_controls {
              display: none;
            }
          }
        }
      }

      .ee-gantt-date-car {
        position: absolute;
        z-index: 999;
        border: none;
      }

      // Scrollbar
      .gantt_layout_cell.scrollHor_cell {
        .gantt_layout_content {
          .gantt_layout_cell.gantt_hor_scroll {
            height: v-bind(scrollXHeight) !important;
          }
        }
      }
    }
  }
}

.gantt_tree_icon {
  &.gantt_close,
  &.gantt_open,
  &.gantt_folder_open,
  &.gantt_folder_closed,
  &.gantt_file {
    background-image: none;
  }

  &.gantt_open,
  &.gantt_close {
    color: #a8acb3;
    font-size: 12px;
  }

  &.gantt_folder_open,
  &.gantt_folder_closed,
  &.gantt_file {
    width: 0;
  }
}

.gantt_layout_cell_border_right {
  border-right-color: $border-color;
}

.gantt_grid_head_cell {
  .ee_gantt_sort {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 100;
    height: 100%;

    &.asc {
      left: 0;
    }
  }
}

.gantt_grid_data .gantt_row:hover,
.gantt_grid_data .gantt_row.odd:hover,
.gantt_grid_data .gantt_row.gantt_selected,
.gantt_grid_data .gantt_row.odd.gantt_selected,
.gantt_task_row.gantt_selected,
.gantt_task_row.gantt_selected .gantt_task_cell {
  background-color: #f8f9fa;
  cursor: pointer;
}

.gantt_task_row {
  border-bottom: none;

  &.gantt_selected {
    &[task_id='fillTask'] {
      .gantt_task_cell {
        background-color: #ffffff;
      }
    }
    .gantt_task_cell {
      border-right-color: $border-color;
    }
  }
  // Milestones row
  &[task_id='milestoneId'] {
    border-bottom: 1px solid $border-color;

    &.gantt_selected {
      background-color: unset;

      .gantt_task_cell {
        border: none;
        background-color: unset;
      }
    }

    .gantt_task_cell {
      border: none;
      background-color: unset;
    }
  }
}

.gantt_row {
  border-bottom: none;
}

.gantt_scale_line,
.gantt_task_scale {
  border-color: $color-line;
}

.gantt_task_line {
  border-radius: 2px;
  background-color: #b9d0ff;
  border: none;

  // Milestones timeline area
  &[task_id='milestoneId'] {
    top: 0 !important;
    background-color: transparent;

    // Remove drag indicator
    .gantt_task_drag {
      width: 0;

      &.task_left::before,
      &.task_right::before {
        width: 0;
      }
    }
  }

  &:hover {
    .gantt_side_content.gantt_right {
      display: block;
    }
  }

  .gantt_side_content.gantt_right {
    display: none;
  }

  // 光标指示器
  .gantt_task_drag {
    top: 0;
    width: 18px;

    &.task_left::before {
      content: '';
      display: inline-block;
      background-color: #fff;
      width: 3px;
      height: 50%;
      border-radius: 6px;
      vertical-align: middle;
      position: relative;
      left: 14px;
    }

    &.task_right::before {
      content: '';
      display: inline-block;
      background-color: #fff;
      width: 3px;
      height: 50%;
      border-radius: 6px;
      vertical-align: middle;
      position: relative;
      right: 0px;
    }
  }

  &.gantt_task_risk {
    background-color: #f4bcb3;

    .gantt_task_progress {
      background: #ff9999;
      border-radius: 2px;
    }
  }

  &.gantt_task_completed {
    background-color: #e4e7ed;

    .gantt_task_progress {
      background: #c9c9c9;
      border-radius: 2px;
    }
  }

  .gantt_task_progress {
    background: $primary-color;
    border-radius: 2px;
  }

  .task_leftside_text {
    visibility: hidden;

    &.show {
      visibility: visible;
    }
  }

  .ee_task_remove {
    color: #ed675a;
    cursor: pointer;
  }

  .gantt_task_progress_wrapper {
    overflow: initial;
    position: inherit;

    &:hover {
      cursor: move;
    }
  }

  // 拖拽时的蓝色 mask
  .ee_task_drag_mask {
    display: none;
    width: 100%;
    height: 1000px;
    background: rgba(185, 208, 255, 0.3);
    position: absolute;
    z-index: 99999;
    border-style: solid;
    border-color: $primary-color;

    &.show {
      display: block;
    }
  }

  .gantt_task_progress_drag,
  .gantt_link_control,
  .gantt_task_content {
    display: none !important;
  }
}

.gantt_side_content {
  &.gantt_right {
    padding-left: 10px;
  }
}

/**时间轴 */
.ee_scale_cell_class {
  text-align: left;
  text-indent: 8px;
}

.ee_gantt_today {
  background-color: $primary-color;
  color: #fff !important;
}

.ee_gantt_weekend {
  background: #f8f9fa !important;
  border-bottom: 1px solid $border-color;
}

.gantt_task_cell {
  &.ee_gantt_weekend {
    border-bottom: none;
  }
}

.ee_gantt_row_class {
  border-top: 1px solid #e4e7ed;

  &:first-child {
    border-top: none !important;
  }
}

/* 隐藏默认弹窗(lightbox) */
.gantt_cal_cover,
.gantt_cal_light {
  display: none !important;
}
</style>
