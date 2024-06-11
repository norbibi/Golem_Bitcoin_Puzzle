import { encrypt } from '@metamask/eth-sig-util';

const encryptionPublicKey = process.argv[2];

if(process.argv[3])
	run_encryption(process.argv[3]);
else {
	var msg = '';
	process.stdin.on("data", data => {
	    msg += data;
	    if(msg != '') {
			run_encryption(msg.replace('\n', ''));
			process.exit();
	    }
	})
}

function run_encryption(message) {
	const buf = Buffer.from(
	    JSON.stringify(
	      	encrypt({
	      		publicKey: encryptionPublicKey,
	        	data: message,
	        	version: 'x25519-xsalsa20-poly1305'
	        })
	    ),
	    'utf8'
	)

	console.log('0x' + buf.toString('hex'));
}
