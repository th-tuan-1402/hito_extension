export default class DateUtil {
  /**
   * Get current date
   * @returns Date
   */
  static getCurrentDate() {
    let now = dayjs().format("YYYY/MM/DD");

    return dayjs(now).toDate();
  }

  /**
   * Format as hyphen string
   * @param {*} date
   * @returns
   */
  static formatHyphen(date) {
    return dayjs(date).format("YYYY-MM-DD");
  }
}
