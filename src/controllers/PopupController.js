export default class PopupController {
    constructor({ api, axios, chromeHelper }) {
        this.api = api;
        this.axios = axios;
        this.chromeHelper = chromeHelper;
    }

    async login() {
        const username = await this.chromeHelper.getStorageItem('username')
        const password = await this.chromeHelper.getStorageItem('password')

        let params = {
            "username": username,
            "password": password,
            "locale": "vi",
            "remember": false
        }

        let dataObj = await this.api.login(this, params)

        if (dataObj.success) {
            console.log('Token is refresh!!!');
            await this.chromeHelper.setStorageItem({ 'apiToken': dataObj.data.token })
        } else {
            console.error("Error", dataObj.message)
        }

        return dataObj
    }

    async loginKintai() {
        let params = {
            locale: 'vi',
            token: await this.chromeHelper.getStorageItem('apiToken')
        }

        let dataObj = await this.api.loginKintai(this, params)

        if (dataObj.success) {
            await this.chromeHelper.setStorageItem({ 'apiTokenKintai': dataObj.data.api_token })
            console.log('kintai token is refresh!!!');
        } else {
            console.error("Error", dataObj.message)
        }

        return dataObj
    }

    async syncKintaiStatus() {
        let dataObj = await this.api.getKintaiStatus(this)

        if (dataObj.success) {
            const { checkin: canCheckIn, checkout: canCheckOut } = dataObj.data

            let saveItems = {
                isCheckedIn: !canCheckIn,
                isCheckedOut: !canCheckIn && !canCheckOut
            }

            await this.chromeHelper.setStorageItem(saveItems)
        } else {
            console.log("Error", dataObj.message)
        }

        return dataObj
    }

    async checkIn() {
        let params = {
            "type_log": 1,
            "latitude": 10.7872923,
            "longitude": 106.6852646
        }

        let dataObj = await this.api.changeKintaiStatus(this, params)

        if (dataObj.success) {
            // Set checkin timestamp
            await this.chromeHelper.setStorageItem({ checkedInDatetime: (new Date()).toLocaleDateString() })
        } else {
            console.error("Error", dataObj.message)
        }

        return dataObj
    }

    async checkOut() {
        let params = {
            "type_log": 2,
            "latitude": 10.7872923,
            "longitude": 106.6852646
        }

        let dataObj = await this.api.changeKintaiStatus(this, params)

        if (dataObj.success) {
            // Save checkout timestamp
            await this.chromeHelper.setStorageItem({ checkedOutDatetime: (new Date()).toLocaleDateString() })
        } else {
            console.error("Error", dataObj.message)
        }

        return dataObj
    }

    async refreshToken() {
        console.log('start refresh token');

        await this.login()
        await this.loginKintai()

        console.log('end refresh token');
    }

    /**
   * Should check in
   * @param {Date} now 
   * @returns 
   */
    async shouldCheckIn(now) {
        const isAutoCheckIn = await this.chromeHelper.getStorageItem('isAutoCheckIn')
        if (isAutoCheckIn == false) {
            return false
        }

        // Checked in mark timestamp for reduce api call
        let checkedInDatetime = await this.chromeHelper.getStorageItem('checkedInDatetime')
        if (checkedInDatetime && checkedInDatetime === now.toLocaleDateString()) {
            return false
        }

        // Whether it can check in
        const isCheckedIn = await this.chromeHelper.getStorageItem('isCheckedIn')
        if (isCheckedIn == true) {
            return false
        }

        // For first installation, call api further to check kintai status
        if (now.getHours() == 7 && now.getMinutes() <= 30) {
            return false
        }

        return true
    }

    /**
     * Should check out
     * @param {Date} now 
     * @returns 
     */
    async shouldCheckOut(now) {
        const isAutoCheckOut = await this.chromeHelper.getStorageItem('isAutoCheckOut')
        if (isAutoCheckOut == false) {
            return false
        }

        // Checked in mark timestamp for reduce api call
        let checkedOutDatetime = await this.chromeHelper.getStorageItem('checkedOutDatetime')
        if (checkedOutDatetime && checkedOutDatetime === now.toLocaleDateString()) {
            return false
        }

        if (now.getHours() < 17) {
            return false
        }

        // Whether it can check in
        const isCheckedOut = await this.chromeHelper.getStorageItem('isCheckedOut')
        if (isCheckedOut == true) {
            return false
        }

        return true
    }
  
    /**
     * Approve working time
     * @returns
     */
    async approveWorking() {
        let params = {
            date_log: DateUtil.formatHyphen(DateUtil.getCurrentDate()),
            employee_id: '367',
            prev_time_log: null,
            button_status: 'button_accept',
        }

        let dataObj = await this.api.approveWorking(this, params)
        if (dataObj.success) {
        }

        return dataObj
    }
}
