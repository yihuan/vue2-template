import MessageBox from 'element-ui/lib/message-box'
import Message from 'element-ui/lib/message'

export { MessageBox, Message }

/**
 *
 * @param {String} message - 提示内容
 * @param {String} title - 标题
 * @param {Object} options - 配置选项
 */
export function confirm(message, title = '确认', options) {
  return new Promise((resolve, reject) => {
    MessageBox.confirm(message, title, { type: 'warning', ...options })
      .then(resolve)
      .catch(reject)
  })
}
