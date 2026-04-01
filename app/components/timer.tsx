import { useState, useEffect } from 'react';

const Timer = (props: any) => {
    const [hours, setHours] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(0);
    const [seconds, setSeconds] = useState<number>(0);

    const start: number = props.start;
    const complete: boolean = props.complete;

    const getTime = (start: any) => {
        const time: number = Date.now() - start;

        setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
        setMinutes(Math.floor((time / 1000 / 60) % 60));
        setSeconds(Math.floor((time / 1000) % 60));
    };

    useEffect(() => {
        const interval: ReturnType<typeof setInterval> = setInterval(() => getTime(start), 1000);
        if(complete) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [complete]);

    return (
        <div role="timer">
            <p id="timetaken">{hours>0 && hours+" hour(s) "} {minutes>0 && minutes+" minute(s) "} {seconds} seconds</p>
        </div>
    );
};

export default Timer;