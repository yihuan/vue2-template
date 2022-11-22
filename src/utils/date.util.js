import dayjs from 'dayjs'

/**
 * 格式化日期
 * Available formats:
 * https://day.js.org/docs/en/display/format
 * @param {Number|Date|String} date
 * @param {String} formatStr, 'timestamp' 返回时间戳
 * @returns String
 */
export function formatDate(date, formatStr = 'YYYY-MM-DD') {
  if (!date) return ''

  if (formatStr == 'timestamp') {
    return dayjs(date).valueOf()
  }

  return dayjs(date).format(formatStr)
}
