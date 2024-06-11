import 'bootstrap/dist/css/bootstrap.min.css';

import { web3, init_pos_client, get_GLM_Polygon_balance, get_MATIC_balance, PuzzleHost, PolygonNetwork } from './utils.js';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import React, { useState, useEffect } from 'react';
import { useMetaMask } from "metamask-react";
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { AuthenticatedContent } from './AuthenticatedContent.js';
import { PuzzleProgress } from './PuzzleProgress.js';
import { Play } from './Play.js';
import { Monitor } from './Monitor.js';
import { Message, setMessage } from './Message.js';
import { HistoryContent, HowItWorksContent } from './TabContent.js';
import useDarkMode from 'use-dark-mode';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import RingLoader from "react-spinners/RingLoader";
import {Buffer} from 'buffer';

var interval = null;

const sse = new EventSource(`https://${PuzzleHost}:444/connect`);

function authenticate(s_clientid, account, SetAuthenticated) {
    web3.currentProvider.request({
        method: "personal_sign",
        params: [Buffer.from(s_clientid, 'utf8').toString('hex'), account],
    }).then((signature) => {
        fetch(`https://${PuzzleHost}:444/authenticate?clientid=${s_clientid}&signedclientid=${signature}&walletaddress=${account}`)
        .then((resp) => {
            if(resp.status === 200)
                SetAuthenticated(true);
        });
    });
}

function App() {

    const [BtcPuzzleBalance, SetBtcPuzzleBalance] = useState(0);
    const [GlmBalance, SetGlmBalance] = useState(0);
    const [MaticBalance, SetMaticBalance] = useState(0);

    const [ClientId, SetClientId] = useState(0);
    const [ClientDatas, SetClientDatas] = useState(null);
    const [Authenticated, SetAuthenticated] = useState(false);

    const [ShowMessage, setShowMessage] = useState(false);
    const [VariantMessage, setVariantMessage] = useState('');
    const [HeadingMessage, setHeadingMessage] = useState('');
    const [ContentMessage, setContentMessage] = useState('');

    const { status, connect, account, chainId, addChain } = useMetaMask();
    const [ChecksumAddress, SetChecksumAddress] = useState('');

    const [Color, SetColor] = useState('#fff');

    const [TabKey, SetTabKey] = useState('history');
    const [Index, SetIndex] = useState(null);

    const [Stats, SetStats] = useState({'waiting': 0, 'computing': 0, 'done': 0});
    const [UserStats, SetUserStats] = useState({'last_purchase': {'chunks': 0, 'date': 0}, 'chunks_stats': {'done': 0, 'computing': 0, 'waiting': 0}});

    const darkMode = useDarkMode(false);

    const [ServerDisconnected, SetServerDisconnected] = useState(false);

    const [waitPayment, setWaitPayment] = useState(false);

    function get_balances() {
        if(account) {
            get_GLM_Polygon_balance(account)
            .then((glm_polygon_balance) => {
                SetGlmBalance(glm_polygon_balance.toFixed(2));
                return get_MATIC_balance(account);
            })
            .then((matic_balance) => {
                SetMaticBalance(matic_balance.toFixed(2));
            });
        }
    }

    if(interval)
        clearInterval(interval)
    interval = setInterval(get_balances, 1000);

    sse.onmessage = e => {
        try {
            var data = JSON.parse(e.data);
            if(data.stats)
                SetStats(data.stats);
            if(data.user_stats)
                SetUserStats(data.user_stats);
            if(data.balance)
                SetBtcPuzzleBalance(data.balance);
            if(data.clientId)
                SetClientId(data.clientId);
            if(data.datas)
                SetClientDatas(data.datas);
            if(data.event === 'SYNC_ADD') {
                SetTabKey("monitor");
                SetIndex(0);
            }
        }
        catch {
            console.log(e.data);
        }
    }

    sse.onerror = () => {
        sse.close();
        SetServerDisconnected(true);
        setMessage(setShowMessage, setVariantMessage, setHeadingMessage, setContentMessage, 'danger', 'Error', ['Connection closed, please refresh']);
    }

    useEffect(() => {
        if(account) {
            SetChecksumAddress(web3.utils.toChecksumAddress(account));
            init_pos_client(account);
            if(chainId != PolygonNetwork.chainId)
                addChain(PolygonNetwork);
        }

    }, [account]);

    useEffect(() => {
        if(darkMode.value)
            SetColor('#333');
        else
            SetColor('#fff');
    }, [darkMode]);

    return (
        <div id="App" className="App h-100">
            <Navbar className="bg-body-tertiary prevent-select">
                <Col className="pl12" xs="9" sm="10" md="3" lg="1" xl="1" xxl="1">
                    <Navbar.Brand id="navbrand">
                            <img src="/logo.svg" alt="Logo" width="30" height="30"/>
                            <h4 className="mb-0 mx-2">Bitcoin Puzzle 66</h4>
                    </Navbar.Brand>
                </Col>
                <Col className="text-center d-none d-md-block" md="7" lg="9" xl="10" xxl="10">
                    <b className="cblack">{ ChecksumAddress && (
                        ChecksumAddress
                    )}</b>
                </Col>
                <Col className="tar-pr12" xs="3" sm="2" md="2" lg="2" xl="1" xxl="1">
                    <a className="mx-3" href="https://github.com/norbibi/Golem_Bitcoin_Puzzle" target="_blank">
                        <img src="/github-mark.svg" alt="github" width="25" height="25"/>
                    </a>
                    <DarkModeSwitch checked={darkMode.value} onChange={darkMode.toggle} moonColor={"black"} size={25}/>
                </Col>
            </Navbar>

            <b className="d-md-none d-lg-none d-xl-none d-xxl-none">{ ChecksumAddress && (
                <Navbar className="pt-0 bg-body-tertiary">
                    <Col className="pl12 cblack" xs="12" sm="12" md="12" lg="12" xl="12" xxl="12">
                        { ChecksumAddress }
                    </Col>
                </Navbar>
            )}</b>

            <RingLoader
                color={"#ffffff"}
                loading={waitPayment}
                cssOverride={{margin: "0 auto", marginTop: "20px"}}
                size={150}
                aria-label="Loading Spinner"
                data-testid="loader"
              />

            <Message show={ShowMessage} setShowMessage={setShowMessage} variant={VariantMessage} heading={HeadingMessage} content={ContentMessage}/>
            <PuzzleProgress available={8388608} played={Stats.done} computing={Stats.computing} waiting={Stats.waiting} Color={Color}/>
            <Container className="my-4" style={{'backgroundColor': Color}}>
                <Tabs activeKey={TabKey} onSelect={(k) => SetTabKey(k)} id="tab" className="mb-3 prevent-select">
                    <Tab eventKey="play" title="Play">
                        <AuthenticatedContent   status={status}
                                                Authenticated={Authenticated}
                                                content={<Play  ClientId={ClientId}
                                                                account={ChecksumAddress}
                                                                chainId={chainId}
                                                                setShowMessage={setShowMessage}
                                                                setVariantMessage={setVariantMessage}
                                                                setHeadingMessage={setHeadingMessage}
                                                                setContentMessage={setContentMessage}
                                                                stats={Stats}
                                                                GlmBalance={GlmBalance}
                                                                MaticBalance={MaticBalance}
                                                                BtcPuzzleBalance={BtcPuzzleBalance}
                                                                darkMode={darkMode}
                                                                setWaitPayment={setWaitPayment}/>}
                                                connect={connect}
                                                authenticate={authenticate}
                                                ClientId={ClientId}
                                                account={ChecksumAddress}
                                                SetAuthenticated={SetAuthenticated}
                                                ServerDisconnected={ServerDisconnected}/>
                    </Tab>
                    <Tab eventKey="monitor" title="Monitor">
                        <AuthenticatedContent   status={status}
                                                Authenticated={Authenticated}
                                                content={<Monitor   Datas={ClientDatas}
                                                                    Index={Index}
                                                                    SetIndex={SetIndex}
                                                                    account={ChecksumAddress}
                                                                    setShowMessage={setShowMessage}
                                                                    setVariantMessage={setVariantMessage}
                                                                    setHeadingMessage={setHeadingMessage}
                                                                    setContentMessage={setContentMessage}
                                                                    UserStats={UserStats}/>}
                                                connect={connect}
                                                authenticate={authenticate}
                                                ClientId={ClientId}
                                                account={ChecksumAddress}
                                                SetAuthenticated={SetAuthenticated}
                                                ServerDisconnected={ServerDisconnected}/>
                    </Tab>
                    <Tab eventKey="history" title="History">
                        <HistoryContent darkMode={darkMode}/>
                    </Tab>
                    <Tab eventKey="howitworks" title="How It Works">
                        <HowItWorksContent darkMode={darkMode}/>
                    </Tab>
                </Tabs>
            </Container>
        </div>
    );
}

export default App;
