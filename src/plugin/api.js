import { refreshToken } from "../hitoCommonApi";

const { getStorageItem } = require("../ChromeApiHelper")

export async function callGet(url, config) {
    return await _callApi('GET', url, null, config)
} 
export async function callPost(url, params, config) {
    return await _callApi('POST', url, params, config)
}

async function _callApi(method='GET', url, params, config) {
    console.warn('START API: ', url);

    // Add api token
    const tokenName = config?.isKintaiSystem ? 'apiTokenKintai' : 'apiToken'
    const apiToken = await getStorageItem(tokenName)

    const requestConfig = {
        method: method,
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
        timeout: 600000 // Set timeout as 10 minutes
    }

    if (method === 'POST') {
        requestConfig.body = JSON.stringify(params)
    }

    const result = await fetch(url, requestConfig)
            .then(handleResponse)
            .catch(error => handleError(error, requestConfig))

    console.warn('END API: ', url);

    return result
}

/**
 * Handle request error
 * @param {*} error 
 */
async function handleError(error, requestConfig) {
    console.error('    Error:', error);

    if (error.response.status !== 401) {
        throw error
    }

    return await retryRequest(error.response.url, requestConfig)
}

/**
 * Retry request
 * @param {*} url 
 * @param {*} requestConfig 
 * @returns 
 */
async function retryRequest(url, requestConfig) {
    const attemptCount = 1 // Retry 3 times
    while (attemptCount < 4) {
        try {
            await refreshToken()
            const result = await fetch(url, requestConfig)

            console.error('RETRY ', url, ' ', attemptCount, ' success');
            return result
        } catch {
            // skip error
        }
    }

    Promise.reject('RETRY '+ url + ' ' + attemptCount + ' fail')
}

/**
 * Handle respone
 * @param {Response} res 
 * @returns 
 */
async function handleResponse(res) {
    console.warn('    Response: ', res);

    // On success
    if (res.ok && res.status === 200) {
        return {
            success: res.ok,
            data: res.json()
        } 
    }

    // On fail
    throw {
        response: res
    }
}