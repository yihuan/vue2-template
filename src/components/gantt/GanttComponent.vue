<template>
  <div id="ganttContainer" ref="ganttContainer" class="ee_gantt_container" />
</template>
<script>
import Vue from 'vue'
import { gantt } from 'dhtmlx-gantt'
import has from 'lodash/has'
import constant from './constants'
import GanttComponent from './components'
import { ITEM_TYPE } from '@/constants/item.const'
import { SCALE } from '@/constants/gantt.const'
const {
  MIN_COLUMN_WIDTH,
  SCALE_HEIGHT,
  ROW_HEIGHT,
  BAR_HEIGHT,
  MIN_TASK_GRID_ROW_HEIGHT,
  ColumnType,
  DragMode,
  DragDirection: Drag,
  CLS,
  DataSet
} = constant

export default {
  props: {
    height: Number,
    startDate: {
      type: Date,
      default: () => new Date(2010, 1, 1)
    },
    endDate: {
      type: Date,
      default: () => new Date(2050, 12, 31)
    },
    columns: {
      type: Array,
      default() {
        return []
      }
    },
    tasks: {
      type: Array,
      default() {
        return []
      }
    },
    showProgress: Boolean,
    scale: {
      type: String,
      default: SCALE.DAY
    }
  },
  data() {
    return {
      defaultConfig: {
        min_column_width: MIN_COLUMN_WIDTH,
        scale_height: SCALE_HEIGHT,
        row_height: ROW_HEIGHT,
        bar_height: BAR_HEIGHT,
        min_task_grid_row_height: MIN_TASK_GRID_ROW_HEIGHT,
        resize_rows: false,
        show_unscheduled: true,
        date_format: '%Y-%m-%d',
        start_date: this.startDate,
        end_date: this.endDate,
        work_time: true, // 标注工作时间
        initial_scroll: true,
        show_progress: this.showProgress,
        // autofit: true,
        // grid_width: 360,
        columns: [],
        scales: [
          { unit: 'month', step: 1, format: '%Y年%m月' },
          {
            unit: 'day',
            step: 1,
            format: '%d',
            css: (date) => {
              const cls = []
              if (!gantt.isWorkTime({ date: date, unit: 'day' })) {
                cls.push('ee_gantt_weekend')
              }

              if (this.isToday(date)) {
                cls.push('ee_gantt_today')
              }

              return cls.join(',')
            }
          }
        ],
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
        layout: {
          // @see https://docs.dhtmlx.com/gantt/desktop__layout_config.html#scrollbar
          // @see https://docs.dhtmlx.com/gantt/desktop__specifying_columns.html#horizontalscrollbar
          css: 'gantt_container',
          cols: [
            {
              width: 360,
              min_width: 360,
              rows: [
                {
                  view: 'grid',
                  scrollX: 'gridScrollX',
                  scrollable: true,
                  scrollY: 'scrollY'
                },
                { view: 'scrollbar', id: 'gridScrollX', group: 'horizontal' }
              ]
            },
            {
              rows: [
                {
                  view: 'timeline',
                  scrollX: 'timelineScrollX',
                  scrollable: true,
                  scrollY: 'scrollY'
                },
                {
                  view: 'scrollbar',
                  id: 'timelineScrollX',
                  group: 'horizontal'
                }
              ]
            },
            { view: 'scrollbar', id: 'scrollY' }
          ]
        }
      },
      scaleConfig: {
        year: [
          {
            unit: 'year',
            step: 1,
            format: '%Y年'
          }
        ],
        month: [
          {
            unit: 'month',
            step: 1,
            format: '%Y年%m月'
          },
          {
            unit: 'day',
            step: 1,
            format: '%d',
            css: (date) => {
              const cls = []
              if (!gantt.isWorkTime({ date: date, unit: 'day' })) {
                cls.push('ee_gantt_weekend')
              }

              if (this.isToday(date)) {
                cls.push('ee_gantt_today')
              }

              return cls.join(',')
            }
          }
        ],
        week: [
          {
            unit: 'week',
            step: 1,
            format: ''
          }
        ],
        day: [
          {
            unit: 'day',
            step: 1,
            format: '%Y年%m月%d'
          }
        ]
      },
      plugins: {
        marker: true,
        tooltip: false
      },
      todayMarker: {
        start_date: gantt.date.date_part(new Date()),
        css: 'ee_gantt_today'
      }
    }
  },
  watch: {
    tasks(newVal) {
      gantt.parse({
        data: newVal.map((task, index) => ({ ...task, index }))
      })
    },
    scale(val) {
      gantt.config.scales = this.scaleConfig[val || 'month']
      gantt.render()
    }
  },
  mounted() {
    this.initGantt()
  },
  methods: {
    initGantt() {
      const defaultConfig = this.defaultConfig
      defaultConfig.columns = this.columns?.reduce((ret, column) => {
        column.onrender = (element) => this.handleColumnRender(element, column)
        // 排序 @see https://docs.dhtmlx.com/gantt/desktop__styling_guide.html#stylinggrid
        // TODO: 替换图标
        if (column.sort) {
          column.label = `${column.label}
          <button data-name="${column.name}" data-action="${DataSet.sortASC}" id="${column.name}_asc" class="ee_gantt_sort asc ">升序</button>
          <button data-name="${column.name}" data-action="${DataSet.sortDesc}" id="${column.name}_desc" class="ee_gantt_sort desc ">降序</button>`
        }
        ret.push(column)
        return ret
      }, [])

      Object.keys(defaultConfig).forEach(
        (key) => (gantt.config[key] = defaultConfig[key])
      )

      gantt.plugins(this.plugins)
      gantt.addMarker(this.todayMarker)
      gantt.init(this.$refs.ganttContainer)
      this.initGanttEvents() // 事件
      this.initGanttTemplates() // 模版
      this.parse()
    },
    // 更新 task @see https://docs.dhtmlx.com/gantt/api__gantt_updatetask.html
    onTaskChange(id, dtask) {
      if (!id) return
      const otask = gantt.getTask(id)
      const ntask = { ...otask, ...dtask }

      gantt.updateTask(id, ntask)
      this.$emit('updateTask', ntask)
    },
    onTaskDelete(taskId) {
      // TODO: delete Api
      gantt.deleteTask(taskId)
    },
    handleTitleClick(task) {
      this.$emit('title-click', task)
    },
    changeHighlight(el, type) {
      if (el !== null) {
        el.classList[type]('gantt_selected')
        return
      }

      const elements = document.querySelectorAll(
        `.gantt_task_row[task_id="${gantt.$previous_id}"]`
      )

      for (var i = 0; i < elements.length; i++) {
        elements[i].classList[type]('gantt_selected')
      }
    },
    changeTaskRemove(taskId, type) {
      if (gantt.$barsAreaEle && taskId) {
        let taskRemove = gantt.$barsAreaEle.querySelector(
          `#task-${taskId}-remove`
        )

        if (taskRemove != null) {
          taskRemove.classList[type]('hidden')
          return
        }

        const container = gantt.$barsAreaEle.querySelector(
          `#task-${taskId}-remove-container`
        )

        taskRemove = new GanttComponent.GanttTaskRemove({
          propsData: {
            id: taskId,
            remove: () => {
              this.onTaskDelete(taskId)
            }
          }
        })

        container && taskRemove.$mount(container)
      }
    },
    changeDragMask(id, mode, e) {
      let direction = Drag.move

      if (mode === DragMode.resize) {
        if (
          e.target.classList.contains('task_left') ||
          e.target.dataset.bindProperty == 'start_date'
        ) {
          direction = Drag.toLeft
        }

        if (
          e.target.classList.contains('task_right') ||
          e.target.dataset.bindProperty == 'end_date'
        ) {
          direction = Drag.toRight
        }
      }

      if (
        mode === DragMode.move &&
        (e.target.classList.contains('gantt_task_progress_wrapper') ||
          e.target.classList.contains('gantt_task_progress'))
      ) {
        direction = Drag.move
      }

      gantt.updateTask(id, {
        ...gantt.getTask(id),
        drag: direction
      })
    },
    handleColumnRender(task, column) {
      switch (column.type) {
        case ColumnType.title:
          return new GanttComponent.GanttTableTitle({
            propsData: {
              itemId: task.id,
              itemType: task.workType,
              title: task.title,
              clickable: true,
              click: () => {
                this.handleTitleClick(task)
              },
              update: (event) => {
                // title updated
              }
            }
          })
        case ColumnType.select:
          return new GanttComponent.GanttStateSelect({
            propsData: {
              options: column.options,
              state: task.status,
              choose: (value) => {
                this.onTaskChange(task.id, { [column.name]: value })
              }
            }
          })
        case ColumnType.person:
          return new GanttComponent.GanttPersonSelect({
            propsData: {
              options: [
                {
                  code: 'liuying59-xn1',
                  msg: '刘颍的测试账号',
                  type: null,
                  canOrder: null,
                  viewId: null,
                  color: null,
                  parentId: null,
                  productId: null,
                  columnWidth: null,
                  backgroundColor: null,
                  img: 'https://pic1.58cdn.com.cn/nowater/meishi/app/n_v2e8479442aebe4a3287f9d74f005b277e.png'
                },
                {
                  code: 'jilixia',
                  msg: '吉利霞',
                  type: null,
                  canOrder: null,
                  viewId: null,
                  color: null,
                  parentId: null,
                  productId: null,
                  columnWidth: null,
                  backgroundColor: null,
                  img: 'https://pic1.58cdn.com.cn/nowater/meishi/server_v2/n_v3b7bab2cf48934474b3ea790d8d39da59.png'
                }
              ],
              modelValue: task[column.name],
              change: (u) => {
                this.onTaskChange(task.id, {
                  [column.name]: u.map((i) => i.code)
                })
              }
            }
          })
        case ColumnType.date:
          return new GanttComponent.GanttDatePicker({
            propsData: {
              current: task[column.name],
              changeFunc: (date) => {
                this.onTaskChange(task.id, { [column.name]: date })
              }
            }
          })
        default:
          return null
      }
    },
    handleBeforeTaskDrag(id, mode, e) {
      this.changeDragMask(id, mode, e)

      return true
    },
    handleAfterTaskDrag(id, mode, e) {
      gantt.updateTask(id, {
        ...gantt.getTask(id),
        drag: undefined
      })
    },
    handleTaskDrag(id, mode, task, original) {
      this.$emit('updateTask', {
        ...task,
        start_date: task.start_date,
        end_date: task.end_date
      })
    },
    handleGridHeaderClick(_, e) {
      const el = e.target
      if (
        //【列排序】
        has(el?.dataset, 'action') &&
        [DataSet.sortASC, DataSet.sortDesc].includes(el.dataset.action)
      ) {
        this.$emit('sort', el.dataset.name, el.dataset.action)
      }
    },
    handleTaskClick(id, e) {
      const el = e?.target

      // 展开任务
      if (el.classList.contains(CLS.ganttOpen)) {
        gantt.open(id)
        return
      }

      // 折叠任务
      if (el.classList.contains(CLS.ganttClose)) {
        gantt.close(id)
        return
      }
    },
    handleMouseMove(id, e) {
      const el = e?.target
      const rowElement = el.parentElement

      if (rowElement && rowElement.classList.contains('gantt_task_row')) {
        const taskId = rowElement.dataset['taskId']
        const taskRowNode = gantt.getTaskRowNode(taskId)

        if (gantt.$previousRemoveId != taskId) {
          if (gantt.$previousRemoveId) {
            this.changeTaskRemove(gantt.$previousRemoveId, 'add')
          }
          gantt.$previousRemoveId = taskId
          this.changeTaskRemove(taskId, 'remove')
        }

        //hover grid task row
        if (gantt.$previousRowNode != taskRowNode) {
          if (gantt.$previousRow) {
            this.changeHighlight(gantt.$previousRowNode, 'remove')
          }

          gantt.$previousRowNode = taskRowNode
          this.changeHighlight(gantt.$previousRowNode, 'add')
        }

        if (gantt.$previousRow != rowElement) {
          if (gantt.$previousRow) {
            this.changeHighlight(gantt.$previousRow, 'remove')
          }

          gantt.$previousRow = rowElement
          this.changeHighlight(gantt.$previousRow, 'add')
        }
      }

      if (id && gantt.$previous_id != id) {
        if (gantt.$previousRemoveId != id) {
          if (gantt.$previousRemoveId) {
            this.changeTaskRemove(gantt.$previousRemoveId, 'add')
          }
          gantt.$previousRemoveId = id
          this.changeTaskRemove(id, 'remove')
        }

        if (gantt.$previous_id) {
          this.changeHighlight(null, 'remove')
        }

        gantt.$previous_id = id
        this.changeHighlight(null, 'add')
      }
    },
    handleEmptyClick(e) {
      const el = e.target
      const parentNode = el.parentElement || el.parentNode
      const taskId = parentNode.dataset['taskId']
      if (!taskId) return

      const task = gantt.getTask(taskId)

      if (task.unscheduled && el.classList.contains('gantt_task_cell')) {
        const sDate = gantt.dateFromPos(el.offsetLeft)
        const eDate = gantt.date.add(sDate, 1, 'day')

        this.onTaskChange(taskId, {
          start_date: sDate,
          end_date: eDate,
          unscheduled: false
        })

        // gantt.updateTask(taskId, {
        //   ...gantt.getTask(taskId),
        //   start_date: sDate,
        //   end_date: eDate
        // })
      }
    },
    handleGanttScroll(left, top) {
      // console.log('gantt scroll left: ', left, ', top:', top)
    },
    initGanttEvents() {
      // Reference: https://docs.dhtmlx.com/gantt/api__refs__gantt_events.html

      gantt.$previous_id = null
      gantt.$previousRow = null
      gantt.$previousRemoveId = null
      gantt.$previousRowNode = null
      gantt.$barsAreaEle = document.getElementsByClassName('gantt_bars_area')[0]

      gantt.attachEvent('onBeforeTaskDrag', this.handleBeforeTaskDrag)
      gantt.attachEvent('onAfterTaskDrag', this.handleAfterTaskDrag)
      gantt.attachEvent('onTaskDrag', this.handleTaskDrag)
      gantt.attachEvent('onGanttScroll', this.handleGanttScroll)
      gantt.attachEvent('onGridHeaderClick', this.handleGridHeaderClick)
      gantt.attachEvent('onTaskClick', this.handleTaskClick)
      gantt.attachEvent('onMouseMove', this.handleMouseMove)
      gantt.attachEvent('onEmptyClick', this.handleEmptyClick)
      gantt.attachEvent('onGanttRender', () => {})
    },
    initGanttTemplates() {
      // Reference: https://docs.dhtmlx.com/gantt/api__refs__gantt_templates.html

      gantt.templates.scale_cell_class = () => {
        return 'ee_scale_cell_class'
      }

      gantt.templates.timeline_cell_class = (task, date) => {
        if (!gantt.isWorkTime({ date: date, unit: 'day' })) {
          return 'ee_gantt_weekend'
        }
      }

      gantt.templates.task_class = (start, end, task) => {
        if (task.workType === ITEM_TYPE.RISK) {
          return 'ee_gantt_risk'
        }
      }

      gantt.templates.progress_text = (start, end, task) => {
        if (!task.drag) {
          return null
        }

        const dragDirection = task.drag
        const num = Math.min(task.index, task.$index)
        const posTop = -(num * ROW_HEIGHT + 12)
        const height = this.height - posTop
        let borderStyle = ''

        if (dragDirection == Drag.toLeft) {
          borderStyle = 'border-left-width: 2px'
        }

        if (dragDirection == Drag.toRight) {
          borderStyle = 'border-right-width: 2px'
        }

        if (dragDirection == Drag.move) {
          borderStyle = 'border-right-width: 2px; border-left-width: 2px'
        }

        return `<div id="${CLS.taskDragMask}-${task.id}"
          style="top: ${posTop}px; height: ${height}px; display: block; ${borderStyle}"
          class="ee_task_drag_mask"></div>`
      }

      gantt.templates.leftside_text = (start, end, task) => {
        if (task.drag == Drag.toLeft) {
          const sDate = this.formatDateToStr(start, '%Y年%m月%d日')

          return `<div id="${CLS.taskLeftSideText}-${task.id}">
              ${sDate}
          </div>`
        }

        return null
      }

      gantt.templates.rightside_text = (start, end, task) => {
        const sDate = this.formatDateToStr(start, '%Y年%m月%d日')
        const eDate = this.formatDateToStr(end, '%Y年%m月%d日')

        return `<div id="task-${task.id}-remove-container"></div>${sDate}-${eDate}`
      }
      // @see https://docs.dhtmlx.com/gantt/desktop__tree_column.html
      gantt.templates.grid_open = function (item) {
        if (item.$open) {
          return '<i class="gantt_tree_icon gantt_close iconfont icon-a-icon-8-xialajiantou3x"></i>'
        }

        return '<i class="gantt_tree_icon gantt_open iconfont icon-icon-8-youjiantou"></i>'
      }
    },
    parse() {
      if (this.tasks.length == 0) return

      const data = []
      const earlyDate = new Date(this.getEarlyDate(this.tasks))

      this.tasks.forEach((task, index) => {
        if (task.hasChild) {
          // 生成树级结构
          data.push({ parent: task.id, index })
        }

        data.push(
          // 初始化未安排的任务
          task.unscheduled
            ? {
                ...task,
                start_date: earlyDate,
                end_date: earlyDate,
                index
              }
            : {
                ...task,
                index
              }
        )
      })

      gantt.parse({ data })
    },
    isToday(dateStr) {
      let date = dateStr
      let today = new Date()

      date = gantt.date.date_part(dateStr)
      today = gantt.date.date_part(today)

      return new Date(date).getTime() === new Date(today).getTime()
    },
    // Reference: https://docs.dhtmlx.com/gantt/desktop__date_operations.html
    formatDateToStr(date, formatStr) {
      const format = gantt.date.date_to_str(formatStr)

      return format(date)
    },
    getEarlyDate(tasks) {
      return Math.min.apply(
        null,
        tasks.map((task) => {
          if (!task.unscheduled) {
            return new Date(task.start_date).getTime()
          }

          return Number.MAX_SAFE_INTEGER
        })
      )
    }
  }
}
</script>
<style lang="scss">
//@see https://docs.dhtmlx.com/gantt/desktop__css_overview.html
.ee_gantt_container {
  overflow: hidden;
  position: relative;
  height: 100%;
}

.gantt_container {
  border: none;
  border-top: 1px solid $color-line;
}

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

.gantt_grid_data .gantt_cell {
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;

  .table-title {
    display: flex;
    overflow: hidden;

    .scope-title {
      width: auto;
      flex: 1;
      overflow: hidden;

      .el-tooltip {
        width: 100% !important;
      }
    }
  }

  .ee-person {
    width: 100%;
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

// .gridHoverStyle,
// .gridSelection,
// .timelineSelection,
.gantt_grid_data .gantt_row:hover,
.gantt_grid_data .gantt_row.odd:hover,
.gantt_grid_data .gantt_row.gantt_selected,
.gantt_grid_data .gantt_row.odd.gantt_selected,
.gantt_task_row.gantt_selected,
.gantt_task_row.gantt_selected .gantt_task_cell,
.gantt_task_row.gantt_selected {
  background-color: #f8f9fa;
  cursor: pointer;
}

.gantt_task_row.gantt_selected .gantt_task_cell {
  border-right-color: #ebebeb;
}
.gantt_row,
.gantt_task_row {
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

  &.ee_gantt_risk {
    background-color: #f4bcb3;
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
    visibility: visible;
    cursor: pointer;

    &.hidden {
      visibility: hidden;
    }
  }

  .gantt_task_progress_wrapper {
    overflow: initial;
    position: inherit;

    &:hover {
      cursor: move;
    }
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

  // 拖拽时的蓝色 mask
  .ee_task_drag_mask {
    display: none;
    width: 100%;
    height: 1000px;
    background: rgba(185, 208, 255, 0.3);
    position: absolute;
    z-index: 99999;
    border-style: solid;
    border-color: #1564ff;

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
  background-color: #1564ff;
  color: #fff !important;
}

.ee_gantt_weekend {
  background: #f8f9fa !important;
  border-bottom: 1px solid #cecece;
}

.gantt_task_cell {
  &.ee_gantt_weekend {
    border-bottom: none;
  }
}

/* 隐藏默认弹窗(lightbox) */
.gantt_cal_cover,
.gantt_cal_light {
  display: none !important;
}
</style>
