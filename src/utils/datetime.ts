import dayjs from 'dayjs'

export const dateToISO = (date: string) => {
  return dayjs(date, 'YYYY-MM-DD').toISOString()
}

export const dateTimeToISO = (datetime: string) => {
  return dayjs(datetime, 'YYYY-MM-DD HH:mm:ss').toISOString()
}

/**
 * 根据startTimeField, endTimeField和当前时间更新对象的时间状态timeStatus,0：未开始，1：进行中，2：已结束
 * @param obj
 * @param startTimeField
 * @param endTimeField
 */
export function addTimeStatus<T>(obj, startTimeField, endTimeField): T & { timeStatus: 0 | 1 | 2 } {
  obj.timeStatus =
    dayjs().isAfter(obj[startTimeField]) && dayjs().isBefore(obj[endTimeField])
      ? 1
      : dayjs().isAfter(obj[endTimeField])
        ? 2
        : 0
  return obj
}
