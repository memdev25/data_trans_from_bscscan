const ethers = require("ethers");
const { sliceAndRunContractList } = require("./utils");
const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");


async function getTxFromContract(startblock, endblock, address, apikey) {
    // page = 1
    offset=5000  //count tx per request
    sort='desc'

    local_list = []

    function timer(ms) {
        return new Promise(res => setTimeout(res, ms));
    }
    async function load () {
        for (var page = 0; page < 100; page++) {
            try {
                // console.log(page)
                option = `module=account&action=txlist&address=${address}&startblock=${startblock}&endblock=${endblock}&page=${page+1}&offset=${offset}&sort=${sort}&apikey=${apikey}`
                let res = await fetch(`https://api.bscscan.com/api?${option}`, { method: 'GET' })
                let data = await res.json()
                     
                if(data.message == 'No transactions found') {
                    // console.log(local_list, "local_list") 
                    break
                } 
                for (el of data.result){            
                    local_list.push(el.hash)
                }    
            } catch (error) {
                console.log(error.reason, 'err getTxFromContract')     
            }   
            await timer(1000);
        }
    }
    await load();

    if(local_list.length == 0) {
        console.log('contract', address, "no transactions found for period")
        // console.log(local_list, "local_list") 
    } 
            
    return local_list 


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
