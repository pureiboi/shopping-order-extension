browser.windows.onRemoved.addListener(() => {
    browser.storage.local.clear();
});


browser.tabs.onRemoved.addListener((tab) => {
    
    let isClearStorage = true;
    browser.tabs.query({}).then((tabs) => {
        for (const tab of tabs) {
            if (tab.url.includes("trade.taobao.com")) {
                isClearStorage = false
            }
        }
        
        if(isClearStorage) {
            browser.storage.local.clear();
        }
    });
}
);