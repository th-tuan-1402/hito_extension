import ChromeHelper from './helpers/ChromeHelper';
import api from './scripts/api/hitoApi'
import { install } from './plugin/axios';
import PopupController from './controllers/PopupController';

const chromeHelper = new ChromeHelper(chrome);
const axios = install({ chromeHelper })
const controller = new PopupController({ api, axios, chromeHelper });

// The async IIFE is necessary because Chrome <89 does not support top level await.
(async function initPopupWindow() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.url) {
    try {
      let url = new URL(tab.url);
      input.value = url.hostname;
    } catch {
      // ignore
    }
  }

  setInterval(updateClockLabel, 1000)

  await updateStatus(true)
})();

function updateClockLabel() {
  const timeLabel = document.getElementById('timeLabel')
  let now = new Date()
  const dateTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0') + ":" + now.getSeconds().toString().padStart(2, '0')
  timeLabel.innerText = dateTime
}

async function updateStatus(shouldRefreshToken = false) {
  try {
    if (shouldRefreshToken) {
      await controller.refreshToken()
    }
    await controller.syncKintaiStatus()

    updateSaveButtonLabel()
    showSaveButton()
  } catch (e) {
    showErrorMessage("⛔Đồng bộ thất bại")
  }
}

// Show button
function showSaveButton() {
  btnChangeStatus?.classList.remove('hidden')
}

async function updateSaveButtonLabel() {
  // Set change kintai status
  const isCheckedIn = await chromeHelper.getStorageItem('isCheckedIn')
  const isCheckedOut = await chromeHelper.getStorageItem('isCheckedOut')
  const btnChangeStatus = document.getElementById('btnChangeStatus')

  if (!isCheckedIn) {
    btnChangeStatus.innerText = 'Check in'
    btnChangeStatus.addEventListener('click', onCheckIn)
  } else if (!isCheckedOut) {
    btnChangeStatus.innerText = 'Check out'
    btnChangeStatus.addEventListener('click', onCheckOut)
  } else {
    btnChangeStatus.innerText = 'Check in'
    btnChangeStatus.setAttribute('disabled', 'disabled')
    btnChangeStatus?.classList.add('bg-gray-300', 'focus:outline-none')
    btnChangeStatus?.classList.remove('bg-green-500')
  }
}

function showErrorMessage(msg) {
  const errMsgEl = document.getElementById('errMsg')
  errMsgEl.innerText = msg
  errMsgEl.classList.remove('hidden')
}

async function onCheckIn() {
  let isSucceeded = false

  try {
    await controller.refreshToken()

    await controller.checkIn()
      .then(dataObj => {
        if (dataObj.success) {
          // Notify
          chromeHelper.notify('✅Notification', 'You have been checked in')
        } else {
          chromeHelper.notify('⛔Error', 'Fail to check in')
        }
      })

    isSucceeded = true
  } catch (e) {
    // Notify
    chromeHelper.notify('⛔Error', 'Fail to check in')
  }

  // Sync kintai status
  if (isSucceeded) {
    try {
      await updateStatus()
    } catch (error) {
      // Ignore error
    }
  }
}

async function onCheckOut() {
  const now = new Date()

  if (now.getHours() < 17) {
    if (!confirm('Đang trong thời gian làm việc, bạn chắc chứ!!!')) {
      return
    }
  }

  let isSucceeded = false
  try {
    await controller.refreshToken()

    await controller.checkOut()
      .then(dataObj => {
        if (dataObj.success) {
          chromeHelper.notify('✅Notification', 'You have been checked out')
        } else {
          chromeHelper.notify('⛔Error', 'Fail to check out')
        }
      })

    isSucceeded = true
  } catch (e) {
    // Notify
    chromeHelper.notify('⛔Error', 'Fail to check out')
  }

  if (isSucceeded) {
    try {
        let isAutoConfirmWorkingTime = await chromeHelper.getStorageItem('isAutoConfirmWorkingTime')
        if (isAutoConfirmWorkingTime) {
            await controller.approveWorking()
        }
    } catch (e) {
        // Warning
        chromeHelper.notify('⚠️Warnning', 'Fail to approve working time')
    }
  }

  // Sync kintai status
  if (isSucceeded) {
    try {
      await updateStatus()
    } catch (error) {
      // Ignore error
    }
  }
}
