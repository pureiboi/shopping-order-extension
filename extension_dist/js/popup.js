const permissionsToRequest = {
    // origins: ["*://*.taobao.com/*"]
    // permissions: ["activeTab"],
    origins: ["<all_urls>", "*://*.buyertrade.taobao.com/*"]
}

const btnGetPermission = $('#btn_get_permission')
const btnRevokePermission = $('#btn_revoke_permission')
const btnStorage = $('#btn_storage')
const btnReloadPage = $('#btn_reload_page')
const btnLoadData = $('#btn_load_data')
const btnAddData = $('#btn_add_data')
const btnShowData = $('#btn_show_data')
const btnSetting = $('#btn_setting')
const txtAbout = $('#about_data')

async function checkPermission() {
    hasRequiredPermission().then(granted => {
        btnGetPermission.hide()
        btnRevokePermission.hide()
        if (granted) {
            btnRevokePermission.show()
        } else {
            btnGetPermission.show()
        }
    })
}


async function revokePermission() {
    // console.log("revokePermission");
    try {
        return await browser.permissions.remove(permissionsToRequest);
    } catch (e) {
        // While Chrome allows granting of host_permissions that have manually
        // been revoked by the user, it fails when revoking them, with
        // "Error: You cannot remove required permissions."
        console.error(e);
    }
}

async function hasRequiredPermission() {
    return await browser.permissions.contains(permissionsToRequest)
}

btnGetPermission.on("click", async () => {
    await browser.permissions.request(permissionsToRequest).then(_ => {
        checkPermission()
    })
})


btnRevokePermission.on("click", async () => {
    await revokePermission().then(checkPermission())
})


btnStorage.on("click", async () => {
    browser.storage.local.remove(KEY_STORAGE_EXPORT_DATA);
});


btnShowData.on("click", async () => {
    await showData();
});


btnLoadData.on("click", async () => {
    browser.tabs
        .query({
            currentWindow: true, active: true,
        })
        .then((tabs) => {
            for (const tab of tabs) {
                browser.tabs
                    .sendMessage(tab.id, {action: ACTION_ID_LOAD_DATA})
                    .then((response) => {
                        console.log("load data ", response.response);
                    })
                    .catch(onError);
            }
        }).catch(onError);
})


btnReloadPage.on("click", async () => {
    browser.tabs
        .query({
            currentWindow: true, active: true,
        })
        .then((tabs) => {
            for (const tab of tabs) {
                browser.tabs
                    .sendMessage(tab.id, {action: ACTION_ID_RELOAD_PAGE})
                    .then((response) => {
                        console.log("reloaded page ", response.response);
                    })
                    .catch(onError);
            }
        }).catch(onError);
})


btnAddData.on("click", async () => {
    browser.tabs
        .query({
            currentWindow: true, active: true,
        })
        .then((tabs) => {
            for (const tab of tabs) {
                browser.tabs
                    .sendMessage(tab.id, {action: ACTION_ID_ADD_SELECTED_DATA})
                    .then((response) => {
                        console.log("add selected data ", response.response);
                    })
                    .catch(onError);
            }
        }).catch(onError);
})

function onError(error) {
    console.error(`Error: ${error}`);
}

btnSetting.on("click", () => {
    browser.runtime.openOptionsPage().catch(onError);
})

function init() {
    // about text
    let manifest = browser.runtime.getManifest();
    txtAbout.text("v" + manifest.version);

    checkPermission()

}

init()
