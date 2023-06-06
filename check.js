const Web3 = require('web3');
const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');
const fs = require('fs');

// 以太坊节点的URL
const ethereum_node_url = 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID';

// 输入文件和输出文件的路径
const input_file = 'seed_phrases.txt';
const output_file = 'balance_results.txt';

// 创建 Web3 实例
const web3 = new Web3(new Web3.providers.HttpProvider(ethereum_node_url));

// 获取助记词账户的余额
async function getBalance(seed) {
  try {
    const mnemonic = seed.trim();
    const seedBuffer = await bip39.mnemonicToSeed(mnemonic);
    const hdWallet = hdkey.fromMasterSeed(seedBuffer);
    const wallet = hdWallet.derivePath("m/44'/60'/0'/0/0").getWallet();
    const address = '0x' + wallet.getAddress().toString('hex');
    const balance = await web3.eth.getBalance(address);

    // 将余额从 wei 转换为以太币
    const balanceEth = web3.utils.fromWei(balance, 'ether');

    console.log('助记词:', seed);
    console.log('账户地址:', address);
    console.log('余额:', balanceEth, 'ETH');
    console.log('');

    // 将结果写入输出文件
    const result = `助记词: ${seed}\n账户地址: ${address}\n余额: ${balanceEth} ETH\n\n`;
    fs.appendFileSync(output_file, result);
  } catch (error) {
    console.error('助记词:', seed);
    console.error('错误:', error);
    console.error('');
  }
}

// 清空输出文件
fs.writeFileSync(output_file, '');

// 读取输入文件并逐个提取助记词查询余额
fs.readFile(input_file, 'utf8', function (err, data) {
  if (err) {
    console.error('输入文件', input_file, '不存在');
    return;
  }

  const seeds = data.split('\n').filter(function (seed) {
    return seed.trim() !== '';
  });
  seeds.forEach(function (seed) {
    getBalance(seed);
  });
});
