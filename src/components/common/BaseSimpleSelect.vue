<template>
  <el-popover
    ref="thePopoverRef"
    placement="bottom"
    popper-class="ee-select"
    :visible-arrow="visibleArrow"
    :trigger="trigger"
    :disabled="disabled"
    @show="handleShow"
    @hide="handleHide"
  >
    <ul
      ref="optionsRef"
      v-loading="loading"
      class="select-content text-ellipsis"
      :style="styleObj"
    >
      <li
        v-for="option in options"
        :key="option.value"
        :class="{
          'option-item active': isActive(option.value),
          'option-item': !isActive(option.value)
        }"
        @click="handleOptionClick(option)"
      >
        <i v-if="option.icon" :class="option.icon"></i>
        <span>{{ option.label }}</span>
      </li>
    </ul>
    <div class="buttons">
      <slot name="footer">
        <div
          v-for="b in buttons"
          :key="b.key"
          @click="handleButtonClick(b.key)"
        >
          <i :class="b.icon"></i>
          <span>{{ b.name }}</span>
        </div>
      </slot>
    </div>
    <div
      slot="reference"
      class="ee-select__selected text-ellipsis"
      :style="styleObj"
    >
      <i v-if="selectedObj.icon" :class="selectedObj.icon"></i>
      <span
        class="ee-select__text"
        :class="{
          disabled: disabled,
          'disabled-effect': disabled && disabledEffect
        }"
      >
        {{ selectedObj.label || placeholder }}
      </span>
      <span v-if="!disabled" class="ee-select__suffix">
        <i
          :class="{
            'el-icon-caret-top': expanded,
            'el-icon-caret-bottom': !expanded
          }"
        ></i>
      </span>
    </div>
  </el-popover>
</template>

<script>
export default {
  name: 'EeSelect',
  model: {
    prop: 'selected',
    event: 'change'
  },
  props: {
    selected: {
      type: [Number, String]
    },
    options: {
      type: Array,
      default: () => []
    },
    buttons: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    disabledEffect: {
      type: Boolean,
      default: true
    },
    trigger: {
      type: String,
      default: 'click'
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    visibleArrow: {
      type: Boolean,
      default: false
    },
    width: {
      type: [String, Number],
      default: 'auto'
    },
    loading: {
      type: Boolean,
      default: false
    },
    objectValue: {
      // 是否切换时返回选中值对象
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedObj: { label: '', value: '' },
      preSelected: '',
      expanded: false,
      styleObj: {
        width: this.width
      }
    }
  },
  watch: {
    selected(val) {
      this.setSelected(val)
    }
  },
  created() {
    this.setSelected(this.selected)
  },
  methods: {
    isActive(val) {
      return this.selected === val
    },
    handleButtonClick(key) {
      this.close()
      this.$emit('button-click', key)
    },
    handleShow() {
      this.expanded = true

      this.$nextTick(() => {
        const optionsRef = this.$refs.optionsRef
        const activeOption =
          optionsRef.getElementsByClassName('option-item active')[0]
        optionsRef.scrollTop = activeOption ? activeOption.offsetTop : 0
      })

      this.$emit('show')
    },
    handleHide() {
      this.expanded = false
      this.$emit('hide')
    },
    handleOptionClick(option) {
      const val = option.value
      if (this.preSelected !== val || val === '') {
        this.preSelected = val
        this.setSelected(val)
        this.$emit('change', this.objectValue ? option : val)
      }
      this.close()
    },
    setSelected(sel) {
      const selected = this.options.find((x) => x.value === sel)
      if (selected) {
        this.selectedObj = { ...selected }
      } else {
        this.selectedObj = { label: '', value: '' }
      }
    },
    close() {
      this.$refs.thePopoverRef.doClose()
    }
  }
}
</script>

<style lang="scss">
$select-font-size: 14px;
$option-font-size: 12px;
$option-height: 32px;
$option-line-height: 17px;
$selected-height: 28px;
$base-gap: 8px;

.ee-select {
  margin-top: 0 !important;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 2px;
  box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.2);
  padding: 0;

  .text-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  ol,
  ul,
  li {
    list-style: none;
    margin: 0;
    padding: 0;
    border: 0;
    box-sizing: border-box;
    vertical-align: middle;
    font-weight: 100%;
    font-style: normal;
  }

  .select-content {
    min-width: 80px;
    max-height: 380px;
    overflow: auto;

    .option-item {
      font-size: $option-font-size;
      cursor: pointer;
      height: $option-height;
      line-height: $option-line-height;
      color: #202d41;
      padding: $base-gap;
      text-align: left;

      &:hover {
        background-color: #f5f7fa;
      }

      &.active {
        background: #f6f7fa;
        color: #0364ff;
      }
    }

    .buttons {
      position: sticky;
      bottom: 0;
      background: #fff;
      width: 100%;
      border-top: 1px solid #dadfe7;

      & > div {
        padding: 8px 0 4px 8px;
        cursor: pointer;
        font-size: $option-font-size;

        &:hover {
          background-color: #f5f7fa;
        }

        span {
          margin: 4px;
        }
      }
    }
  }
}

.ee-select__selected {
  position: relative;
  cursor: pointer;
  height: $selected-height;
  line-height: $selected-height;
  display: inline-block;
  padding: 0 $base-gap;
  font-size: $select-font-size;

  .ee-select__text {
    margin-right: $base-gap * 2;

    &.disabled {
      padding: 3px 8px;
      cursor: initial;
    }

    &.disabled-effect {
      background-color: #f2f4f6;
      cursor: not-allowed;
    }
  }

  .ee-select__suffix {
    display: inline-block;
    position: absolute;
    right: 0;

    i {
      color: #c6c9ce;
    }
  }

  &:hover {
    .ee-select__suffix {
      i {
        color: #202d41;
      }
    }
  }
}
</style>
