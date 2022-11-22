<template>
  <div class="date-picker">
    <el-date-picker
      :value="date"
      placement="bottom-start"
      type="date"
      class="ee-date-picker"
      placeholder="选择日期"
      :clearable="false"
      @input="dateChange"
    ></el-date-picker>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  props: {
    changeFunc: Function,
    current: {
      type: Date,
      default: ''
    }
  },

  data() {
    return {
      date: this.current
    }
  },
  computed: {
    dateValue() {
      return dayjs(Number(this.current)).format('YYYY-MM-DD')
    }
  },
  methods: {
    dateChange($event) {
      this.date = $event
      this.changeFunc($event)
    }
  }
}
</script>
<style lang="scss">
.date-picker {
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: 100% !important;
    height: 24px !important;
    line-height: 24px !important;
  }
  .ee-date-picker {
    .el-input {
      width: 100% !important;
      height: 24px !important;
      line-height: 24px !important;
    }
    .el-input__inner {
      border: none;
      width: 100% !important;
      height: 24px !important;
      line-height: 24px !important;
      padding-left: 0;
      padding-right: 0;
      cursor: pointer;
    }

    .el-input__prefix {
      display: none;
    }
  }
}
</style>
