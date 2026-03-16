import { useState, useEffect } from 'react';

export function Tile(props: any) {

    const value = props.tileProps.value;
    const tileIndex = props.tileProps.tileIndex;
    const matches = props.matches;
    const canClickMore = props.canClickMore;

    const [show, setShow] = useState(false);

    // turn over guesses after a wrong attempt
    useEffect(() => {
        let timer = setTimeout(function() {
            if(show && !matches.includes(tileIndex)) {
                document.getElementById(tileIndex)!.className = 'tile tile-hidden';
                setShow(!show);
                props.tileReset(tileIndex);
            } 
         }, 500)
         return () => {
            clearTimeout(timer);
         }
    }, [canClickMore])

    // clicking of a tile
    const clicked = (key: any, value: any) => {
        if(canClickMore && !matches.includes(tileIndex)) {
            props.tileClicked({key: key, value: value});
            setShow(!show);
        }
    }

    return (
        <div id={tileIndex} 
             className={show ? (matches.includes(tileIndex) ? 'tile tile-match': 'tile tile-show'): 'tile tile-hidden'} 
             onClick={() => clicked(tileIndex, value)}>
            {show ? value: ""}
        </div>
    );
}
