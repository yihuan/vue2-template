import Vue from 'vue'
import StatesSelect from './GanttTaskStatesSelect.vue'
import DatePicker from './DatePicker'
import TaskRemove from './TaskRemove'
import TableTitle from './GanttTableTitle.vue'
import GanttTaskCreate from './GanttTaskCreate.vue'

// Vue v3: Vue.createAPP()
const StatesSelectExtended = Vue.extend(StatesSelect)
const DatePickerExtended = Vue.extend(DatePicker)
const TaskRemoveExtended = Vue.extend(TaskRemove)
const TableTitleExtended = Vue.extend(TableTitle)
const CreateTaskExtended = Vue.extend(GanttTaskCreate)

export default {
  GanttTableTitle: TableTitleExtended,
  GanttTaskRemove: TaskRemoveExtended,
  GanttStateSelect: StatesSelectExtended,
  GanttDatePicker: DatePickerExtended,
  GanttCreateProjectPlan: CreateTaskExtended
}
