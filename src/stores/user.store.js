import { defineStore } from 'pinia'
import actions from '@/utils/actions.util'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      id: '',
      name: ''
    }
  }
})
