const ethers = require("ethers");
const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
const { sliceAndRunMain, sliceAndRunBlock } = require('./utils')

async function getClosestBlock(timestamp_list) {

  console.log(`search block numbers, please wait...`)

  async function mainTask(timestamp) {
    let minBlockNumber = 0
    let maxBlockNumber = await provider.getBlockNumber();
  
    let closestBlockNumber = Math.floor((maxBlockNumber + minBlockNumber) / 2)
    let closestBlock = await provider.getBlock(closestBlockNumber);
    let foundExactBlock = false
    
    while (minBlockNumber <= maxBlockNumber) {
      if (closestBlock.timestamp === timestamp) {
        foundExactBlock = true
        break;
      } else if (closestBlock.timestamp > timestamp) {
        maxBlockNumber = closestBlockNumber - 1
      } else {
        minBlockNumber = closestBlockNumber + 1
      }
  
      closestBlockNumber = Math.floor((maxBlockNumber + minBlockNumber) / 2)
      closestBlock = await provider.getBlock(closestBlockNumber);
    }
  
    const previousBlockNumber = closestBlockNumber - 1
    const previousBlock = await provider.getBlock(previousBlockNumber);
    const nextBlockNumber = closestBlockNumber + 1
    const nextBlock = await provider.getBlock(nextBlockNumber);

    return closestBlockNumber
  }
 
  let list_res = await sliceAndRunBlock(timestamp_list, mainTask)  
  return list_res
}


module.exports = {
  getClosestBlock
}




