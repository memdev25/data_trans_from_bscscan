const ethers = require("ethers");
const fs = require('fs') 
const { sliceAndRun } = require('./utils')
const abiERC20 = JSON.parse(fs.readFileSync("./abi/erc20.json"));
const { bsc_apikey } = require('./config')
const { checkPrice } = require('./token_price')


const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

async function getContractAbi(address) {
    option = `module=contract&action=getabi&address=${address}&apikey=${bscscan_apikey}`
    res = await fetch(`https://api.bscscan.com/api?${option}`, { method: 'GET' })
    data = await res.json()

    return data.result
}

let map_address_name = new Map();
let map_address_decimals = new Map();

async function getTransData(tx) {
    let option = `module=proxy&action=eth_getTransactionReceipt&txhash=${tx}&apikey=${bsc_apikey}`
    let res = await fetch(`https://api.bscscan.com/api?${option}`, { method: 'get' })
    let data = await res.json()

    map_ts_rowdata = new Map();
    map_hash_data = new Map();

    if(data.result.status == 0x0) return tx +" skip fail tx"  // catch fail tx

    try {
        const timestamp = (await provider.getBlock(data.result.blockNumber)).timestamp;
        var block_date = new Date(timestamp*1000);

        async function mainTask(item) {     
            try {
                let log = item         
            
                let frmto = []
                for (tp of log.topics) { 
                    const deleteLeadingZeros = ethers.utils.hexStripZeros(tp);
                    frmto.push(deleteLeadingZeros)              
                }

                if(frmto.length<3) return false
                if(log.topics[0].slice(0, 10) != 0xddf252ad) return false
                if(log.data == "0x") return false

                const abi = abiERC20

                let address = log.address

                let res_name
                if(map_address_name.get(address) != undefined){
                    res_name = map_address_name.get(address)
                    // console.log(map_address_name.size)
                } else {
                    const contract = new ethers.Contract(address, abi, provider)
                    res_name = await contract.name()
                    map_address_name.set(address, res_name)
                }
                
                let decimals
                if(map_address_decimals.get(address) != undefined){
                    decimals = map_address_decimals.get(address)
                    // console.log(map_address_name.size)
                } else {
                    const contract = new ethers.Contract(address, abi, provider)
                    decimals = await contract.decimals()
                    map_address_decimals.set(address, decimals)
                }     
        
                let data_format = log.data/10**decimals  
    
                let from = frmto.slice(1)[0]
                let to = frmto.slice(1)[1]
                let token = res_name 
                let count = data_format   

                let tx_hash = tx
                let price = await checkPrice(log.address, timestamp*1000)

       
                return {from, to, token, count, price, tx_hash, block_date}
                
            } catch(e){
                // mainTask(item)
                console.log(e.reason, 'err getTransData')
                return false
            }
        }    


        let array_txtrans = await sliceAndRun(data.result.logs, mainTask, 15)   

        return array_txtrans
    } catch (error) {
        timestamp = 0
        console.log(error.reason, "getTransData getBlock error")
    }
}


module.exports = {
    getTransData, 
}






