import { useState, useEffect } from 'react';

export function Tile(props: any) {

    const value: number = props.tileProps.value;
    const tileIndex: number = props.tileProps.tileIndex;
    const matches: number[] = props.matches;
    const canClickMore: boolean = props.canClickMore;

    const [show, setShow] = useState<boolean>(false);

    // turn over guesses after a wrong attempt
    useEffect(() => {
        const timer: ReturnType<typeof setTimeout> = setTimeout(function() {
            if(show && !matches.includes(tileIndex)) {
                document.getElementById(String(tileIndex))!.className = 'tile tile-hidden';
                setShow(!show);
                props.tileReset(tileIndex);
            } 
         }, 500)
         return () => {
            clearTimeout(timer);
         }
    }, [canClickMore])

    // clicking of a tile
    const clicked = (key: number, value: number) => {
        if(!show && canClickMore && !matches.includes(tileIndex)) {
            props.tileClicked({key: key, value: value});
            setShow(!show);
        }
    }

    return (
        <div id={String(tileIndex)} 
             className={show ? (matches.includes(tileIndex) ? 'tile tile-match': 'tile tile-show'): 'tile tile-hidden'} 
             onClick={() => clicked(tileIndex, value)}>
            {show ? value: ""}
        </div>
    );
}
