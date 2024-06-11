import global from './global.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const db_create_sqls =  [	'CREATE TABLE IF NOT EXISTS purchases (walletaddress TEXT, numberTicketBuyed INTEGER, date INTEGER)',
							'CREATE TABLE IF NOT EXISTS tickets (purchaseId INTEGER, chunk INTEGER, status TEXT, btcAddress TEXT, pk TEXT, encpublickey TEXT)',

							'CREATE INDEX IF NOT EXISTS walletaddress ON purchases (walletaddress ASC)',
							'CREATE INDEX IF NOT EXISTS date ON purchases (date ASC)',

							'CREATE INDEX IF NOT EXISTS purchaseId ON tickets (purchaseId ASC)',
							'CREATE INDEX IF NOT EXISTS chunk ON tickets (chunk ASC)',
							'CREATE INDEX IF NOT EXISTS status ON tickets (status ASC)'
						];

export async function init_db() {
	db = await open({
      filename: '../puzzle.db',
      driver: sqlite3.Database
    });

    await db_create_sqls.forEach(function (sql_req){
    	db.exec(sql_req);
    });

    await db.run('UPDATE tickets SET status = "WAITING" WHERE status == "COMPUTING"');
}

export async function db_add_purchase(walletaddress, numberTicketBuyed, date) {
	const sqlr = `INSERT INTO purchases VALUES ("${walletaddress}", ${numberTicketBuyed}, ${date})`;
	const result = await db.run(sqlr);
	return result.lastID;
}

export async function db_add_tickets(purchaseId, values) {
	const sqlr = `INSERT INTO tickets VALUES ${values}`;
	const result = await db.run(sqlr);
	return result;
}

export async function db_get_tickets(limit) {
	const sqlr = `SELECT tickets.rowid, purchaseId, chunk, status, btcAddress, walletaddress, encpublickey FROM tickets INNER JOIN purchases ON tickets.purchaseId = purchases.rowid WHERE status == "WAITING" ORDER BY tickets.rowid ASC LIMIT ${limit}`;
	const result = await db.all(sqlr);
	return result;
}

export async function db_update_ticket_by_id(ticketId, newStatus, newPk) {
	var sqlr;
	if((newPk == null) && (newStatus == null))
		return null;
	else if(newPk == null)
		sqlr = `UPDATE tickets SET status = "${newStatus}" WHERE rowid = ${ticketId}`;
	else if(newStatus == null)
		sqlr = `UPDATE tickets SET pk = "${newPk}" WHERE rowid = ${ticketId}`;
	else
		sqlr = `UPDATE tickets SET status = "${newStatus}", pk = "${newPk}" WHERE rowid = ${ticketId}`;
	const result = await db.run(sqlr);
	return result;
}

export async function db_update_ticket_status_by_ids(ticketIds, newStatus) {
	var sqlr;
	if(newStatus == null)
		return null;
	else
		sqlr = `UPDATE tickets SET status = "${newStatus}" WHERE rowid IN (${ticketIds.join(", ")})`;
	const result = await db.run(sqlr);
	return result;
}

export async function db_get_data_by_walletaddress(walletaddress) {
	const sqlr = `SELECT tickets.purchaseId, chunk, status, btcAddress, tickets.pk, date
				FROM tickets
				JOIN purchases ON tickets.purchaseId = purchases.rowid
				INNER JOIN (SELECT purchaseId, SUM(CASE WHEN status = "DONE" THEN 1 ELSE 0 END) AS pDone FROM tickets GROUP BY purchaseId) AS purchases_done ON tickets.purchaseId = purchases_done.purchaseId
				INNER JOIN (SELECT purchaseId, SUM(CASE WHEN pk != ""THEN 1 ELSE 0 END) AS pWin	FROM tickets GROUP BY purchaseId) AS purchases_win ON tickets.purchaseId = purchases_win.purchaseId
				WHERE (purchases.walletaddress = "${walletaddress}") AND ((purchases_done.pDone != purchases.numberTicketBuyed) OR (purchases_win.pWin != 0))`;
	const result = await db.all(sqlr);
	return result;
}

export async function db_get_stats() {
	const sqlr_count_done = 'SELECT COUNT(*) AS cnt FROM tickets WHERE (status = "DONE") AND (btcAddress == "")';
	const sqlr_count_computing = 'SELECT COUNT(*) AS cnt FROM tickets WHERE (status = "COMPUTING") AND (btcAddress == "")';
	const sqlr_count_waiting = 'SELECT COUNT(*) AS cnt FROM tickets WHERE (status = "WAITING") AND (btcAddress == "")';
	const count_done = await db.all(sqlr_count_done);
	const count_computing = await db.all(sqlr_count_computing);
	const count_waiting = await db.all(sqlr_count_waiting);
	return {'done': count_done[0]['cnt'], 'computing': count_computing[0]['cnt'], 'waiting': count_waiting[0]['cnt']};
}

export async function db_get_walletaddress_stats(walletaddress) {
	const sqlr_count_done = `SELECT COUNT(*) AS cnt FROM tickets JOIN purchases ON tickets.purchaseId = purchases.rowid WHERE (status = "DONE") AND (btcAddress == "") AND (walletaddress = "${walletaddress}")`;
	const sqlr_count_computing = `SELECT COUNT(*) AS cnt FROM tickets JOIN purchases ON tickets.purchaseId = purchases.rowid WHERE (status = "COMPUTING") AND (btcAddress == "") AND (walletaddress = "${walletaddress}")`;
	const sqlr_count_waiting = `SELECT COUNT(*) AS cnt FROM tickets JOIN purchases ON tickets.purchaseId = purchases.rowid WHERE (status = "WAITING") AND (btcAddress == "") AND (walletaddress = "${walletaddress}")`;
	const sqlr_last_purchase = `SELECT numberTicketBuyed, date FROM purchases WHERE walletaddress = "${walletaddress}" ORDER BY date DESC LIMIT 1`;
	const count_done = await db.all(sqlr_count_done);
	const count_computing = await db.all(sqlr_count_computing);
	const count_waiting = await db.all(sqlr_count_waiting);
	const last_purchase = await db.all(sqlr_last_purchase);

	var lp = null;
	if(last_purchase.length > 0)
		lp = {'chunks': last_purchase[0]['numberTicketBuyed'], 'date': last_purchase[0]['date']};

	return {'last_purchase': lp, 'chunks_stats': {'done': count_done[0]['cnt'], 'computing': count_computing[0]['cnt'], 'waiting': count_waiting[0]['cnt']}};
}