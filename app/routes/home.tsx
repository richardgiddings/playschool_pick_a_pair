import type { Route } from "./+types/home";
import { Tile } from "../tile/tile";

import { useState } from 'react';
import { Form } from 'react-router';

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Playschool pick a pair" },
        { name: "description", content: "Playschool pick a pair game" },
    ];
}


export async function clientLoader() {

    let height_choice = localStorage.getItem("height");
    let width_choice = localStorage.getItem("width");

    // width * height must be even
    var height = 4;
    var width = 4;
    if(height_choice != null && width_choice != null) {
        height = Number(height_choice)
        width = Number(width_choice)
    }
    const numbers = (height * width) / 2 

    // create array with numbers twice
    var numsOne = Array.from({length: numbers}, (e, i)=> i);
    var numsTwo = Array.from({length: numbers}, (e, i)=> i);
    var nums = numsOne.concat(numsTwo);

    // randomise the nums array
    var ranNums = [];
    var i = nums.length;
    var j = 0;
    while (i--) {
        j = Math.floor(Math.random() * (i+1));
        ranNums.push(nums[j]);
        nums.splice(j,1);
    }

    // intialise other variables
    let tilesClicked = Array(); // stores the actual tiles that were clicked
    let matches = Array(); // stores keys of tiles that have been matched
    let currentlyClicked = Array(height*width).fill(0); // stores position of clicked tiles
    let index = 0; // for assigning keys


    return {ranNums, height, width, tilesClicked, matches, currentlyClicked, index};
}


export async function clientAction({
  request,
}: Route.ClientActionArgs) {

    let formData = await request.formData();
    let action = formData.get("action");

    if(action === "size6") {
        localStorage.setItem("height", "6");
        localStorage.setItem("width", "6");
    }
    else {
        localStorage.setItem("height", "4");
        localStorage.setItem("width", "4");
    }

    window.location.reload();
}


export default function Home({loaderData}: Route.ComponentProps) {

    let {ranNums, height, width, tilesClicked, matches, currentlyClicked, index} = loaderData;
    const [canClickMore, setCanClickMore] = useState(true);
    const [message, setMessage] = useState("");
    const [attempts, setAttempts] = useState(0);

    // get a row at a time of length width
    const arrayChunk = (arr: any, n: number) => {
        const array = arr.slice();
        const chunks = [];
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
            setMessage("Congratulations!!!!");
        }
  }


  return (
        <div>
            <div className="block">
                <table>
                    <tbody>
                        { arrayChunk([...ranNums], width).map((row, i) => (
                        <tr key={i}>
                            {row.map((col: number, i: number) => (
                            <td key={index}><Tile key={index++} matches={matches} canClickMore={canClickMore} tileProps={{ tileIndex: index, value: col }} tileClicked={tileClicked} tileReset={tileReset} /></td>
                            ))}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="block">
                <Form method="post">
                    <button type="submit" name="action" value="size4">Play 4x4</button>
                    <button type="submit" name="action" value="size6">Play 6x6</button>
                </Form>
            </div>
            <div className="block">{message ? message : "Find all the pairs to win."}</div>
            <div className="block">{attempts + " attempt(s)"}</div>
        </div>
    );
}
