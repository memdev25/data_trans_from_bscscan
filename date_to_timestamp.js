function toTimestamp(strDate){
    var datum = Date.parse(strDate);
    return datum/1000;
  }  
  
async function getTimestamp(start, end){
    start_time = toTimestamp(start)
    end_time = toTimestamp(end)
    return [start_time, end_time]
}

module.exports = {
    getTimestamp
}
