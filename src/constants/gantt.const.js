const freeze = Object.freeze

export const SIZE = freeze({
  MIN_COLUMN_WIDTH: 26,
  SCALE_HEIGHT: 36,
  ROW_HEIGHT: 40,
  BAR_HEIGHT: 16,
  MIN_TASK_GRID_ROW_HEIGHT: 40
})

export const COLUMN_TYPE = freeze({
  TITLE: 'title', // 名称组件
  PERSON_SINGLE: 'personSingle', // 人员单选组件
  PERSON_MULTIPLE: 'personMultiple', // 人员多选组件(暂未支持)
  DATE: 'date', // 日历组件
  SELECT: 'select', // 普通下拉框
  TEXT: 'text', // 普通文本
  STATE_SELECT: 'stateSelect' // 状态下拉框
})

// The drap-and-drop mode
export const DRAG_MODE = freeze({
  RESIZE: 'resize', // the mode when the user drags a task bar to change its duration
  PROGRESS: 'progress', // the mode when the user drags the progress knob of a task bar
  MOVE: 'move', // the mode when the user drags a task bar to replace it
  IGNORE: 'ignore' // the service mode which restricts the drag-and-drop action
})

export const DRAG_DIRECTION = freeze({
  LEFT: 'left', // 向左
  RIGHT: 'right', // 向右
  MOVE: 'move' // 整体移动,
})

export const SORT = freeze({
  ASCENT: 'asc',
  DESCENT: 'desc'
})

export const CUSTOM_CLASS = freeze({
  // 自定义节点的 classNames
  taskLeftSideText: 'eeTaskLeftSideText',
  taskRowClass: 'eeTaskRowClass',
  taskDragMask: 'eeTaskDragMask',
  ganttOpen: 'gantt_open', // 任务展开
  ganttClose: 'gantt_close' // 任务折叠
})

export const SCALE = freeze({
  YEAR: 'year',
  MONTH: 'month',
  QUARTER: 'quarter',
  WEEK: 'week',
  DAY: 'day',
  HOUR: 'hour',
  MINUTE: 'minute'
})

/**
 * Gantt Task object
 * @reference https://docs.dhtmlx.com/gantt/desktop__loading.html#dataproperties
 */
export const TASK_TYPE = freeze({
  id: '',
  text: '',
  start_date: '',
  end_date: '',
  duration: '',
  parent: 0,
  unscheduled: false
})

/**
 * Gantt column object
 * @reference https://docs.dhtmlx.com/gantt/api__gantt_columns_config.html
 */
export const TASK_COLUMN_TYPE = freeze({
  align: '', // ('left', 'center', 'right') sets the horizontal title alignment
  label: '', // specifies the title of the column
  max_width: 0, // sets the maximum column width in case of resize operations
  min_width: 0, // sets the minimum column width in case of resize operations
  name: '', // defines the column's id. The name 'add' allows you to add a column with the '+' sign
  template: () => {}, // sets a data  template,
  tree: false, // indicates that the related column should display a tree
  width: 0, // defines the width of the column
  onrender: () => {} //optional, a callback function for rendering a cell into the DOM. The function takes a task object and the DOM element of the grid cell as parameters and may return a component of the framework.
})
