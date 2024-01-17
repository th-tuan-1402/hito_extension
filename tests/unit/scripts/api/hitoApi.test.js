import hitoApi from '../../../../src/scripts/api/hitoApi'

let commonInputs = {
  OK: {
    axios: {
      async get() {
        return Promise.resolve(commonResult.OK_RESULT)
      },
      async post() {
        return Promise.resolve(commonResult.OK_RESULT)
      },
    },
    hitoApi
  },
  NG: {
    axios: {
      async get() {
        return Promise.reject(commonResult.NG_EXCEPTION_RESULT)
      },
      async post() {
        return Promise.reject(commonResult.NG_EXCEPTION_RESULT)
      },
    },
    hitoApi,
  },
}

let commonResult = {
  NG_EXCEPTION_RESULT: 'NG',
  NG_UNAUTHOZIRED_EXCEPTION: { response: {status: 403}},
  NG_UNAUTHOZIRED_RESULT: { success: true, data: null },
  OK_RESULT: { success: true, data: 'OK' },
}

const testCases = [
  [
    'login - OK',
    commonInputs.OK,
    async ({ axios, hitoApi }) => await hitoApi.login({ axios }),
    async (output) => await expect(output).toBe(commonResult.OK_RESULT.data),
  ],
  [
    'login - NG - exception occursion',
    {
      isOkCase: false,
      ...commonInputs.NG
    },
    async ({ axios, hitoApi }) => await hitoApi.login({ axios }),
    async (output) => await expect(output).toBe(commonResult.NG_EXCEPTION_RESULT),
  ],
  [
    'login kintai - OK',
    commonInputs.OK,
    async ({ axios, hitoApi }) => await hitoApi.loginKintai({ axios }),
    async (output) => await expect(output).toBe(commonResult.OK_RESULT.data),
  ],
  [
    'login kintai - NG - exception occursion',
    {
      isOkCase: false,
      ...commonInputs.NG
    },
    async ({ axios, hitoApi }) => await hitoApi.loginKintai({ axios }),
    async (output) => await expect(output).toBe(commonResult.NG_EXCEPTION_RESULT),
  ],
  [
    'get kintai status - OK',
    commonInputs.OK,
    async ({ axios, hitoApi }) => await hitoApi.getKintaiStatus({ axios }),
    async (output) => await expect(output).toBe(commonResult.OK_RESULT.data),
  ],
  [
    'get kintain status - NG - exception occursion',
    {
      isOkCase: false,
      ...commonInputs.NG
    },
    async ({ axios, hitoApi }) => await hitoApi.getKintaiStatus({ axios }),
    async (output) => await expect(output).toBe(commonResult.NG_EXCEPTION_RESULT),
  ],
  [
    'change kintai status - OK',
    commonInputs.OK,
    async ({ axios, hitoApi }) => await hitoApi.changeKintaiStatus({ axios }),
    async (output) => await expect(output).toBe(commonResult.OK_RESULT.data),
  ],
  [
    'change kintai status - NG - exception occursion',
    {
      isOkCase: false,
      ...commonInputs.NG
    },
    async ({ axios, hitoApi }) => await hitoApi.changeKintaiStatus({ axios }),
    async (output) => await expect(output).toBe(commonResult.NG_EXCEPTION_RESULT),
  ],
  [
    'change kintai status - OK - already checked in',
    {
      isOkCase: false,
      ...commonInputs.NG,
      axios: {
        async post() {
          return Promise.reject(commonResult.NG_UNAUTHOZIRED_EXCEPTION)
        },
      },
    },
    async ({ axios, hitoApi }) => await hitoApi.changeKintaiStatus({ axios }),
    async (output) => await expect(output.data).toBe(commonResult.NG_UNAUTHOZIRED_RESULT.data),
  ],
  [
    'approve working - OK',
    commonInputs.OK,
    async ({ axios, hitoApi }) => await hitoApi.approveWorking({ axios }),
    async (output) => await expect(output).toBe(commonResult.OK_RESULT.data),
  ],
  [
    'approve working - NG - exception occursion',
    {
      isOkCase: false,
      ...commonInputs.NG
    },
    async ({ axios, hitoApi }) => await hitoApi.approveWorking({ axios }),
    async (output) => await expect(output).toBe(commonResult.NG_EXCEPTION_RESULT),
  ],
]

describe('test api', function () {
  for (const [name, { isOkCase = true, ...input }, action, assert] of testCases) {
    test(name, async function () {
      try {
        console.warn('Status OK')

        let output = await action(input)
        console.warn('output', output)

        assert(output)
      } catch (err) {
        console.warn('Status NG')
        if (!isOkCase) {
          assert(err)
        }
      }
    })
  }
})
