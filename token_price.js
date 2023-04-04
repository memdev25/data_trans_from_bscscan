let pancakeSwapAbi = [
    { "inputs": [{ "internalType": "uint256", "name": "amountIn", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }], "name": "getAmountsOut", "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },
];
let tokenAbi = [
    { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
];
const Web3 = require('web3');

let map_address_price = new Map();

let save_price = []
async function getPriceHistory(tstamp) {
    if(save_price.length == 0){
        let res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BNBUSDT&interval=3d&limit=1000`, { method: 'get' })
        let data = await res.json()    
        save_price.push(data)                
    }      

    const difficult_tasks = save_price[0].filter((el) => el[0] > tstamp && el[0] < (tstamp + 259200000));
    return difficult_tasks[0][4]
}

let pancakeSwapContract = "0x10ED43C718714eb63d5aA57B78B54704E256024E".toLowerCase();
const web3 = new Web3("https://bsc-dataseed1.binance.org");
async function calcSell(tokensToSell, tokenAddres) {
    const web3 = new Web3("https://bsc-dataseed1.binance.org");
    const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" //BNB

    let tokenRouter = await new web3.eth.Contract(tokenAbi, tokenAddres);
    let tokenDecimals = await tokenRouter.methods.decimals().call();

    tokensToSell = setDecimals(tokensToSell, tokenDecimals);
    let amountOut;
    try {
        let router = await new web3.eth.Contract(pancakeSwapAbi, pancakeSwapContract);
        amountOut = await router.methods.getAmountsOut(tokensToSell, [tokenAddres, BNBTokenAddress]).call();
        amountOut = web3.utils.fromWei(amountOut[1]);
    } catch (error) { }

    if (!amountOut) return 0;
    return amountOut;
}
async function calcBNBPrice() {
    const web3 = new Web3("https://bsc-dataseed1.binance.org");
    const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" //BNB
    const USDTokenAddress = "0x55d398326f99059fF775485246999027B3197955" //USDT
    let bnbToSell = web3.utils.toWei("1", "ether");
    let amountOut;
    try {
        let router = await new web3.eth.Contract(pancakeSwapAbi, pancakeSwapContract);
        amountOut = await router.methods.getAmountsOut(bnbToSell, [BNBTokenAddress, USDTokenAddress]).call();
        amountOut = web3.utils.fromWei(amountOut[1]);
    } catch (error) { }
    if (!amountOut) return 0;
    return amountOut;
}
function setDecimals(number, decimals) {
    number = number.toString();
    let numberAbs = number.split('.')[0]
    let numberDecimals = number.split('.')[1] ? number.split('.')[1] : '';
    while (numberDecimals.length < decimals) {
        numberDecimals += "0";
    }
    return numberAbs + numberDecimals;
}


async function checkPrice(address, timestamp){
    now = Date.now()

    if(map_address_price.get(address) != undefined){
        return map_address_price.get(address)
    }
    
    if(now < (timestamp + 172800000)) {
        bnbPrice = await calcBNBPrice()
    }
    
    let tokens_to_sell = 1;
    let priceInBnb = await calcSell(tokens_to_sell, address) / tokens_to_sell; // calculate TOKEN price in BNB

    if(now > (timestamp + 172800000)) bnbPrice = await getPriceHistory(timestamp)
    priceUsd = (priceInBnb * bnbPrice )     

    if(address == 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c) priceUsd = bnbPrice   
    // console.log(`SHIT_TOKEN VALUE IN USD: ${priceUsd}`); // convert the token price from BNB to USD based on the retrived BNB value

    map_address_price.set(address, priceUsd)
    
    return priceUsd
}


module.exports = {
    checkPrice
}