import { getStorageItem } from './ChromeApiHelper'
import { callGet, callPost } from './plugin/api'

const HITO_DOMAIN = 'https://hito.lampart-vn.com'
const HITO_KINTAI_DOMAIN = 'https://backend-kintai-hito.lampart-vn.com'

export default {
    // API Url
    API_CHECK_TOKEN: HITO_DOMAIN + '/backend/v1/check_token',
    API_LOGIN: HITO_DOMAIN + '/backend/v1/login',
    API_KINTAI_LOGIN: HITO_KINTAI_DOMAIN + '/api/v1/user/login',
    API_KINTAI_STATUS: HITO_KINTAI_DOMAIN + '/api/v1/timestamp/clock',

    // Check token
    async isValidToken() {

        const isValid = await new Promise(async (resolve, reject) => {
            let isValid = false;

            await callGet(this.API_CHECK_TOKEN)
                .then(res => {
                    // If It has data => token is valid
                    // Otherwise      => token is invalid
                    isValid = res.status == 200 && res.data.success

                    resolve(isValid)
                })
                .catch(err => resolve(isValid))
        })


        return isValid
    },

    // Login
    async login(params) {

        return new Promise(async (resolve, reject) => {
            let data = {
                success: false,
                data: null
            }

            await callPost(this.API_LOGIN, params)
                    .then(res => {
                        data = res.data
                        resolve(data)
                    })
                    .catch(e => reject(e))
        })

        
    },

    // Login kintai
    async loginKintai() {

        let params = {
            locale: 'vi',
            token: await getStorageItem('apiToken')
        }

        return new Promise(async (resolve, reject) => {
            let data = {
                success: false,
                data: null
            }

            await callPost(this.API_KINTAI_LOGIN, params)
                    .then(res => {
                        data = res.data
                        resolve(data)
                    })
                    .catch(e => reject(e))
        })

    },

    // Get kintai status
    async getKintaiStatus() {

        const result = await new Promise(async (resolve, reject) => {
            let data = {
                success: false,
                data: null
            }

            await callGet(this.API_KINTAI_STATUS, { isKintaiSystem: true })
                    .then(res => {
                        data = res.data
                        resolve(data)
                    })
                    .catch(e => Promise.reject(e))
        })

        
        return result
    },

    // Change kintai status
    async changeKintaiStatus(params) {

        const result = await new Promise(async (resolve, reject) => {
            let data = {
                success: false,
                data: null
            }

            await callPost(this.API_KINTAI_STATUS, params, { isKintaiSystem: true })
                .then(res => {
                    data = res.data
                    resolve(data)
                })
                .catch(err => {
                    // Whether it is already checked in, return as normal result
                    if (err.response?.status == 403) {
                        data.success = true
                        resolve(data)
                    }

                    reject(err)
                })
        })

        return result
    }
}