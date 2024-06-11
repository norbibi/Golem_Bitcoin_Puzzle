import gpu_context from './config.json' assert { type: 'json' };

Object.getOwnPropertyNames(gpu_context).forEach((gpu_model) => {
	gpu_context[gpu_model].available = [];
	gpu_context[gpu_model].computing = [];
});

global.PORT = 3001;

global.clients = [];
global.purchases = [];
global.stats = null;

global.Puzzle66BtcAddress = "13zb1hQbWVsc2S7ZTZnP2G4undNNpdh5so";
global.Puzzle66MaxChunk = 8388608;
global.Puzzle66Base = parseInt("20000000000000000", 16);

global.infuraKey = process.env["INFURA_KEY"];
global.appKey = process.env["YAGNA_APPKEY"];
global.chunk_size = parseInt("40000000000", 16);
global.subnet = "public";
global.driver = "erc20";
global.network = "polygon";

global.BaseConfigTaskExecutor = {	package: "27e9ba5bc482deeb68f268178b109a491f295f325c584fd6ccf3ebf1",
									capabilities: ["!exp:gpu"],
									engine: "vm-nvidia",
									subnetTag: subnet,
									payment: { driver, network },
									startupTimeout: 1000 * 60 * 2,
									exitOnNoProposals: true,
									maxTaskRetries: 0,
									taskStartupTimeout: 1000 * 60 * 2
								};

global.db = null;

global.YagnaWalletAddress = process.env["PUZZLE_WALLET"];
global.ticket_price = 600000000000000000;

global.erc20TransferABI = [ {
						        type: "address",
						        name: "receiver"
						    },{
						        type: "uint256",
						        name: "amount"
						    }];

global.gpu_context = gpu_context;

export default global;