window.onload = (() => {

    document.title += " | loaded extension";

    console.log(document.title);

    // const gettingCurrent = browser.tabs.getCurrent();

    // console.log(gettingCurrent);

    const btnShowDataPageId = "button_show_data"
    const btnIdAddAllData = "button_add_all_data"
    const btnIdAddSelectedData = "button_add_selected_data"
    let refresh = true;
    let observerCount = 0

    let btnShowData = undefined
    let btnAddAllData = undefined
    let btnAddSelectedData = undefined
    let layoutButtonRow = undefined
    let exportDataObject = {}

    let asyncCallCountExpected = 0;
    let asyncCallCount = 0;

    function init() {

        let rootElement = $('#tp-bought-root')
        if (rootElement.length) {

            layoutButtonRow = rootElement.children().eq(5)

            initMenuButton(layoutButtonRow.children().eq(0))
        }


    }

    function initMenuButton(parent) {

        if (btnShowData == undefined) {
            btnShowData = $('<div></div>')
            btnShowData.attr("id", btnShowDataPageId);
            btnShowData.text("Show Data")
            btnShowData.addClass("button-primary");
            btnShowData.addClass("button-primary-page");
            parent.append(btnShowData);
            btnShowData?.on("click", showData)
        }

        if (btnAddAllData == undefined) {
            btnAddAllData = $('<div></div>')
            btnAddAllData.attr("id", btnIdAddAllData);
            btnAddAllData.text("Add All Data in Page")
            btnAddAllData.addClass("button-primary");
            btnAddAllData.addClass("button-primary-page");
            parent.append(btnAddAllData);
            btnAddAllData?.on("click", getOrderDetail)
        }

        if (btnAddSelectedData == undefined) {
            btnAddSelectedData = $('<div></div>')
            btnAddSelectedData.attr("id", btnIdAddSelectedData);
            btnAddSelectedData.text("Add Selected Data")
            btnAddSelectedData.addClass("button-primary");
            btnAddSelectedData.addClass("button-primary-page");
            parent.append(btnAddSelectedData);
            btnAddSelectedData?.on("click", {checkedOnly: true}, getOrderDetail)
        }

    }


    function setupObserver() {
        // Select the node that will be observed for mutations
        const targetNode = document.getElementById("tp-bought-root");

        // Options for the observer (which mutations to observe)
        const config = {attributes: true, childList: true, subtree: true};

        // Callback function to execute when mutations are observed
        const callback = (mutationList, obs) => {

            observerCount += 1;
            let tempExtensionFlag = $('[class^="index-mod__order-container"]').first().attr(dom_extensionFlag);

            // console.log(tempExtensionFlag, observerCount);
            if (tempExtensionFlag == undefined) // true
            {
                console.log("refresh parsing");
                processPage();
            }

        }

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);

    }

    function initLabelStatus(parent) {

        // console.log("append button");
        const newPStatus = document.createElement("p");
        // const newA = document.createElement("a");
        const newDiveStatus = document.createElement("div");

        parent.append(newPStatus);

        newPStatus.append(newDiveStatus);
//        newPStatus.classList.add("label-primary");


        newDiveStatus.classList.add("label-primary");
        newDiveStatus.setAttribute("id", "ext_status");

        newDiveStatus.text = "order status";

        // console.log("append button");
        const newP = document.createElement("p");
        const newA = document.createElement("div");

        parent.append(newP);
        newP.append(newA);

//        newP.classList.add("button_wrapper");
//        newP.classList.add("label-primary");


//        newA.classList.add("button");
        newA.classList.add("label-primary");
        newA.setAttribute("id", "ext_button");

        // newA.innerHTML = "new button";
        newA.text = "new s button";

        // console.log(parent);
    }

    function processPage() {


        if ($("#list-bought-items").length) {
            // console.log("in the right place");

            console.log("total item count ", $('[class^="index-mod__order-container"]').length);
            asyncCallCountExpected = $('[class^="index-mod__order-container"]').length;

            browser.storage.local.get(KEY_STORAGE_SETTING_SAVE_DATA).then(resp => {
                if (resp[KEY_STORAGE_SETTING_SAVE_DATA] === undefined || resp[KEY_STORAGE_SETTING_SAVE_DATA] === true) {
                    getOrderDetail();
                }
            })
        }

    }

    function getOrderDetail(event = null, checkedOnly = false) {

        console.log("process page")

        let checkOnlyFlag = checkedOnly
        if (event?.data?.checkedOnly != undefined) {
            checkOnlyFlag = event.data.checkedOnly
        }

        $('[class^="index-mod__order-container"]').each(function (index) {

//             console.log("process data ", index);

            if (index === 0) {
                $(this).attr(dom_extensionFlag, "true");
            }

            let labelRow = $(this).find('table tbody:first-of-type tr:first-child');

            let itemDate = labelRow.find("td:first-child label:first-child").text();

            // console.log(dateColumn);

            let checkBox = labelRow.find("td:first-child label:first-child span:first-child input");

            // console.log("is checkbox checked: ", checkBox.is(':checked'));
            // console.log("is checked only: ", typeof checkedOnly, checkedOnly);

            if (checkOnlyFlag && !checkBox.is(':checked')) {
                return true
            }

            // 2nd row onwards
            let itemRow = $(this).find('table tbody:last-child tr:first-child');

//             console.log(itemRow);

            let itemName = itemRow.find("td:first-child a:first-child").text();

            // console.log(itemName);

            let itemPrice = itemRow.find("td:nth-child(5) div:first-child div:first-child span:last-child").text();

            // console.log("price ", itemPrice);

            let orderId = $(this).find('table tbody:first-of-type td:first-of-type span span:last-child').text();


            // console.log("orderId ", orderId);


            if (!itemRow.find("div:first-child #ext_button").length) {
                let forButton = $(this).find('table tbody:last-child tr:first-child div:first-child');

                initLabelStatus(forButton);
            }

            let exportButton = $(this).find('table tbody:last-child tr:first-child div:first-child #ext_button');
            let extStatusButton = $(this).find('table tbody:last-child tr:first-child div:first-child #ext_status');

            $.ajax({

                url: '/trade/json/transit_step.do?bizOrderId=' + orderId,

                type: 'GET', dataType: "json", success: function (response) {

                    // console.log("resp ", response);

                    if (response.expressId) {

                        let text = "";

                        let tracking_number = response.expressId;
                        let companyName = response.expressName;

                        // console.log(response.address[0].place);

                        let exportStatus = "还没签收";

                        if (response.address[0].place.includes("签收")) {
                            extStatusButton.text("已签收");
                            exportStatus = "已签收";
                            extStatusButton.addClass("green");
                        } else if (response.address[0].place.includes("代收")) {
                            exportStatus = "已代收";
                            extStatusButton.text("已代收");
                            extStatusButton.addClass("green");
                        } else if (response.address[0].place.includes("Delivered, Received by Customer")) {
                            exportStatus = "Received";
                            extStatusButton.text("Received");
                            extStatusButton.addClass("green");

                        } else {
                            extStatusButton.text("Unknown");
                            extStatusButton.addClass("red1");
                        }

                        text += companyName + " - ";

                        text += tracking_number;

                        exportButton.text(text);

                        // console.log("button text ", text);

//                      let csvData = [`${itemDate},${tracking_number},${companyName.trim()},${itemName.trim()},1,1,${itemPrice},${exportStatus}`];
                        let csvData = [itemDate, tracking_number, companyName.trim(), itemName.trim(), 1, 1, itemPrice, exportStatus];


                        csvData = csvData.join(DATA_DELIMITER)

                        // console.log(csvData)

                        exportDataObject[orderId] = csvData;

                        asyncCallCount += 1;

                        browser.storage.local.set({[KEY_STORAGE_EXPORT_DATA]: exportDataObject}).then(success => {
                            // console.log("set ok: ", orderId);
//                            console.log("exportDataObject ", Object.keys(exportDataObject).length, exportDataObject)
                        }, (e) => {
                            console.error(e);
                        });

                    } else if (response.isSuccess == 'true') {
                        exportButton.addClass("red");

                        exportButton.text("Order not sent");
                    } else {
                        exportButton.addClass("red");

                        exportButton.text("invalid order");
                    }
                }, error: function (response) {
                    exportButton.addClass("red");

                    exportButton.text("incomplete info");
                }
            })


        });
    }

    function handleMessage(request, sender, sendResponse) {
        if (request.action) {
            let action = request.action;
            switch (action) {
                case ACTION_ID_RELOAD_PAGE:
                    init()
                    processPage()
                    return Promise.resolve({response: true});
                    break;
                case ACTION_ID_LOAD_DATA:
                    getOrderDetail()
                    return Promise.resolve({response: true});
                    break;
                case ACTION_ID_ADD_SELECTED_DATA:
                    getOrderDetail(null, true)
                    return Promise.resolve({response: true});
                    break;
            }
        }
    }

    browser.runtime.onMessage.addListener(handleMessage)


    init()
    setupObserver()
    processPage()


});
