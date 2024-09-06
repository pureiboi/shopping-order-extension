const btnSave = $('#btn_save')

btnSave.on("click", () => {

    browser.storage.local.set({
        [KEY_STORAGE_SETTING_SAVE_DATA]: $('input[name="radio"]:checked').val() === "true",
    });

})


function init() {
    browser.storage.local.get(KEY_STORAGE_SETTING_SAVE_DATA).then(resp => {
        if (resp[KEY_STORAGE_SETTING_SAVE_DATA] === false) {
            $("#save_data_false").prop("checked", true);
        } else {
            $("#save_data_true").prop("checked", true);
        }
    })
}

init()