import Vue from 'vue'
import StatesSelect from './GanttStates.vue'
import DatePicker from './DatePicker'
import TaskRemove from './TaskRemove'
import EePerson from '@/components/fields/EePerson.vue'
import TableTitle from './GanttTableTitle.vue'
import GanttCreateProjectPlan from './GanttCreateProjectPlan.vue'
import MilestoneNodes from './GanttMilestoneNodes.vue'
import NormalText from './GanttNormalText.vue'

// Vue v3: Vue.createAPP()
const StatesSelectExtended = Vue.extend(StatesSelect)
const DatePickerExtended = Vue.extend(DatePicker)
const TaskRemoveExtended = Vue.extend(TaskRemove)
const EePersonExtended = Vue.extend(EePerson)
const TableTitleExtended = Vue.extend(TableTitle)
const CreatePlanExtended = Vue.extend(GanttCreateProjectPlan)
const MilestoneNodesExtended = Vue.extend(MilestoneNodes)
const GanttNormalTextExtended = Vue.extend(NormalText)

export default {
  GanttTableTitle: TableTitleExtended,
  GanttPersonSelect: EePersonExtended,
  GanttTaskRemove: TaskRemoveExtended,
  GanttStateSelect: StatesSelectExtended,
  GanttDatePicker: DatePickerExtended,
  GanttCreateProjectPlan: CreatePlanExtended,
  GanttMilestoneNodes: MilestoneNodesExtended,
  GanttNormalText: GanttNormalTextExtended
}
