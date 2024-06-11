import Carousel from 'react-bootstrap/Carousel';
import { useState, useEffect } from 'react';

export const HistoryContent = (data) => {
    const [index, setIndex] = useState(0);

    const handleSelect = (selectedIndex) => {
        setIndex(selectedIndex);
    };

    useEffect(() => {
        setIndex(0);
    }, [data]);

    return (
    	<div className="pb-4 text-center">
            {!data.darkMode.value ? (
                <Carousel activeIndex={index} onSelect={handleSelect} className="carousel-dark">
                    <Carousel.Item>
                        <img src="history_0.svg" alt="" className="width70"/>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src="history_1.svg" alt="" className="width70"/>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src="history_2.svg" alt="" className="width70"/>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src="history_3.svg" alt="" className="width70"/>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src="history_4.svg" alt="" className="width70"/>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src="history_5.svg" alt="" className="width70"/>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src="history_6.svg" alt="" className="width70"/>
                    </Carousel.Item>
                </Carousel>
            ) : null}
            {data.darkMode.value ? (
                <Carousel activeIndex={index} onSelect={handleSelect}>
                    <Carousel.Item>
                        <img src="history_0_n.svg" alt="" className="width70"/>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src="history_1_n.svg" alt="" className="width70"/>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src="history_2_n.svg" alt="" className="width70"/>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src="history_3_n.svg" alt="" className="width70"/>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src="history_4_n.svg" alt="" className="width70"/>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src="history_5_n.svg" alt="" className="width70"/>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src="history_6_n.svg" alt="" className="width70"/>
                    </Carousel.Item>
                </Carousel>
            ) : null}
        </div>
    )
}

export const HowItWorksContent = (data) => {
    return (
    	<div className="pb-4 mt-4 text-center">
        	<p>
                <b>We know that the private key of Puzzle #66 is a number between 2^65 and 2^66-1.</b><br/>
                <b>This keyspace can be divided into 8388608 chunks of 0x40000000000 keys.</b>
            </p>
            <p>
                <b>Chunk analyse lasts 15 minutes on RTX4090 GPU.</b>
            </p>
            <p>
                <b>If we decided to look for the key by scanning all chunks on a single GPU, we would have to:</b><br/>
                <b>8388608 * 15 min = 125829120 min = 2097152 h = 87381 d</b>
            </p>
            <p>
                <b>This is why in this application we use Golem Network which allows us to perform computations on decentralized GPUs in a parallel way.</b>
            </p>
            {!data.darkMode.value ? (
                <img src="BtcPuzzle_light.svg" alt="" className="width100"/>
            ) : null}
            {data.darkMode.value ? (
                <img src="BtcPuzzle_dark.svg" alt="" className="width100"/>
            ) : null}
        </div>
    )
}
