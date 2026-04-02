import type { Route } from "./+types/home";
import { Tile } from "../components/tile";
import Timer from "../components/timer";

import { useState } from 'react';
import { Form } from 'react-router';

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Pick a Pair" },
        { name: "description", content: "A game of matching tiles. Match all the pairs to win the game." },
    ];
}


export async function clientLoader() {

    console.log(window.location.href);

    const height_choice: string | null = localStorage.getItem("height");
    const width_choice: string | null = localStorage.getItem("width");

    // width * height must be even
    let height: number = 4;
    let width: number = 4;
    if(height_choice != null && width_choice != null) {
        height = Number(height_choice)
        width = Number(width_choice)
    }
    const numbers: number = (height * width) / 2 

    let showtimer: string | null = localStorage.getItem("showtimer");
    if(showtimer == null) {
        showtimer = "none";
    }

    // create array with numbers twice
    const numsOne: number[] = Array.from({length: numbers}, (e, i)=> i);
    const numsTwo: number[] = Array.from({length: numbers}, (e, i)=> i);
    const nums: number[] = numsOne.concat(numsTwo);

    // randomise the nums array
    let ranNums = [] as number[];
    let i: number = nums.length;
    let j: number = 0;
    while (i--) {
        j = Math.floor(Math.random() * (i+1));
        ranNums.push(nums[j]);
        nums.splice(j,1);
    }

    // intialise other variables
    let tilesClicked = Array(); // stores the actual tiles that were clicked
    let matches: number[] = Array(); // stores keys of tiles that have been matched
    let currentlyClicked: number[] = Array(height*width).fill(0); // stores position of clicked tiles
    let index: number = 0; // for assigning keys

    return {ranNums, height, width, tilesClicked, matches, currentlyClicked, index, showtimer};
}


export async function clientAction({
  request,
}: Route.ClientActionArgs) {

    let formData = await request.formData();
    let action = formData.get("action") as String;

    if(action.includes("size6")) {
        localStorage.setItem("height", "6");
        localStorage.setItem("width", "6");
    }
    else {
        localStorage.setItem("height", "4");
        localStorage.setItem("width", "4");
    }

    if(action!.includes("timer")) {
        localStorage.setItem("showtimer", "flex");
    }
    else {
        localStorage.setItem("showtimer", "none");
    }

    window.location.reload();
}


export default function Home({loaderData}: Route.ComponentProps) {

    let {ranNums, height, width, tilesClicked, matches, currentlyClicked, index, showtimer} = loaderData;
    const [canClickMore, setCanClickMore] = useState<boolean>(true);
    const [message, setMessage] = useState<string>("");
    const [attempts, setAttempts] = useState<number>(0);
    const [complete, setComplete] = useState<boolean>(false);

    // get a row at a time of length width
    const arrayChunk = (arr: number[], n: number) => {
        const array: number[] = arr.slice();
        const chunks: number[][] = [];
        while (array.length) chunks.push(array.splice(0, n));
        return chunks;
    };

    // reset a tile after a wrong guess
    const tileReset = (keyToReset: number) => {
        setCanClickMore(true);
        currentlyClicked[keyToReset] = 0;
        for(let i=0; i<tilesClicked.length; i++) { 
            if(tilesClicked[i].key === keyToReset) {
                tilesClicked.splice(i, 1);
            }
        }
    }

    const tileClicked = (keyval: any) => {

        if(matches.includes(keyval.key)) {
            return
        }
        
        // mark a tile as clicked
        if(currentlyClicked[keyval.key] == 0 && tilesClicked.length < 2) {
            currentlyClicked[keyval.key] = 1
            tilesClicked.push(keyval);
        }

        // now check if we have a match
        if(tilesClicked.length === 2) {
            if(tilesClicked[0].value === tilesClicked[1].value) {
                matches.push(tilesClicked[0].key);
                matches.push(tilesClicked[1].key);
                setMessage("Found a pair :)");

                // reset
                tilesClicked.length = 0;
                currentlyClicked.fill(0);
                setCanClickMore(true);
            }
            else {
                setCanClickMore(false);
                setMessage("");
            }
            setAttempts(attempts+1);
        }
        else {
            setCanClickMore(true);
            setMessage("");
        }

        // Have we won?
        if (matches.length === (width * height)) {
            setComplete(true);
            setMessage("Congratulations!!!!");
        }
  }


  return (
        <div>
            <div className="block-temp">
                <span>Now at <a href="https://pickapair.co.uk">pickapair.co.uk</a></span>
            </div>
            <div className="block">
                <table>
                    <tbody>
                        { arrayChunk([...ranNums], width).map((row, i) => (
                        <tr key={i}>
                            {row.map((col: number, i: number) => (
                            <td key={index}>
                                <Tile key={index++} 
                                      matches={matches} 
                                      canClickMore={canClickMore} 
                                      tileProps={{ tileIndex: index, value: col }} 
                                      tileClicked={tileClicked} 
                                      tileReset={tileReset} />
                            </td>
                            ))}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="block">
                <Form method="post">
                    <table>
                        <tbody>
                            <tr>
                                <td className="button"><button type="submit" name="action" value="size4">Play 4x4</button></td>
                                <td className="button"><button type="submit" name="action" value="size4-timer">Play 4x4 (timed)</button></td>
                            </tr>
                            <tr>
                                <td className="button"><button type="submit" name="action" value="size6">Play 6x6</button></td>
                                <td className="button"><button type="submit" name="action" value="size6-timer">Play 6x6 (timed)</button></td>
                            </tr>
                        </tbody>
                    </table>
                </Form>
            </div>
            <div className="block">{message ? message : "Find all the pairs to win."}</div>
            <div className="block">{attempts + " attempt(s)"}</div>
            <div className="block" id="timer" style={{"display": showtimer}}>
                <Timer start={Date.now()} complete={complete} />
            </div>
        </div>
    );
}
