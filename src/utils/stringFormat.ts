export default class String {
  public static Empty: string = '';

  public static isNullOrWhiteSpace(value: string): boolean {
    try {
      if (value === undefined || value === '') return false;
      else return true;
    } catch (e) {
      return false;
    }
  }
  public static getYYYYMMDD(date: Date) {
    let mm = date.getMonth() + 1; // getMonth() bắt đầu từ 0
    let dd = date.getDate();
    return Number.parseInt([date.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join(''));
  }
}
