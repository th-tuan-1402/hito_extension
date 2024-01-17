const HITO_DOMAIN = 'https://hito.lampart-vn.com'
const HITO_KINTAI_DOMAIN = 'https://backend-kintai-hito.lampart-vn.com'

export default {
    // API Url
    API_CHECK_TOKEN: HITO_DOMAIN + '/backend/v1/check_token',
    API_LOGIN: HITO_DOMAIN + '/backend/v1/login',
    API_KINTAI_LOGIN: HITO_KINTAI_DOMAIN + '/api/v1/user/login',
    API_KINTAI_STATUS: HITO_KINTAI_DOMAIN + '/api/v1/timestamp/clock',
    API_KINTAI_APPROVE_WOKING: HITO_KINTAI_DOMAIN + "/api/v1/timestamp/working-time/works/approve-working",

    // Login
    async login({ axios }, params) {
        return new Promise(async (resolve, reject) => {
            let data = {
                success: false,
                data: null
            }

            await axios.post(this.API_LOGIN, params)
                .then(res => {
                    data = res.data
                    resolve(data)
                })
                .catch(e => reject(e))
        })
    },

    // Login kintai
    async loginKintai({ axios }, params) {
        return new Promise(async (resolve, reject) => {
            let data = {
                success: false,
                data: null
            }

            await axios.post(this.API_KINTAI_LOGIN, params)
                .then(res => {
                    data = res.data
                    resolve(data)
                })
                .catch(e => reject(e))
        })
    },

    // Get kintai status
    async getKintaiStatus({ axios }) {
        return await new Promise((resolve, reject) => {
            let data = {
                success: false,
                data: null
            }

            axios.get(this.API_KINTAI_STATUS, { isKintaiSystem: true })
                .then(res => {
                    data = res.data
                    resolve(data)
                })
                .catch(e => reject(e))
        })
    },

    // Change kintai status
    async changeKintaiStatus({ axios }, params) {
        return await new Promise((resolve, reject) => {
            let data = {
                success: false,
                data: null
            }

            axios.post(this.API_KINTAI_STATUS, params, { isKintaiSystem: true })
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
    },

    // Aprove wokring time
    async approveWorking({ axios }, params) {
        return await new Promise((resolve, reject) => {
        let data = {
            success: false,
            data: null,
        };

        axios
            .post(this.API_KINTAI_APPROVE_WOKING, params, { isKintaiSystem: true })
            .then((res) => {
            data = res.data;
            resolve(data);
            })
            .catch((err) => {
            reject(err);
            });
        });
    },
}
