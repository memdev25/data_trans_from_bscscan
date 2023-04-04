const ethers = require("ethers");
const { sliceAndRunContractList } = require("./utils");
const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");


async function getTxFromContract(startblock, endblock, address, apikey) {
    page = 1
    offset=1000
    sort='desc'

    try {
        option = `module=account&action=txlist&address=${address}&startblock=${startblock}&endblock=${endblock}&page=${page}&offset=${offset}&sort=${sort}&apikey=${apikey}`
        let res = await fetch(`https://api.bscscan.com/api?${option}`, { method: 'GET' })
        let data = await res.json()
    
        if(data.message == 'No transactions found') console.log('contract', address, "no transactions found for period")
    
        local_list = []
        for (el of data.result){
        
            local_list.push(el.hash)
        }
        return [local_list]        
    } catch (error) {
        console.log(error.reason, 'err getTxFromContract')        
    }
}

async function getTxFromContractList(startblock, endblock, contract_list) {

    // console.log(startblock, endblock)
    // let list_hash = []   
    async function mainTask(item) {     
        bscscan_apikey = "ST8C3H21TPV2CZ65PD5JGBCSS26YQ1Y7I2"
        page = 1
        offset=10
     
        option = `module=account&action=txlist&address=${item}&startblock=${startblock}&endblock=${endblock}&page=${page}&offset=${offset}&sort=asc&apikey=${bscscan_apikey}`
        let res = await fetch(`https://api.bscscan.com/api?${option}`, { method: 'GET' })
        let data = await res.json()

        local_list = []
        for (el of data.result){
            local_list.push(el.hash)
        }
        return local_list
    }

    let list_res = await sliceAndRunContractList(contract_list, mainTask, 1)
    // console.log(...list_res)
    return list_res   
}


module.exports = {
    getTxFromContract, 
}
