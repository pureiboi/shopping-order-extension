const DATA_DELIMITER = ";"

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

const exportDataHeaderArray = ["SN", "date", "tracking_number", "companyName", "itemName", "quantity", "quantity", "itemPrice", "exportStatus", "orderId"];
const exportDataHeader = exportDataHeaderArray.join(DATA_DELIMITER);
const dom_extensionFlag = "data-extension";

let popupWin = undefined

async function showData() {

    let exportDataFromStore = "";
    await browser.storage.local.get(KEY_STORAGE_EXPORT_DATA).then(
        resp => {
            console.log("data return from store");
            exportDataFromStore = resp[KEY_STORAGE_EXPORT_DATA];
        }
    );

    let contentBody = "No Data";
    let summaryData = "No Data";
    let summaryDataObject = {};


    if (Object.keys(exportDataFromStore).length > 0) {
        contentBody = ""
        summaryData = ""
        console.log("export data size", Object.keys(exportDataFromStore).length)
        contentBody += `${exportDataHeader} <br />`
        Object.entries(exportDataFromStore).forEach(([orderId, element], index) => {

            let dataLine = [index + 1, element, orderId].join(DATA_DELIMITER)
            contentBody += dataLine
            contentBody += "<br />"

            let dataArray = dataLine.split(DATA_DELIMITER)

            let dataObj = dataToObject(exportDataHeaderArray, dataArray)
            let objectKey = dataObj["exportStatus"]

            if (!summaryDataObject.hasOwnProperty(objectKey)) {
                summaryDataObject[objectKey] = 0
            }
            summaryDataObject[objectKey] += 1
        });

        Object.entries(summaryDataObject).forEach(([key, val])=> {
            summaryData += `${key} : ${val} <br/>`
        })
    }

    const winHtml = `<!DOCTYPE html>
        <html>
            <head>
                <title>Summary</title>
                 <meta charset="UTF-8">
            </head>
            <body>
                <h1>CSV [ ${DATA_DELIMITER} ] delimited</h1>
                <h2>Summary</h2>
                
                <div>
                   ${summaryData}
                </div>
                
                <h2>Content</h2>
                
                <div>
                ${contentBody}
                </div>
            </body>
        </html>`;

    const winUrl = URL.createObjectURL(
        new Blob([winHtml], {type: "text/html"})
    );

    popupWin = window.open(winUrl, "_blank");
}
