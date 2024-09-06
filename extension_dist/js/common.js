const DATA_DELIMITER = "|"


/*
    action id between components
*/

const ACTION_ID_RELOAD_PAGE = "reload_page"
const ACTION_ID_LOAD_DATA = "load_data"
const ACTION_ID_ADD_SELECTED_DATA = "add_selected_data"

/*
    key for browser storage
*/
const KEY_STORAGE_EXPORT_DATA = "export_data"
const KEY_STORAGE_SETTING_SAVE_DATA = "option_save_data"


const exportDataHeader = "SN|date|tracking_number|companyName|itemName|quantity|quantity|itemPrice|exportStatus|orderId";
const dom_extensionFlag = "data-extension";

let popupWin = undefined

async function showData() {

    let exportDataFromStore = "";
    await browser.storage.local.get(KEY_STORAGE_EXPORT_DATA).then(
        resp => {
            // console.log("data return from store");
            exportDataFromStore = resp[KEY_STORAGE_EXPORT_DATA];
        }
    );

    let contentBody = "";

    if (exportDataFromStore == undefined || exportDataFromStore?.length == 0) {
        contentBody = "No Data";
        console.log("no data");
    } else {

        contentBody += `${exportDataHeader} <br />`
        Object.entries(exportDataFromStore).forEach(([orderId, element], index) => {
            contentBody += [index + 1, element, orderId].join(DATA_DELIMITER)
            contentBody += "<br />"
        });
    }

    const winHtml = `<!DOCTYPE html>
        <html>
            <head>
                <title>Summary</title>
                 <meta charset="UTF-8">
            </head>
            <body>
                <h1>pipe [ ${DATA_DELIMITER} ] delimited</h1>
                <div>
                ${contentBody}
                </div>
            </body>
        </html>`;

    const winUrl = URL.createObjectURL(
        new Blob([winHtml], {type: "text/html"})
    );

    popupWin = window.open(winUrl, "_blank");
//    console.log("popup win ", popupWin, typeof popupWin)
//
//    if (popupWin != undefined && !Components.utils.isDeadWrapper(window)) {
//        popupWin.location.href = winUrl;
//    } else {
//        popupWin = window.open(winUrl, "_blank");
//    }

}
