
const { getTransData } = require('./get_tx_data')
const { getTxFromContract } = require('./get_tx_from_contract')
const { getClosestBlock } = require('./block_from_timestamp')
const { getTimestamp } = require('./date_to_timestamp')
const { sliceAndRunMain, loadFile } = require('./utils')
const { bsc_apikey, start, end, filename } = require('./config')



async function runScript(start, end, file_name, apikey){ 
    let range_timestamp = await getTimestamp(start, end)
    // let block_range = await getClosestBlock(range_timestamp)
    let block_range = [start, end]

    unpack_list = []
    const timer = ms => new Promise(res => setTimeout(res, ms))
    let list_contract = await loadFile(file_name)
    console.log('loaded contracts', list_contract.length)

    async function load () { 
        for (address of list_contract){
            // console.log(address)
            let list_tx = await getTxFromContract(...block_range, address, apikey)              
            unpack_list = unpack_list.concat(list_tx)
            await timer(500); 
        }
    }
    await load();
    console.log("found total tx (including fails, approval and etc.)", unpack_list.length)

    async function mainTask(item) {
        let res = await getTransData(item)       
        return res        
    }

    sliceAndRunMain(unpack_list, mainTask, 5)  
}

// --------------------
// start here
// --------------------

runScript(26950457, 27007007, filename, bsc_apikey)

// runScript(start, end, filename, bsc_apikey)


