function findAddresses(obj, findStr) {
    return obj.find(addr => addr.place.includes(findStr));
}

function dataToObject(header, dataArray) {

    if (!Array.isArray(header) || !Array.isArray(dataArray)) {
        throw new Error("header or dataArray is not array");
    }

    const obj = {};
    header.forEach((header, index) => {
        obj[header] =  dataArray[index]
    });
    return obj;
}