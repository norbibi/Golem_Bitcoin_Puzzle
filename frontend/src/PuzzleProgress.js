import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';
import MultiProgress from 'react-multi-progress';
import { Puzzle, Clock, Gear, Check } from 'react-bootstrap-icons';

export const PuzzleProgress = (data) => {

    return (
        <Container className="mt-4 mb-4">
            <Stack gap={4}>
            <Row>
                <div className="text-center pt-2 pb-1 prevent-select">
                    <h2><b className="rainbowText">LET'S TRY TO BRUTE FORCE A BITCOIN WALLET OF 6.6 BTC</b></h2>
                </div>
            </Row>
            <Row>
                <div className="px-0">
                    <Table bordered className="text-center same-col-widths mb-0 prevent-select">
                        <thead>
                            <tr>
                                <th><Puzzle /></th>
                                <th><Check /></th>
                                <th><Gear /></th>
                                <th><Clock /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="available">{data.available}</td>
                                <td className="played">{data.played}</td>
                                <td className="computing">{data.computing}</td>
                                <td className="waiting">{data.waiting}</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </Row>
            <Row>
                <div className="px-0">
                    <MultiProgress
                        elements={[
                            {
                                value: (data.played/data.available)*100,
                                color: "#75b798",
                            },
                            {
                                value: (data.computing/data.available)*100,
                                color: "#fff3cd",
                            },
                            {
                                value: (data.waiting/data.available)*100,
                                color: "#ea868f",
                            },
                            {
                                value: 100,
                                color: "#0dcaf0",
                            }
                        ]}
                    />
                </div>
            </Row>
            </Stack>
        </Container>
    )
}