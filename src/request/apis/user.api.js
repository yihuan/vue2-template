import { getRequest } from '@/request/http'
import urls from '@/request/urls'

export default {
  // 获取登录用户
  getCurrentUser(params) {
    return getRequest({
      url: urls.user.getCurrentUser,
      params
    })
  }
}
