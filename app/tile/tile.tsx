import { useState } from 'react';

export function Tile(props: any) {

    const value = props.tileProps.value;
    const tileIndex = props.tileProps.tileIndex;
    const matches = props.matches;
    const canClickMore = props.tileProps.canClickMore;

    const [show, setShow] = useState(false);

    const clicked = (key: any, value: any) => {
        if((!show && canClickMore) || show) {
            props.tileClicked({key: key, value: value});
            setShow(!show);
        }
    }

    return (
        <div className={show ? (matches.includes(tileIndex) ? 'tile tile-match': 'tile tile-show'): 'tile tile-hidden'} 
            onClick={() => {
                if(!matches.includes(tileIndex)) {
                    clicked(tileIndex, value) 
                }
            }}>
            {show ? value: ""}
        </div>
    );
}
