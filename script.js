/**
 * @type {import("./selectElement.d.ts").selectElement}
 */
function selectElement(selector, elementType) {
    const element = document.querySelector(selector);
    if (element && element instanceof elementType) {
        return element;
    }
    throw new Error(
        `Selected element had an unexpected type: expected ${elementType} from ${element}`,
    );
}

/**
 * 
 * @param {FormData} formData 
 * @param {string} key 
 * @returns {string}
 */
function formDataGetString(formData, key) {
    const value = formData.get(key)
    if (typeof value != "string") {
        throw new Error(`Expected a string from formData, but got ${typeof value}`)
    }
    return value
}

const form = selectElement("#green-api-form", HTMLFormElement)
const responseBody = selectElement("#response-body", HTMLElement)
const statusElem = selectElement("#status", HTMLElement)

/** @readonly */
const buttons = {
    getSettings: selectElement("#green-api-form [name='get-settings']", HTMLButtonElement),
    getStateInstance: selectElement("#green-api-form [name='get-state-instance']", HTMLButtonElement),
    sendMessage: selectElement("#green-api-form [name='send-message']", HTMLButtonElement),
    sendFileByUrl: selectElement("#green-api-form [name='send-file-by-url']", HTMLButtonElement),
}

selectElement("#green-api-form [name='id-instance']", HTMLInputElement).value = localStorage.getItem("id-instance") ?? ""
selectElement("#green-api-form [name='api-token-instance']", HTMLInputElement).value = localStorage.getItem("api-token-instance") ?? ""

/**
 * @param {string} method 
 * @returns {URL}
 */
function urlFromMethod(method) {
    const formData = new FormData(form)
    const idInstance = formDataGetString(formData, "id-instance")
    const apiTokenInstance = formDataGetString(formData, "api-token-instance")
    localStorage.setItem("id-instance", idInstance)
    localStorage.setItem("api-token-instance", apiTokenInstance)
    const url = new URL(`https://api.green-api.com/waInstance${idInstance}/${method}/${apiTokenInstance}`)
    return url
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
    const chatId = formDataGetString(formData, "chat-id-message") + formDataGetString(formData, "chat-id-suffix-message")
    const message = formDataGetString(formData, "message")
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
    const chatId = formDataGetString(formData, "chat-id-message") + formDataGetString(formData, "chat-id-suffix-message")
    const urlFile = formDataGetString(formData, "url-file")
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
