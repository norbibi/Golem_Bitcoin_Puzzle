import global from './global.js';

export function get_client(clients, clientid) {
	const client = clients.filter(obj => obj.id == clientid);
	if(client.length != 0)
		return client[0];
	else
		return null;
}

export function get_purchase(purchases, walletaddress) {
	const purchase = purchases.filter(obj => obj.walletaddress == walletaddress);
	if(purchase.length != 0)
		return purchase[0];
	else
		return null;
}

export function send_event_to_client(client, event) {
	if(client)
		client.response.write(`data: ${JSON.stringify(event)}\n\n`);
}

export function send_event_to_clients(clients, event) {
	clients.forEach((client) => {
		send_event_to_client(client, event);
	});
}

export function send_event_to_wallet_clients(walletaddress, event) {
	get_clients_by_wallet(clients, walletaddress).forEach((client) => {
		if(client.authenticated)
			client.response.write(`data: ${JSON.stringify(event)}\n\n`);
	});
}

export function get_clients_by_wallet(clients, walletaddress) {
	return clients.filter(obj => obj.walletaddress === walletaddress);
}
