// https://day.js.org/
import dayjs from 'dayjs'

export default function date(date, formatStr) {
  if (!date || date === '--') {
    return date
  }
  // Available formats: https://day.js.org/docs/en/display/format
  return dayjs(date).format(formatStr || 'MM-DD HH:mm')
}
