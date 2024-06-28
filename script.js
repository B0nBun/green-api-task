const form = document.getElementById("green-api-form")
const responseBox = document.getElementById("response-box")
const responseBody = responseBox.querySelector("#response-body")
const statusElem = responseBox.querySelector("#status")

const buttons = {
    getSettings: form.querySelector("[name='get-settings']"),
    getStateInstance: form.querySelector("[name='get-state-instance']"),
    sendMessage: form.querySelector("[name='send-message']"),
    sendFileByUrl: form.querySelector("[name='send-file-by-url']"),
}

form.querySelector("[name='id-instance']").value = localStorage.getItem("id-instance") ?? ""
form.querySelector("[name='api-token-instance']").value = localStorage.getItem("api-token-instance") ?? ""

/**
 * @param {string} method 
 * @returns {URL}
 */
function urlFromMethod(method) {
    const formData = new FormData(form)
    const idInstance = formData.get("id-instance")
    const apiTokenInstance = formData.get("api-token-instance")
    localStorage.setItem("id-instance", idInstance)
    localStorage.setItem("api-token-instance", apiTokenInstance)
    const url = new URL(`https://api.green-api.com/waInstance${idInstance}/${method}/${apiTokenInstance}`)
    return url
}

/**
 * @returns {string}
 */
function getChatId() {
    const formData = new FormData(form)
    const chatId = formData.get("chat-id")
    const chatIdSuffix = formData.get("chat-id-suffix")
    return chatId + chatIdSuffix
}

/**
 * @param {Response} response 
 */
async function displayResponse(response) {
    try {
        const parsed = await response.json()
        statusElem.textContent = response.status == 200 ? "ok" : "error"
        responseBody.textContent = JSON.stringify(parsed, null, 4)
    } catch (e) {
        statusElem.textContent = "error"
        responseBody.textContent = `Error with status: ${response.status}`
    }
}

function displayLoading() {
    statusElem.textContent = "loading"
    responseBody.textContent = "..."
}

buttons.getSettings.addEventListener("click", () => {
    const url = urlFromMethod("getSettings")
    displayLoading()
    fetch(url).then(displayResponse)
})

buttons.getStateInstance.addEventListener("click", () => {
    const url = urlFromMethod("getStateInstance")
    displayLoading()
    fetch(url).then(displayResponse)
})

buttons.sendMessage.addEventListener("click", () => {
    const formData = new FormData(form)
    const chatId = getChatId()
    const message = formData.get("message")
    const url = urlFromMethod("sendMessage")
    displayLoading()
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chatId,
            message,
        })
    })
        .then(displayResponse)
})

buttons.sendFileByUrl.addEventListener("click", () => {
    const formData = new FormData(form)
    const chatId = getChatId()
    const urlFile = formData.get("url-file")
    const fileName = formData.get("file-name")
    const url = urlFromMethod("sendFileByUrl")
    displayLoading()
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chatId,
            urlFile,
            fileName,
        })
    })
        .then(displayResponse)
})
