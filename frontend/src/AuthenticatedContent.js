import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { isMobile } from 'react-device-detect';

export const AuthenticatedContent = (data) => {

    return (
        <div className="pb-1">
            { isMobile ? (
                <div className="my-4 text-center">
                    <b>This application is only available on desktop.</b>
                </div>
            ) :
                <div>

                    { data.ServerDisconnected ? (
                        <div className="my-4 text-center">
                            <b>Disconnected from server, please refresh.</b>
                        </div>
                    ) :
                        <div>
                            { (data.status === "initializing") && (
                                <div className="my-4 text-center">
                                    <b>Synchronisation with MetaMask ongoing...</b>
                                </div>
                            )}
                            { (data.status === "unavailable") && (
                                <div className="my-4 text-center">
                                    <b>MetaMask not available :(, please install it.</b>
                                </div>
                            )}
                            { (data.status === "notConnected") && (
                                <div className="my-4 text-center">
                                    <Button onClick={data.connect} variant="primary">Connect to MetaMask</Button>{' '}
                                </div>
                            )}
                            { (data.status === "connecting") && (
                                <div className="my-4 text-center">
                                    <b>Connecting...</b>
                                </div>
                            )}
                            { (data.status === "connected") && data.Authenticated && (
                                data.content
                            )}
                            { (data.status === "connected") && !(data.Authenticated) && (
                                <Container className="my-4 text-center">
                                    <Button md="auto" onClick={e => data.authenticate(data.ClientId.toString(), data.account, data.SetAuthenticated)} variant="primary">Authenticate</Button>{' '}
                                </Container>
                            )}
                        </div>
                    }
                </div>
            }
        </div>
    )
}
