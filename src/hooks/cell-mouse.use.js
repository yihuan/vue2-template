import { ref } from 'vue'

export function useCellMouse() {
  const currentRow = ref({})

  function handleCellMouseEnter(row) {
    currentRow.value = { ...row }
  }

  function handleCellMouseLeave(row) {
    currentRow.value = { ...row }
  }

  return {
    currentRow,
    handleCellMouseEnter,
    handleCellMouseLeave
  }
}
