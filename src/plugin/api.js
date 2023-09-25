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
            .catch(handleError)

    console.warn('END API: ', url);

    return result
}

async function handleError(error) {
    console.error('    Error:', error);
    throw error
}

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
