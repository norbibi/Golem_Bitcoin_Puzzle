import Web3 from "web3";
import { get_purchase } from './utils.js';

export const web3 = new Web3(`https://polygon-mainnet.infura.io/v3/${infuraKey}`);

export function decode_tx_transaction(transaction) {
	return web3.eth.abi.decodeParameters(erc20TransferABI, transaction.input.slice(10));
}

export async function verify_payment(txhash, cb, res, walletaddress, btcaddress, chunk, rand, quantity, encpublickey) {
	var ts = Math.floor(Date.now()/1000);

	purchases = purchases.filter(purchase => purchases.last_blocktimestamp > (ts - 60));
	var data = {'transaction': null, 'receipt': null, 'block': null};

	web3.eth.getTransaction(txhash)
	.then((transaction) => {
		data.transaction = transaction;
		return web3.eth.getTransactionReceipt(txhash).then((receipt) => {
			data.receipt = receipt;
			return data;
		});
	})
	.then((data2) => {
		return web3.eth.getBlock(data2.receipt.blockNumber).then((block) => {
			data2.block = block;
			return data2;
		});
	})
	.then((data3) => {
		var d_tx = decode_tx_transaction(data3.transaction);
    	var v_sender = data3.receipt.from;
    	var v_dest = d_tx.receiver;
    	var v_amount = d_tx.amount;
    	var v_timestamp = data3.block.timestamp;
    	var diff_ts = Number(BigInt(ts) - v_timestamp);

		if((diff_ts < 60) && (v_dest == YagnaWalletAddress) && (v_sender == walletaddress.toLowerCase()) && (v_amount == (quantity*ticket_price))) {
			var purchase = get_purchase(purchases, walletaddress);
			if(purchase == null) {
				var newPurchase = {
					walletaddress: walletaddress,
					last_blocktimestamp: data3.block.timestamp
				};

				purchases.push(newPurchase);
				cb(ts, walletaddress, res, btcaddress, chunk, rand, quantity, encpublickey);
			}
			else if(block.timestamp > purchase.last_blocktimestamp) {
				purchase.last_blocktimestamp = data3.block.timestamp;
				cb(ts, walletaddress, res, btcaddress, chunk, rand, quantity, encpublickey);
			}
			else {
				res.status(422).send('error');
				console.log('verify_payment error type 1', block, purchase, txhash, walletaddress);
			}
		}
		else {
			res.status(422).send('error');
			console.log('verify_payment error type 2', {'v_sender': v_sender, 'v_dest': v_dest, 'v_amount': v_amount, 'quantity': quantity, 'v_timestamp': v_timestamp,
						'diff_ts': diff_ts, 'txhash': txhash, 'walletaddress': walletaddress, 'YagnaWalletAddress': YagnaWalletAddress});
		}
	}).catch((error) => {
		res.status(422).send('error');
		console.log('verify_payment', error, ts, txhash, walletaddress);
	});
}