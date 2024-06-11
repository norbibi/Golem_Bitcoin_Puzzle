import global from './global.js';
import { db_get_tickets, db_update_ticket_by_id, db_update_ticket_status_by_ids, db_get_data_by_walletaddress, db_get_walletaddress_stats } from './db.js';
import { send_event_to_wallet_clients, send_event_to_clients } from './utils.js';
import { TaskExecutor, ProposalFilterFactory, pinoPrettyLogger } from "@golem-sdk/task-executor";
import  _ from "underscore";

var dbtasks_mutex = false;
var temp_providers_by_gpu = {};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function send_wallet_stats(walletaddress) {
	var ustats = null;
	db_get_walletaddress_stats(walletaddress)
	.then((user_stats) => {
		ustats = user_stats;
		return db_get_data_by_walletaddress(walletaddress);
	})
	.then((new_datas) => {
		let wstats = {'event': 'SYNC', 'datas': new_datas, 'stats': stats, 'user_stats': ustats};
		console.log('send_wallet_stats', walletaddress, {'stats': stats, 'user_stats': ustats});
		send_event_to_wallet_clients(walletaddress, wstats)
	})
	.catch((error) => console.log('send_wallet_stats', error));
}

function update_unfinished_tasks(datas, gpu_model) {
	var unfinished_tasks = datas.filter(data => !data.finished);
	console.log(`unfinished tasks ${gpu_model}`, unfinished_tasks);
	db_update_ticket_status_by_ids(unfinished_tasks.map(data => data.ticketId), "WAITING");
	stats.computing -= unfinished_tasks.length;
	stats.waiting += unfinished_tasks.length;
	unfinished_tasks.map(data => data.walletaddress).forEach(async (walletaddress) => await send_wallet_stats(walletaddress));
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function myFilter(proposal, f_gpu_model, isFinder) {

	let decision = false;
	const gpu_model = proposal.properties['golem.!exp.gap-35.v1.inf.gpu.model'];

	if(gpu_model == f_gpu_model) {

		const cpucount = proposal.properties['golem.inf.cpu.threads'];
		const cpuprice = proposal.properties['golem.com.pricing.model.linear.coeffs'][0]*3600;
		const envprice = proposal.properties['golem.com.pricing.model.linear.coeffs'][1]*3600;
		const startprice = proposal.properties['golem.com.pricing.model.linear.coeffs'][2];
		const price = ((gpu_context[f_gpu_model].taskTimeout - 5)/60)*(cpucount*cpuprice + envprice) + startprice;

		if(price <= 0.6) {

			if(gpu_context[gpu_model].available.map(provider => provider.id).includes(proposal.provider.id) && !isFinder)
				decision = true;
			else if(isFinder) {

				fetch(`https://reputation.dev-test.golem.network/v2/providers/${proposal.provider.id}/scores`)
				.then((response) => {
					return response.json();
				})
				.then(function(json) {
					let successRate = json.scores.successRate;
					if(	(successRate == 100) ||
						((gpu_context[gpu_model].whitelist.includes(proposal.provider.id)) && !(gpu_context[gpu_model].blacklist.includes(proposal.provider.id))) )

						return fetch(`https://api.stats.golem.network/v2/provider/node/${proposal.provider.id}`);
				})
				.then(function(response) {
					return response.json();
				})
				.then(function(json) {
					if(json[0].online && (!json[0].computing_now || gpu_context[gpu_model].computing.map(provider => provider.id).includes(proposal.provider.id)))
						temp_providers_by_gpu[gpu_model].push({'id': proposal.provider.id, 'name': proposal.provider.name});
			  	})
			  	.catch((err) => {});
			}
		}
	}

	return (decision);
};

class Filter {
  constructor(gpu_model, isFinder) {
    this.gpu_model = gpu_model;
    this.f = this.f.bind(this);
    this.isFinder = isFinder;
  }

  f(proposal) {
	return myFilter(proposal, this.gpu_model, this.isFinder);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function search_worker(filter) {

	var confTE = BaseConfigTaskExecutor;
	confTE['proposalFilter'] = filter.f;
	confTE['maxParallelTasks'] = 1;
	confTE['budget'] = 0;

	const executor = await TaskExecutor.create(confTE);
	try {
		await executor.run();
	} catch (error) {
	} finally {
		await executor.shutdown();
	}
}

export async function find_worker(gpu_model) {
	console.log('Start find_worker', gpu_model);
	const filter = new Filter(gpu_model, true);
	temp_providers_by_gpu[gpu_model] = _.uniq(gpu_context[gpu_model].computing, false, function(item){return item.id;});
	console.log('find_worker computing', gpu_model, temp_providers_by_gpu[gpu_model]);
	await search_worker(filter);
	gpu_context[gpu_model].available = _.uniq(temp_providers_by_gpu[gpu_model], false, function(item){return item.id;});
	console.log('End find_worker', gpu_model, gpu_context[gpu_model].available);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function search_key(datas, filter) {

	var confTE = BaseConfigTaskExecutor;
	confTE['proposalFilter'] = filter.f;
	confTE['maxParallelTasks'] = gpu_context[filter.gpu_model].available.length;
	confTE['budget'] = 0.6*datas.length;
	//confTE['logger'] = pinoPrettyLogger();
	confTE['taskTimeout'] = 1000 * 60 * gpu_context[filter.gpu_model].taskTimeout;
	confTE['expirationSec'] = 60 * gpu_context[filter.gpu_model].taskTimeout;

	console.log('search_key', filter.gpu_model, gpu_context[filter.gpu_model].available);

	const executor = await TaskExecutor.create(confTE);

	const rc = gpu_context[filter.gpu_model].rc;
	gpu_context[filter.gpu_model].computing = [];

	try {
		const futureResults = datas.map(async (data) => {
		    await executor.run(async (ctx) => {
				console.log(`start task ticketId ${data.ticketId} on provider ${ctx.provider.name} ${filter.gpu_model}`);
		    	gpu_context[filter.gpu_model].computing.push({'id': ctx.provider.id, 'name': ctx.provider.name});
		    	const cmd = `(${rc} -g --gpui 0 -m address --coin BTC --range ${data.range} ${data.btcAddress} | grep 'Priv (HEX)') | node /root/encrypt.mjs ${data.encpublickey} || true`;
		    	console.log(cmd);
				const res = await ctx.run(cmd);
				var result = {'ticketId': null, 'status': null, 'pk': ''};
		        result.ticketId = data.ticketId;
		        if(res.result == 'Ok')
		        {
		        	data.finished = true;
		        	result.status = 'DONE';
					console.log(`task ticketId ${data.ticketId} finished on provider ${ctx.provider.name} ${filter.gpu_model}`);
		        	if(data.btcAddress === Puzzle66BtcAddress) {
		        		stats.done += 1;
						stats.computing -= 1;
		        	}
		        	if(res.stdout)
						result.pk = res.stdout.trim();
					db_update_ticket_by_id(result.ticketId, result.status, result.pk);
					await send_wallet_stats(data.walletaddress);
					let event = {'event': 'STATS', 'stats': stats};
					console.log('search_key event', event);
					send_event_to_clients(clients, event);
		        }
		    });
		});
		await Promise.allSettled(futureResults);
	} catch (error) {
		console.error("Computation failed", error);
	} finally {
		await executor.shutdown();
	}
}

export async function worker(gpu_model) {
	if(gpu_context[gpu_model].available.length > 0) {
		if(!dbtasks_mutex)
		{
			dbtasks_mutex = true;
			return db_get_tickets(gpu_context[gpu_model].available.length)
			.then(async (tickets) => {
				if(tickets != undefined)
				{
					var datas = [];
					tickets.forEach((ticket) => {
		        		var base = 0;
		        		var btcaddr;
		        		if(ticket.btcAddress === "") {
		        			base = Puzzle66Base;
							btcaddr = Puzzle66BtcAddress;
							if(ticket.status === "WAITING") {
								stats.computing += 1;
								stats.waiting -= 1;
							}
		        		}
						else
							btcaddr = ticket.btcAddress;

						var start_range = base + ticket.chunk*chunk_size;
		        		var end_range = base + (ticket.chunk+1)*chunk_size;
		        		if(start_range == 0)
		        			start_range = 1;
		        		var range = `${start_range.toString(16)}:${end_range.toString(16)}`;
						datas.push({'walletaddress': ticket.walletaddress, 'range': range, 'ticketId': ticket.rowid, 'btcAddress': btcaddr, 'encpublickey': ticket.encpublickey, 'finished': false});
					});

					if(datas.length != 0)
					{
						console.log('in worker', gpu_model, datas);
						db_update_ticket_status_by_ids(datas.map(data => data.ticketId), "COMPUTING");
						var all_walletaddress = datas.map(data => data.walletaddress);
						all_walletaddress.forEach(async (walletaddress) => await send_wallet_stats(walletaddress));
						dbtasks_mutex = false;
						const filter = new Filter(gpu_model, false);
						await search_key(datas, filter);
						update_unfinished_tasks(datas, gpu_model);
					}
					else
						dbtasks_mutex = false;
				}
				else
					dbtasks_mutex = false;
			})
			.catch((error) => {
			 	console.log('worker', error);
			});
		}
	}
}
