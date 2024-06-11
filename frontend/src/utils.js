import { POSClient, use } from '@maticnetwork/maticjs';
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';
import Web3 from "web3";

use(Web3ClientPlugin);

export const PolygonNetwork = {
  chainId: "0x89",
  chainName: "Polygon",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18
  },
  rpcUrls: ["https://polygon-rpc.com"],
  blockExplorerUrls: ["https://polygonscan.com"]
};

export const PuzzleHost = process.env["REACT_APP_PUZZLE_HOST"];
export const ChunkSize = parseInt("0x40000000000", 16);
export const Puzzle66BtcAddress = "13zb1hQbWVsc2S7ZTZnP2G4undNNpdh5so";
export const Puzzle66DefaultRange = "20000000000000000:20000040000000000";
export const Puzzle66Base = parseInt("20000000000000000", 16);
export const Puzzle66MaxChunk = 8388608;

export const status_color = {'WIN': 'win', 'DONE': 'played', 'COMPUTING': 'computing', 'WAITING': 'waiting'};

const GLMtokenAddress = "0x0B220b82F3eA3B7F6d9A1D8ab58930C064A2b5Bf";
const MATICtokenAddress = "0x0000000000000000000000000000000000001010";
const YagnaWalletAddress = process.env["REACT_APP_PUZZLE_WALLET"];

export const old_puzzles = [  {address: '1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH', chunk: 0},
                              {address: '1CUNEBjYrCn2y1SdiUMohaKUi4wpP326Lb', chunk: 0},
                              {address: '19ZewH8Kk1PDbSNdJ97FP4EiCjTRaZMZQA', chunk: 0},
                              {address: '1EhqbyUMvvs7BfL8goY6qcPbD6YKfPqb7e', chunk: 0},
                              {address: '1E6NuFjCi27W5zoXg8TRdcSRq84zJeBW3k', chunk: 0},
                              {address: '1PitScNLyp2HCygzadCh7FveTnfmpPbfp8', chunk: 0},
                              {address: '1McVt1vMtCC7yn5b9wgX1833yCcLXzueeC', chunk: 0},
                              {address: '1M92tSqNmQLYw33fuBvjmeadirh1ysMBxK', chunk: 0},
                              {address: '1CQFwcjw1dwhtkVWBttNLDtqL7ivBonGPV', chunk: 0},
                              {address: '1LeBZP5QCwwgXRtmVUvTVrraqPUokyLHqe', chunk: 0},
                              {address: '1PgQVLmst3Z314JrQn5TNiys8Hc38TcXJu', chunk: 0},
                              {address: '1DBaumZxUkM4qMQRt2LVWyFJq5kDtSZQot', chunk: 0},
                              {address: '1Pie8JkxBT6MGPz9Nvi3fsPkr2D8q3GBc1', chunk: 0},
                              {address: '1ErZWg5cFCe4Vw5BzgfzB74VNLaXEiEkhk', chunk: 0},
                              {address: '1QCbW9HWnwQWiQqVo5exhAnmfqKRrCRsvW', chunk: 0},
                              {address: '1BDyrQ6WoF8VN3g9SAS1iKZcPzFfnDVieY', chunk: 0},
                              {address: '1HduPEXZRdG26SUT5Yk83mLkPyjnZuJ7Bm', chunk: 0},
                              {address: '1GnNTmTVLZiqQfLbAdp9DVdicEnB5GoERE', chunk: 0},
                              {address: '1NWmZRpHH4XSPwsW6dsS3nrNWfL1yrJj4w', chunk: 0},
                              {address: '1HsMJxNiV7TLxmoF6uJNkydxPFDog4NQum', chunk: 0},
                              {address: '14oFNXucftsHiUMY8uctg6N487riuyXs4h', chunk: 0},
                              {address: '1CfZWK1QTQE3eS9qn61dQjV89KDjZzfNcv', chunk: 0},
                              {address: '1L2GM8eE7mJWLdo3HZS6su1832NX2txaac', chunk: 0},
                              {address: '1rSnXMr63jdCuegJFuidJqWxUPV7AtUf7' , chunk: 0},
                              {address: '15JhYXn6Mx3oF4Y7PcTAv2wVVAuCFFQNiP', chunk: 0},
                              {address: '1JVnST957hGztonaWK6FougdtjxzHzRMMg', chunk: 0},
                              {address: '128z5d7nN7PkCuX5qoA4Ys6pmxUYnEy86k', chunk: 0},
                              {address: '12jbtzBb54r97TCwW3G1gCFoumpckRAPdY', chunk: 0},
                              {address: '19EEC52krRUK1RkUAEZmQdjTyHT7Gp1TYT', chunk: 0},
                              {address: '1LHtnpd8nU5VHEMkG2TMYYNUjjLc992bps', chunk: 0},
                              {address: '1LhE6sCTuGae42Axu1L1ZB7L96yi9irEBE', chunk: 0},
                              {address: '1FRoHA9xewq7DjrZ1psWJVeTer8gHRqEvR', chunk: 0},
                              {address: '187swFMjz1G54ycVU56B7jZFHFTNVQFDiu', chunk: 0},
                              {address: '1PWABE7oUahG2AFFQhhvViQovnCr4rEv7Q', chunk: 0},
                              {address: '1PWCx5fovoEaoBowAvF5k91m2Xat9bMgwb', chunk: 0},
                              {address: '1Be2UF9NLfyLFbtm3TCbmuocc9N1Kduci1', chunk: 0},
                              {address: '14iXhn8bGajVWegZHJ18vJLHhntcpL4dex', chunk: 0},
                              {address: '1HBtApAFA9B2YZw3G2YKSMCtb3dVnjuNe2', chunk: 0},
                              {address: '122AJhKLEfkFBaGAd84pLp1kfE7xK3GdT8', chunk: 0},
                              {address: '1EeAxcprB2PpCnr34VfZdFrkUWuxyiNEFv', chunk: 0},
                              {address: '1L5sU9qvJeuwQUdt4y1eiLmquFxKjtHr3E', chunk: 0},
                              {address: '1E32GPWgDyeyQac4aJxm9HVoLrrEYPnM4N', chunk: 0},
                              {address: '1PiFuqGpG8yGM5v6rNHWS3TjsG6awgEGA1', chunk: 1},
                              {address: '1CkR2uS7LmFwc3T2jV8C1BhWb5mQaoxedF', chunk: 3},
                              {address: '1NtiLNGegHWE3Mp9g2JPkgx6wUg4TW7bbk', chunk: 4},
                              {address: '1F3JRMWudBaj48EhwcHDdpeuy2jwACNxjP', chunk: 11},
                              {address: '1Pd8VvT49sHKsmqrQiP61RsVwmXCZ6ay7Z', chunk: 27},
                              {address: '1DFYhaB2J9q1LLZJWKTnscPWos9VBqDHzv', chunk: 43},
                              {address: '12CiUhYVTTH33w3SPUBqcpMoqnApAV4WCF', chunk: 93},
                              {address: '1MEzite4ReNuWaL5Ds17ePKt2dCxWEofwk', chunk: 138},
                              {address: '1NpnQyZ7x24ud82b7WiRNvPm6N8bqGQnaS', chunk: 468},
                              {address: '15z9c9sVpu6fwNiK7dMAFgMYSK4GqsGZim', chunk: 958},
                              {address: '15K1YKJMiJ4fpesTVUcByoz334rHmknxmT', chunk: 1537},
                              {address: '1KYUv7nSvXx4642TKeuC2SNdTk326uUpFy', chunk: 2267},
                              {address: '1LzhS3k3e9Ub8i2W1V8xQFdB8n2MYCHPCa', chunk: 6831},
                              {address: '17aPYR1m6pVAacXg1PTDDU7XafvK1dxvhi', chunk: 10054},
                              {address: '15c9mPGLku1HuW9LRtBf4jcHVpBUt8txKz', chunk: 31433},
                              {address: '1Dn8NF8qDyyfHMktmuoQLGyjWmZXgvosXf', chunk: 45469},
                              {address: '1HAX2n9Uruu9YDt4cqRgYcvtGvZj1rbUyt', chunk: 119387},
                              {address: '1Kn5h2qpgw9mWE5jKpk8PP4qvvJ1QVy8su', chunk: 258078},
                              {address: '1AVJKwzs9AskraJLGHAZPiaZcrpDr1U6AB', chunk: 324186},
                              {address: '1Me6EfpwZK5kQziBwBfvLiHjaPGxCKLoJi', chunk: 888661},
                              {address: '1NpYjtLira16LfGbGwZJ5JbDPh3ai9bjf4', chunk: 2044823},
                              {address: '16jY7qLJnxb7CHZyqBP8qca9d51gAjyXQN', chunk: 4047175},
                              {address: '18ZMbwUFLMHoZBbfpCjUJQTCMCbktshgpe', chunk: 6950444}]

const posClient = new POSClient();
export const web3 = new Web3(window.ethereum);
const GlmToken = posClient.erc20(GLMtokenAddress);
const MaticToken = posClient.erc20(MATICtokenAddress);

window.addEventListener('unhandledrejection', function(event) {
	event.preventDefault();
});

export async function pay_ticket(account, quantity) {
	const qtty = 600000000000000000 * quantity;
	var encPublicKey;
	return window.ethereum.request({
	    method: 'eth_getEncryptionPublicKey',
	    params: [account]
	}).then((encryptionPublicKey) => {
		encPublicKey = encryptionPublicKey;
        return web3.eth.getGasPrice();
    }).then((fees) => {
    	return GlmToken.transfer(qtty.toString(), YagnaWalletAddress, {gasPrice: fees*2});
    }).then((tx) => {
    	return tx.getReceipt().then((receipt) => {
            return {'err': null, 'txhash': receipt.transactionHash, 'encPublicKey': encPublicKey};
        });
    }).catch((err) => {
		console.log(err);
		return {'err': err.message, 'txhash': null};
	});
}

export async function decrypt(account, enc_message) {
	return window.ethereum.request({
	    method: 'eth_decrypt',
	    params: [enc_message, account]
	}).then((message) => {
		return {'message': message, 'err': null};
    }).catch((err) => {
		return {'message': null, 'err': err.message};
	});
}

export async function init_pos_client(account) {
	return posClient.init({
        log: false,
        network: "mainnet",
        version: 'v1',
        parent: {
            provider: web3.currentProvider,
            defaultConfig: {
                from: account
            }
        },
        child: {
            provider: web3.currentProvider,
            defaultConfig: {
                from: account
            }
        }
    });
}

export async function get_GLM_Polygon_balance(account) {
	return await GlmToken.getBalance(account)/(10**18);
}

export async function get_MATIC_balance(account) {
	return await MaticToken.getBalance(account)/(10**18);
}
