export default {
  MIN_COLUMN_WIDTH: 26,
  SCALE_HEIGHT: 36,
  ROW_HEIGHT: 40,
  BAR_HEIGHT: 16,
  MIN_TASK_GRID_ROW_HEIGHT: 40,
  ColumnType: {
    title: 'title', // 名称组件
    person: 'person', // 人员组件
    date: 'date', // 日历组件
    select: 'select', // 普通下拉框
    text: 'text' // 普通文本
  },
  DragMode: {
    resize: 'resize',
    progress: 'progress',
    move: 'move',
    ignore: 'ignore'
  },
  DragDirection: {
    toLeft: 'left', // 向左
    toRight: 'right', // 向右
    move: 'move' // 整体移动,
  },
  DataSet: {
    sortASC: 'asc',
    sortDesc: 'desc'
  },
  CLS: {
    // 自定义节点的 classNames
    taskLeftSideText: 'eeTaskLeftSideText',
    taskRowClass: 'eeTaskRowClass',
    taskDragMask: 'eeTaskDragMask',
    ganttOpen: 'gantt_open', // 任务展开
    ganttClose: 'gantt_close' // 任务折叠
  }
}
