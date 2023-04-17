const { VoidSigner } = require('ethers');
const fs = require('fs');
const fsp = require('fs').promises;


async function loadFile(filename) {
    let wallets = await fsp.readFile(`./${filename}`, 'utf8');  
    list_address = wallets.split("\r\n")
    const ress = list_address.filter((el) => el != "");
    return ress
}

async function sliceAndRun(list_select, mainTask, size = null) {

    array_rows = []

    async function processArray(list_select) {
        const promises = list_select.map(mainTask);
        const results = await Promise.all(promises);
        
        for (i of results) {
            if (i == false) continue
            array_rows.push([i.from, i.to, i.token, i.count, i.price, i.tx_hash, i.block_date])
        }
    }

    if (size !== null) {
        let slice_list = []; 
        for (let i = 0; i < Math.ceil(list_select.length / size); i++) {
            slice_list[i] = list_select.slice((i * size), (i * size) + size);
        }

        function timer(ms) {
            return new Promise(res => setTimeout(res, ms));
        }
        async function run() {
            for (el of slice_list) {
                await processArray(el)
                await timer(1000);
            }
        }

        await run();
        return array_rows
    } else {
        await processArray(list_select)
    }
    return array_rows
}

async function sliceAndRunBlock(list_select, mainTask, size = null) {

    let list_res = []

    async function processArray(list_select) {
        const promises = list_select.map(mainTask);
        const results = await Promise.all(promises);
        list_res = results  
    }

    await processArray(list_select)

    return list_res      
}

async function sliceAndRunContractList(list_select, mainTask, size = null) {

    let list_res = []

    async function processArray(list_select) {
        const promises = list_select.map(mainTask);
        const results = await Promise.all(promises);
        for(el of results){
            list_res.push(el)
        }
    }        
    if (size !== null) {
        let slice_list = []; 
        for (let i = 0; i < Math.ceil(list_select.length / size); i++) {
            slice_list[i] = list_select.slice((i * size), (i * size) + size);
        }
        function timer(ms) {            
            return new Promise(res => setTimeout(res, ms));
        }
        async function run() {
            for (el of slice_list) {
                await processArray(el)
                await timer(1000);
            }
        }
        run();

    } else {
        await processArray(list_select)
    }

    await processArray(list_select)
    
    return list_res
}

async function sliceAndRunMain(list_select, mainTask, size = null) {
    count = 1  

    async function processArray(list_select) {
        const promises = list_select.map(mainTask);
        const results = await Promise.all(promises);

        const numbers = new Set();
        for(el of results[0]){           
            if(el[6] == undefined) continue            
            numbers.add(el[5])
        }  

        for(el of numbers){
            console.log(count, el)
            count++     
        }          
        
        for(el of results[0]){
            from = el[0]  
            to = el[1]  
            token = el[2] 
            count_raw = el[3] 
            if(count_raw > 1*10**32) count_raw = 0

            price_raw = el[4] * count_raw
            txhs = el[5]
            block_date = el[6]

            if(block_date == undefined) continue
            
            let price = String(price_raw).replace(/\./g,',')
            let amount = String(count_raw).replace(/\./g,',')

            const data_str = `${txhs};"${from}";"${to}";"${token}";"${amount}";"${price}";${block_date.toGMTString().slice(5)}\n`;

            fs.appendFile("data.csv", data_str, "utf-8", (err) => {
                if (err) console.log(err);
                // else console.log("Data saved");
            });
               
        }

    }

    

    if (size !== null) {
        let slice_list = []; 
        for (let i = 0; i < Math.ceil(list_select.length / size); i++) {
            slice_list[i] = list_select.slice((i * size), (i * size) + size);
        }

        function timer(ms) {
            return new Promise(res => setTimeout(res, ms));
        }
        async function run() {
            for (el of slice_list) {
                await processArray(el)
                await timer(1000);
            }
        }

        await run();

    } else {
        await processArray(list_select)
    }
   
    return count
}

module.exports = {
    sliceAndRun, sliceAndRunMain, sliceAndRunBlock, sliceAndRunContractList, loadFile
}
