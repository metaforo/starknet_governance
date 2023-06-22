import { useEffect, useState } from "react";
import {TextField} from "@mui/material";

import "../css/createPoll.css"
import add from '../icons/add.png'
import x from '../icons/x.png'
import check from '../icons/check.png'
import uncheck from '../icons/uncheck.png'

import axios from "axios";

export default function ViewPoll() {


    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [blockNumber, setBlockNumber] = useState('');
    const [options, setOptions] = useState(['','']);
    const [whiteLists, setWhiteLists] = useState(['']);



    return (
        <div className={"create_poll"}>
            <div className={"poll_process"}>
                Poll in Progress
            </div>

            <div className={"view_poll_title"}>
                Magic Square Community Validation: Orbofi AI on the Magic Store Voting
            </div>

            <div className={"time_block"}>
                <div className={"time_icon"}>

                </div>

                <div className={"time_content"}>
                    0xf432...6740  ·  May 8, 2023
                </div>
            </div>

            <div className={"view_poll_content"}>
                Welcome to the Magic Square Community Validation for Project Orbofi AI on the Magic Store Voting. As a platform
                dedicated to discovering, rating, and validating the finest Web3 projects, we require your input in determining if Project
                Orbofi AI meets the necessary criteria to be validated on the Magic Store, Web3 App Store.

                Only users with a fully validated MagicID account on the Magic Store (connected wallet, verified email, and selected username) can participate in the voting process.If you have not completed these steps, please visit the Magic Store to do so before casting your vote.

                For further discussion on Project Orbofi AI validation, join our Discord Server to connect with fellow community members.
                For detailed information on Project Orbofi AI, please visit the project page on the Magic Store here.
            </div>

            <div className={"view_poll_result"}>
                <div className={"view_poll_result_title"}>
                    {/*Votes 216    Closed at 123123  ·  Current is 1231321*/}
                    <div>
                        <span className={"view_poll_result_title_color_1"}>Votes </span>
                        <span className={"view_poll_result_title_color_2"}>216 </span>
                        <span> · </span>
                    </div>

                </div>

                <div className={"view_poll_result_options_block"}>
                    <div className={"view_poll_result_options"}>
                        <div className={"view_poll_result_options_content"}>
                            Cabo
                        </div>

                        <img src={check} style={{'width':'20px'}} />
                    </div>
                </div>

                <div className={"view_poll_result_options_block"}>
                    <div className={"view_poll_result_options"}>

                        <div className={"view_poll_result_options_content"}>
                            Cabo
                        </div>

                        <div className={"view_poll_persent"}>
                            411 (17.6%)
                        </div>
                    </div>
                    <div className={"view_poll_color"}>

                    </div>
                </div>



                <div className={"vote_block"}>
                    <div className={"vote_button"}>
                        Vote
                    </div>

                    <div className={"show_result"}>
                        Show Result
                    </div>
                </div>


            </div>

        </div>


    );
}