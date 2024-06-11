import { pay_ticket, ChunkSize, Puzzle66BtcAddress, Puzzle66DefaultRange, Puzzle66Base, Puzzle66MaxChunk, old_puzzles, PolygonNetwork, PuzzleHost } from './utils.js';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import InputGroup from 'react-bootstrap/InputGroup';
import { useState } from 'react';
import { setMessage } from './Message.js';
import { Hammer, ExclamationOctagon } from 'react-bootstrap-icons';
import { useEffect } from 'react';

export const Play = (data) => {

	const [btcAddress, setBtcAddress] = useState(Puzzle66BtcAddress);
	const [btcTestAddress, setBtcTestAddress] = useState(old_puzzles[0].address);
	const [chunk, setChunk] = useState(0);
	const [chunkTest, setChunkTest] = useState(0);
	const [SelectManualMode, SetSelectManualMode] = useState(false);
	const [maxChunk, setMaxChunk] = useState(Puzzle66MaxChunk);
    const [range, setRange] = useState(Puzzle66DefaultRange);
	const [Quantity, setQuantity] = useState(1);
	const [Probability, SetProbability] = useState("1/8388608");
	const [Base, SetBase] = useState(Puzzle66Base);
	const [Test, setTest] = useState(false);
	const [TestIndex, setTestIndex] = useState(0);

	const handleBtcAddressChange = (event) => {
		if(event.target.value === "")
			setBtcAddress(Puzzle66BtcAddress);
		else
        	setBtcAddress(event.target.value);
    };

    const handleChunkChange = (event) => {
    	if(event.target.value > (maxChunk -1))
    		setChunk(maxChunk -1);
    	else if(event.target.value < 0)
    		setChunk(0);
    	else
    		setChunk(event.target.value);
    };

	const handleQuantityChange = (event) => {
		if(event.target.value > 100)
    		setQuantity(100);
    	else if(event.target.value < 1)
    		setQuantity(1);
    	else
    		setQuantity(event.target.value);
    };

    const handleTestChange = (event) => {
		setTest(!Test)
    };

    const handleTestPuzzleChange = (event) => {
    	setTestIndex(event.target.value);
    };

    const handleSelectModeChange = (event) => {
    	SetSelectManualMode(!SelectManualMode);
    };

    useEffect(() => {
    	if(Test) {
    		setBtcAddress(old_puzzles[TestIndex].address);
    		setChunk(old_puzzles[TestIndex].chunk);
    		setQuantity(1);
    	}
    	else {
    		setBtcAddress(Puzzle66BtcAddress);
    		setChunk(0);
    	}
    }, [Test, TestIndex]);

    useEffect(() => {
        if(btcAddress === Puzzle66BtcAddress) {
			setMaxChunk(Puzzle66MaxChunk);
			SetBase(Puzzle66Base);
        }
		else {
			setMaxChunk(Number(2n**256n));
			SetBase(0);
		}
    }, [btcAddress]);

    useEffect(() => {
    	if(chunk > maxChunk)
    		setChunk(maxChunk);
    }, [maxChunk, chunk]);

    useEffect(() => {
    	const sr = Base + chunk*ChunkSize;
    	const er = sr + Quantity*ChunkSize;
    	setRange(`${sr.toString(16)}:${er.toString(16)}`);
    }, [chunk, Base, Quantity]);

    useEffect(() => {
    	SetProbability(`${Quantity}/${(Puzzle66MaxChunk - data.stats.done - data.stats.computing - data.stats.waiting)}`);
    }, [Quantity, data.stats.done, data.stats.computing, data.stats.waiting]);

    function play(account, setShowMessage, setVariantMessage, setHeadingMessage, setContentMessage) {
    	const rand = SelectManualMode?"false":"true";
    	data.setWaitPayment(true);
        pay_ticket(account, Quantity).then(async (resp) => {
        	if(resp) {
	            if(!resp.err)
	                return {'err': null, 'ret': await fetch(`https://${PuzzleHost}:444/play?clientid=${data.ClientId}&btcaddress=${btcAddress}&chunk=${chunk}&rand=${rand}&quantity=${Quantity}&txhash=${resp.txhash}&encPublicKey=${btoa(resp.encPublicKey)}`)};
	            else
	                return {'err': resp.err, 'ret': null};
        	}
        }).then((resp2) => {
        	data.setWaitPayment(false);
        	if(resp2) {
	            if(!resp2.err) {
	                if(resp2.ret.status === 200)
	                	setMessage(setShowMessage, setVariantMessage, setHeadingMessage, setContentMessage, 'success', 'Success', ['Payment successful']);
	                else
	                	setMessage(setShowMessage, setVariantMessage, setHeadingMessage, setContentMessage, 'danger', 'Error', ['Failed payment']);
	            }
	            else
	            	setMessage(setShowMessage, setVariantMessage, setHeadingMessage, setContentMessage, 'danger', 'Error', [resp2.err]);
        	}
        });
    }

    return (
    	<div>
    	{(data.BtcPuzzleBalance.toFixed(1) >= 6.6) ? (
    		<div>
	    		{(data.chainId === PolygonNetwork.chainId) ? (
			    	<div className="text-center my-4">
			    		<Row>
				        	<Col sm={{span: 12, offset: 0}} xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}} xl={{span: 8, offset: 2}} xxl={{span: 6, offset: 3}}>
					        	<InputGroup className="mb-3">
					        		<Form.Check id="test" type="switch" onChange={handleTestChange} label="Test with previous puzzles"/>
					      		</InputGroup>
				      		</Col>
				      	</Row>
			    		{ Test ? (
					      	<Row>
					        	<Col sm={{span: 12, offset: 0}} xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}} xl={{span: 8, offset: 2}} xxl={{span: 6, offset: 3}}>
						        	<InputGroup className="mb-3">
						        		<Form.Select id="testpuzzle" className="text-center" value={TestIndex} onChange={handleTestPuzzleChange}>
						        			{old_puzzles.map((puzzle, index) => (
												<option key={index} value={index}>Puzzle {index+1}</option>
											))}
									    </Form.Select>
						      		</InputGroup>
					      		</Col>
					      	</Row>
				      	) :
				      		<Row className="mb-4">
				    			{(btcAddress === Puzzle66BtcAddress) ? (
					    			<div className="mb-3">
						    			<b className={"text-center mb-3 cwhite" + (!data.darkMode.value?"cwhite":"")}>THE PUZZLE REMAINS OPEN UNTIL THE PRIVATE KEY IS FOUND</b>
						    			<div className="text-center">100 chunks max by purchase</div>
					    			</div>
				    			) : null}
				    			<Row>
						        	<Col sm={{span: 12, offset: 0}} xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}} xl={{span: 8, offset: 2}} xxl={{span: 6, offset: 3}}>
							        	<InputGroup className="mb-3">
							        		<Form.Check id="start" type="switch" checked={SelectManualMode} onChange={handleSelectModeChange} label="Choose your starting chunk"/>
							      		</InputGroup>
						      		</Col>
						      	</Row>
								{(btcAddress === Puzzle66BtcAddress) ? (
									<div>
										<div className="text-center mb-4">
											{ SelectManualMode ? (
					    						"All chunks will be selected from the specified one in ascending order ensuring they are not already scanned"
					    					) :
					    						"All chunks will be selected randomly ensuring they are not already scanned"
					    					}
				    					</div>
										<Row className="mb-0">
											<Col sm={{span: 12, offset: 0}} xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}} xl={{span: 8, offset: 2}} xxl={{span: 6, offset: 3}}>
												<InputGroup className="mb-3 prevent-select">
													<InputGroup.Text>Probability to win</InputGroup.Text>
													<Form.Control id="probability" disabled readOnly type="text" value={Probability} className="text-center input-disabled"/>
												</InputGroup>
											</Col>
										</Row>
						    		</div>
				    			) :
									<div>
										<b className="text-center mb-3">All chunks will be selected from the specified one in ascending order.</b>
										<div className="text-center mt-3 mb-3">
							    			<b className="cred"><ExclamationOctagon/> This is no longer the address of BTC puzzle 66.</b><br/>
							    			<b className="cred">Please be sure to use compressed format.</b>
					    				</div>
									</div>
								}
				    		</Row>
				      	}
				        <Row>
				        	<Col sm={{span: 12, offset: 0}} xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}} xl={{span: 8, offset: 2}} xxl={{span: 6, offset: 3}}>
					        	<InputGroup className="mb-3 prevent-select">
					        		<InputGroup.Text>BTC address</InputGroup.Text>
					        		<Form.Control id="btcaddress" disabled={Test} readOnly={Test} type="text" maxLength="35" onChange={handleBtcAddressChange} value={btcAddress} spellCheck="false" className={"text-center " + (Test?"input-disabled":"")}/>
					      		</InputGroup>
				      		</Col>
				      	</Row>
				      	{ (SelectManualMode || Test) ? (
					      	<div>
						      	<Row>
						      		<Col sm={{span: 12, offset: 0}} xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}} xl={{span: 8, offset: 2}} xxl={{span: 6, offset: 3}}>
							      		<InputGroup className="mb-3 prevent-select">
							        		<InputGroup.Text>Starting Chunk</InputGroup.Text>
							        		<Form.Control id="chunk" disabled={Test} readOnly={Test} type="number" min="0" max={(maxChunk -1).toString()} onChange={handleChunkChange} value={chunk} className={"text-center " + (Test?"input-disabled":"")}/>
							      		</InputGroup>
						      		</Col>
						      	</Row>
						      	{(btcAddress != Puzzle66BtcAddress) ? (
							      	<Row>
							      		<Col sm={{span: 12, offset: 0}} xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}} xl={{span: 8, offset: 2}} xxl={{span: 6, offset: 3}}>
								      		<InputGroup className="mb-3 prevent-select">
								        		<InputGroup.Text>Range</InputGroup.Text>
								        		<Form.Control id="range" disabled readOnly type="text" maxLength="129" value={range} className="text-center input-disabled"/>
								      		</InputGroup>
							      		</Col>
							      	</Row>
						      	) : null}
					      	</div>
				      	) : null}
				      	<Row className="mb-4">
				      		<Col sm={{span: 12, offset: 0}} xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}} xl={{span: 8, offset: 2}} xxl={{span: 6, offset: 3}}>
					      		<InputGroup className="mb-3 prevent-select">
					        		<InputGroup.Text>Quantity</InputGroup.Text>
				        			<Form.Control id="quantity" disabled={Test} readOnly={Test} type="number" min="1" max="100" onChange={handleQuantityChange} value={Quantity} className={"text-center " + (Test?"input-disabled":"")}/>
					      		</InputGroup>
				      		</Col>
				      	</Row>
			    		<Col sm={{span: 12, offset: 0}} xs={{span: 12, offset: 0}} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}} xl={{span: 8, offset: 2}} xxl={{span: 6, offset: 3}} className="px-2">
			    			{ (data.GlmBalance < 0.6) || (data.MaticBalance < 0.005) ? (
			    				<div className="text-center mt-3 mb-3">
									<b className="cred"><ExclamationOctagon/> You cand buy easily GLM & MATIC tokens here: </b>
					    			<a href="https://glm.golem.network/#/onboarding/budget" target="_blank">
					    				https://glm.golem.network/#/onboarding/budget
					    			</a>
			    				</div>
			    			) : null}
				    		<Table responsive bordered className="text-center prevent-select">
							    <thead>
							        <tr>
							            <th></th>
							            <th><img src="/GLM.svg" alt="Logo" width="40" height="40"/> GLM</th>
							            <th><img src="/MATIC.svg" alt="Logo" width="40" height="40"/> MATIC</th>
							        </tr>
							    </thead>
							    <tbody>
							        <tr>
							            <td><b>Costs</b></td>
							            <td>{(0.6*Quantity).toFixed(1)}</td>
							            <td>&lt; 0.01</td>
							        </tr>
							        <tr>
							            <td><b>Your balances</b></td>
							            <td>{data.GlmBalance}</td>
							            <td>{data.MaticBalance}</td>
							        </tr>
							    </tbody>
							</Table>
						</Col>
			            <Button className="mt-4" size="lg" variant="info" onClick={() => play(data.account, data.setShowMessage, data.setVariantMessage, data.setHeadingMessage, data.setContentMessage)}>
			            	<Hammer className="mx-4"/>
			            </Button>
			        </div>
		        ) :
					<div className="text-center my-4">
		            	<b>Please refresh and accept the network switch to Polygon.</b>
		            </div>

				}
	        </div>
	    ) :
			<div className="text-center my-4">
            	<b>The puzzle is now closed, {data.BtcPuzzleBalance} BTC remaining.</b>
            </div>
        }
        </div>
    )
}