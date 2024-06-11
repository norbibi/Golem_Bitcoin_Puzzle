import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import { Fragment, useState, useEffect } from 'react';
import { Clock, Key, Gear, Check } from 'react-bootstrap-icons';
import { setMessage } from './Message.js';
import { decrypt } from './utils.js';
import _ from 'underscore';
import { InfoSquare } from 'react-bootstrap-icons';
import { status_color, Puzzle66BtcAddress } from './utils.js';

const groupBy = (input, key) => {
    return input.reduce((acc, currentValue) => {
        let groupKey = currentValue[key];
    if(!acc[groupKey])
        acc[groupKey] = {'date': currentValue['date'], 'tickets': [], 'count': 1, 'status': null};
    else
        acc[groupKey].count = acc[groupKey].count + 1;

    acc[groupKey].tickets.push(currentValue);

    if(!acc[groupKey].status)
        acc[groupKey].status = (currentValue['pk'] !== '') ? 'WIN' : currentValue['status'];
    else {
        if((acc[groupKey].status === 'WIN') || (currentValue['pk'] !== ''))
            acc[groupKey].status = 'WIN';
        else if(((acc[groupKey].status === 'COMPUTING') || (currentValue['status'] === 'COMPUTING')) ||
            ((acc[groupKey].status === 'DONE') && (currentValue['status'] === 'WAITING')) ||
            ((acc[groupKey].status === 'WAITING') && (currentValue['status'] === 'DONE')))
            acc[groupKey].status = 'COMPUTING';
        else if((acc[groupKey].status === 'WAITING') && (currentValue['status'] === 'WAITING'))
            acc[groupKey].status = 'WAITING';
        else if((acc[groupKey].status === 'DONE') && (currentValue['status'] === 'DONE'))
            acc[groupKey].status = 'DONE';
    }

    return acc;
  }, {});
};

export const Monitor = (data) => {
    const Index = data.Index;
    const SetIndex = data.SetIndex;

    const [Datas, SetDatas] = useState([]);
    const [UserStats, SetUserStats] = useState({'last_purchase': {'chunks': 0, 'date': 0}, 'chunks_stats': {'done': 0, 'computing': 0, 'waiting': 0}});
    const [OtherDatas, SetOtherDatas] = useState(null);

    const handleClick = async (index) => {
        if(Datas[index].status === 'WIN') {
            const btcaddress = Datas[index].tickets[0].btcAddress;
            const enckey = _.without(_.uniq(Datas[index].tickets.map(ticket => ticket.pk)), "")[0];
            decrypt(data.account, enckey)
            .then((result) => {
                if(result.err)
                    setMessage(data.setShowMessage, data.setVariantMessage, data.setHeadingMessage, data.setContentMessage, 'danger', 'Error', [result.err]);
                else
                    setMessage(data.setShowMessage, data.setVariantMessage, data.setHeadingMessage, data.setContentMessage, 'info', 'Found', [`BTC address: ${btcaddress}`, `${result.message}`]);
            });
        }
        else if(Datas[index].status !== 'DONE') {
            if(Index == index)
                SetIndex(null);
            else
                SetIndex(index);
        }
        else
            SetIndex(null);
    };

    useEffect(() => {
        if((Index != undefined) && (Datas.length > 0)) {
            SetOtherDatas(Datas[Index].tickets);
            if(['DONE', 'WIN'].includes(Datas[Index].status))
                SetIndex(null);
        }
        else {
            SetIndex(null);
            SetOtherDatas(null);
        }

    }, [Index, Datas]);

    useEffect(() => {
        var tmp_datas = data.Datas;
        if(tmp_datas) {
            tmp_datas.forEach((ticket) => {
                if(ticket.btcAddress === '')
                    ticket.btcAddress = Puzzle66BtcAddress;
            });
            SetDatas(Object.values(groupBy(tmp_datas, 'purchaseId')).reverse());
            SetUserStats(data.UserStats);
        }
    }, [data]);

    return (
        <Container>
            <Row className="mb-4">
                <Accordion defaultActiveKey="0" className="mb-4">
                    <Accordion.Item eventKey="0" className="accbc">
                        <Accordion.Header><InfoSquare/><b>&nbsp;&nbsp;Informations</b></Accordion.Header>
                            <Accordion.Body className="text-center prevent-select">
                                <b>You can monitor chunk computations in real time from this panel.<br/>
                                Waiting and computing chunks can be displayed in detail by clicking on them.<br/>
                                The keys found by the providers are encrypted with your public key before being<br/>
                                uploaded to this server, they remain available in this table even after disconnection.<br/>
                                To recover the found keys <Key />, click on them to decrypt and view them.<br/>
                                Inconclusive chunks disappear after computation.</b>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                { UserStats.last_purchase ? (
                    <div className="text-center prevent-select">
                        <b>Last game:&nbsp;&nbsp; {new Date(UserStats.last_purchase.date*1000).toLocaleDateString()} {new Date(UserStats.last_purchase.date*1000).toLocaleTimeString()} - {UserStats.last_purchase.chunks} chunk(s)</b><br/>
                        <b>My puzzle 66 stats:&nbsp;&nbsp; {UserStats.chunks_stats.done} done - {UserStats.chunks_stats.computing} computing - {UserStats.chunks_stats.waiting} waiting</b>
                    </div>
                ) :
                    <b className="text-center">Last game: never played</b>
                }
            </Row>
            { UserStats.last_purchase ? (
                <Table responsive bordered hover className="text-center same-col-widths prevent-select">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Chunk count</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Datas.map((data, index) => (
                            <Fragment key={`${index}`}>
                                <tr style={{cursor: "pointer"}} onClick={() => handleClick(index)}>
                                    <td className={status_color[data.status]}>{new Date(data.date*1000).toLocaleDateString()} {new Date(data.date*1000).toLocaleTimeString()}</td>
                                    <td className={status_color[data.status]}>{data.count}</td>
                                    <td className={status_color[data.status]}>
                                        {(data.status === 'WIN') &&
                                            <Key/>
                                        }
                                        {(data.status === 'WAITING') &&
                                            <Clock/>
                                        }
                                        {(data.status === 'COMPUTING') &&
                                            <Gear />
                                        }
                                        {(data.status === 'DONE') &&
                                            <Check/>
                                        }
                                    </td>
                                </tr>
                                {OtherDatas && (Index == index) ? (
                                    <tr>
                                        <th className={status_color[data.status]}>BTC Address</th>
                                        <th className={status_color[data.status]}>Chunk number</th>
                                        <th className={status_color[data.status]}>Status</th>
                                    </tr>
                                ) : null}
                                {OtherDatas && (Index == index) ? (
                                    OtherDatas.map((dataother, indexother) => (
                                        <Fragment key={`${index}-${indexother}`}>
                                            <tr>
                                                <td className={status_color[dataother.status]}>{dataother.btcAddress}</td>
                                                <td className={status_color[dataother.status]}>{dataother.chunk}</td>
                                                <td className={status_color[dataother.status]}>
                                                    {(dataother.status === 'WAITING') &&
                                                        <Clock/>
                                                    }
                                                    {(dataother.status === 'COMPUTING') &&
                                                        <Gear/>
                                                    }
                                                    {(dataother.status == 'DONE') &&
                                                        <Check/>
                                                    }
                                                </td>
                                            </tr>
                                        </Fragment>
                                    ))
                                ) : null}
                            </Fragment>
                        ))}
                    </tbody>
                </Table>
            ) : null}
        </Container>
    )
}