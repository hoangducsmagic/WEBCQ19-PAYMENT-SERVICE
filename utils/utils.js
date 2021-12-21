function timestampToDatetime(timestamp) {
    var date = new Date(timestamp);
    var res=`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    
    return res;
}

function datetimeToTimestamp(datetime) {
    return Date.parse(datetime);
}

module.exports={timestampToDatetime,datetimeToTimestamp}