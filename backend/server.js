import global from './global.js';
import { get_client, send_event_to_client, send_event_to_clients, send_event_to_wallet_clients } from './utils.js';
import { worker, find_worker } from './worker.js';
import { verify_payment } from './payment.js';
import { init_db, db_get_stats, db_add_purchase, db_add_tickets, db_get_data_by_walletaddress, db_get_walletaddress_stats } from './db.js';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Validator } from 'node-input-validator';
import sanitizer from 'perfect-express-sanitizer';
import { ethers } from 'ethers';
import {execSync} from 'node:child_process';
import crypto from "crypto";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const niv = require('node-input-validator');

niv.extend('chunk', ({ value }) => {
	const int_chunk = Number(value);
	if((int_chunk >= 0) && (int_chunk <= 8388607)) {
		console.log('Validator.extend chunk ok', value);
		return true;
	}
	else {
		console.log('Validator.extend chunk error', value);
		return false;
	}
});

niv.extend('rand', ({ value }) => {
	if((value == "true") || (value == "false")) {
		console.log('Validator.extend rand ok', value);
		return true;
	}
	else {
		console.log('Validator.extend rand error', value);
		return false;
	}
});

niv.extend('quantity', ({ value }) => {
	const int_quantity = Number(value);
	if((int_quantity >= 1) && (int_quantity <= 100)) {
		console.log('Validator.extend quantity ok', value);
		return true;
	}
	else {
		console.log('Validator.extend quantity error', value);
		return false;
	}
});

const app = express();

app.use(cors({origin: '*'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(
	sanitizer.clean({
    	xss: true,
    	sql: true,
    	sqlLevel: 5
    })
);

var mutex = {};
var finder_mutex = {};
var balance = 0;

function cb_payment_play_ok(date, walletaddress, res, btcaddress, start_chunk, rand, quantity, encpublickey) {
	var ustats = null;
	db_add_purchase(walletaddress, quantity, date)
	.then((purchaseId) => {
		var chunks = [];
		var db_btc_address;
		var values = '';
		if(btcaddress == Puzzle66BtcAddress) {
			db_btc_address = "";
			var cmd;
			if(rand == "false")
				cmd = `../chunk_state gen ../chunks ${quantity} ${start_chunk}`;
			else
				cmd = `../chunk_state gen_rand ../chunks ${quantity}`;
			chunks = execSync(cmd);
			chunks = chunks.toString().trim().split(' ');
		}
		else {
			db_btc_address = btcaddress;
			const chunk_number = Number(start_chunk);
			for(let i=0; i<quantity; i++)
				chunks.push((chunk_number+i).toString());
		}
		chunks.forEach((chunk) => {
			values += `(${purchaseId}, ${parseInt(chunk)}, "WAITING", "${db_btc_address}", "", "${encpublickey}"),`;
		});
		values = values.slice(0, -1);
		return db_add_tickets(purchaseId, values);
	})
	.then(() => {
		stats.waiting += Number(quantity);
		res.status(200).send('ok');
		return db_get_walletaddress_stats(walletaddress);
	})
	.then((user_stats) => {
		ustats = user_stats;
	 	return db_get_data_by_walletaddress(walletaddress);
	}).then((new_datas) => {
		send_event_to_wallet_clients(walletaddress, {'event': 'SYNC_ADD', 'datas': new_datas, 'stats': stats, 'user_stats': ustats});
	}).catch((error) => {
	 	res.status(422).send('error');
	 	console.log('cb_payment_play_ok', error, date, walletaddress, btcaddress, start_chunk, quantity, encpublickey);
	});
}

async function get_puzzle_balance() {
	return fetch("https://blockchain.info/q/addressbalance/" + Puzzle66BtcAddress)
  	.then(function(response) {
    	return response.json();
  	})
  	.then(function(json) {
    	balance = parseInt(json, 10)/100000000;
    	send_event_to_clients(clients, {'event': 'BALANCE', 'balance': balance});
  	})
  	.catch((err) => {
  		console.log(err);
  	});
}

(async () => {
	await init_db();
	stats = await db_get_stats();

	console.log(stats);

	execSync('yagna payment release-allocations');

	app.listen(PORT, () => {
		console.log(`Events service listening at http://localhost:${PORT}`)
	})

	function eventsHandler(request, response, next) {

		const salt = BigInt(crypto.randomBytes(4).readUInt32LE(0)) << 64n;
		const ts = BigInt(Date.now());
		const cid = (salt + ts).toString();

		const client = {
			id: cid,
			walletaddress: null,
			authenticated: false,
			response
		};

		clients.push(client);

		const headers = {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'Cache-Control': 'no-cache',
			'X-Accel-Buffering': 'no'
		};
		response.writeHead(200, headers);
		response.write(`data: {"event": "CONNECTED", "clientId": "${client.id}", "stats": ${JSON.stringify(stats)}, "balance": ${balance}}\n\n`);

		request.on('close', (e) => {
			console.log(`${client.id} Connection closed`);
			clients = clients.filter(fclient => fclient.id != client.id);
		});
	}

	app.get('/connect', eventsHandler);

	app.get("/authenticate", (req, res) => {
		const upload_validator = new Validator(req, {
	    	'req.query.walletaddress': 'required|string|minLength:42|maxLength:42',
	    	'req.query.clientid': 'required|string|minLength:1|maxLength:50',
	    	'req.query.signedclientid': 'required|string|minLength:132|maxLength:132'
		});

		upload_validator.check().then((matched) => {
			if(!matched) {
				res.status(422).send('error');
				console.log('authenticate unmatched upload_validator', req.query.walletaddress, req.query.clientid, req.query.signedclientid);
			}
			else
			{
				var walletaddress = req.query.walletaddress;
				var addressThatSignedData = ethers.verifyMessage(req.query.clientid, req.query.signedclientid);
				if(addressThatSignedData == walletaddress) {
					var client = get_client(clients, Number(req.query.clientid));
					if(client) {
						client.authenticated = true;
						client.walletaddress = walletaddress;

						var ustats = null;
						db_get_walletaddress_stats(walletaddress)
						.then((user_stats) => {
							ustats = user_stats;
							return db_get_data_by_walletaddress(walletaddress);
						})
						.then((datas) => {
							res.status(200).send('ok');
							send_event_to_client(client, {'event': 'SYNC', 'datas': datas, 'stats': stats, 'user_stats': ustats});
						})
						.catch((error) => {
						 	res.status(422).send('error');
						 	console.log('authenticate fetch data error', walletaddress, error);
						});
					}
					else {
						res.status(422).send('error');
						console.log('authenticate failed, client undefined', walletaddress, addressThatSignedData);
					}
				}
				else {
					res.status(422).send('error');
					console.log('authenticate failed', walletaddress, addressThatSignedData);
				}

			}
		});


	});

	app.get("/play", (req, res) => {
		const play_validator = new niv.Validator(req.query, {
	    	'btcaddress': 'required|string|minLength:26|maxLength:62',
	    	'chunk': 'required|string|minLength:1|maxLength:7',
	    	'rand': 'required|string|minLength:4|maxLength:5',					// set chunk to 0 for rand = "true"
	    	'quantity': 'required|string|minLength:1|maxLength:3',
	    	'txhash': 'required|string|minLength:66|minLength:66',
	    	'encPublicKey': 'required|string|minLength:1|maxLength:64',
	    	'clientid': 'required|string|minLength:1|maxLength:50'
		});

		play_validator.check().then((matched) => {
			if(!matched) {
				res.status(422).send('error');
				console.log('play unmatched play_validator', req.query.btcaddress, req.query.chunk, req.query.quantity, req.query.txhash, req.query.encPublicKey, req.query.clientid);
				console.log(play_validator.errors);
			}
			else
			{
				var btcaddress = req.query.btcaddress;
				var chunk = req.query.chunk;
				var rand = req.query.rand;
				var quantity = req.query.quantity;
				var txhash = req.query.txhash;
				var encpublickey = atob(req.query.encPublicKey);
				var client = get_client(clients, Number(req.query.clientid));

				var chunk_number = Number(chunk);
				var quantity_number = Number(quantity);

				if((quantity_number < 1) || (quantity_number > 100)) {
					console.log('play error', client.walletaddress, 'bad quantity', quantity, quantity_number);
					res.status(422).send('error');
				}
				else if((chunk_number < 0 ) ||
						((chunk_number > (Puzzle66MaxChunk - 1)) && (btcaddress == Puzzle66BtcAddress)) ||
						((chunk_number > 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) && (btcaddress != Puzzle66BtcAddress))) {
					res.status(422).send('error');
					console.log('play error', client.walletaddress, 'bad chunk', chunk, chunk_number);
				}

				if(client)
				{
					if(client.authenticated)
						verify_payment(txhash, cb_payment_play_ok, res, client.walletaddress, btcaddress, chunk, rand, quantity, encpublickey);
					else {
						res.status(422).send('error');
						console.log('play error', client.id, 'not authenticated');
					}
				}
				else {
					res.status(422).send('error');
					console.log('play error no client!');
				}
			}
		});
	});

	Object.getOwnPropertyNames(gpu_context).forEach((gpu_model) => {
		mutex[gpu_model] = false;
		finder_mutex[gpu_model] = false;
		setInterval(worker_thread, 1000, gpu_model, mutex);
		setInterval(find_worker_thread, (gpu_context[gpu_model].taskTimeout - 5)*60*1000, gpu_model, finder_mutex);
		find_worker_thread(gpu_model, finder_mutex);
	});

	setInterval(get_puzzle_balance, 5000);
})()

function worker_thread(gpu_model, mutex) {
	if(!mutex[gpu_model])
	{
		mutex[gpu_model] = true;
		worker(gpu_model)
		.then(() => mutex[gpu_model] = false);
	}
}

function find_worker_thread(gpu_model, finder_mutex) {
	if(!finder_mutex[gpu_model])
	{
		finder_mutex[gpu_model] = true;
		gpu_context[gpu_model].available = [];
		find_worker(gpu_model)
		.then(() => finder_mutex[gpu_model] = false);
	}
}