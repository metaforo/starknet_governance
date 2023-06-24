import { useEffect, useState } from "react";
import {TextField} from "@mui/material";

import "../css/createPoll.css"
import add from '../icons/add.png'
import x from '../icons/x.png'
import check from '../icons/check.png'
import uncheck from '../icons/uncheck.png'
import axios from "axios";
import {connect} from "@argent/get-starknet";
import {Contract,Provider} from "starknet";
import contractAbi from "../abis/main_abi.json";
import { useParams } from "react-router-dom";
import eventBus from "./event";

const contractAddress = "0x07dc09c4d1b1a656d7bcbd5c5f0474f97abce1369137a83d80091d74da30a84b";

export default function ViewPoll() {

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [blockNumber, setBlockNumber] = useState('');
    const [options, setOptions] = useState(['','']);
    const [checkStatus, setCheckStatus] = useState([false,false]);
    const [whiteLists, setWhiteLists] = useState(['']);

    const [provider, setProvider] = useState('');
    const [address, setAddress] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    // const [showResult,setShowResult] = useState(false);



    // persist state on reload


    function arr2Str(arr){
        if(arr.length === 0){
            return arr
        }
        for (let i = 0; i < arr.length; i++) {
            let str = arr[i]+'';
            str=str.substring(0,str.length);
            arr[i] = str;
        }
        return arr;
    }

    function arr2Int(arr){
        if(arr.length === 0){
            return arr
        }
        for (let i = 0; i < arr.length; i++) {
            arr[i] = parseInt(arr[i]);
        }
        return arr;
    }

    const connectWallet = async() => {

        try{

            if ( !isConnected ){
                // let the user choose a starknet wallet
                const starknet = await connect();
                // connect to the user-chosen wallet
                await starknet?.enable({ starknetVersion: "v4" })
                // set account provider
                setProvider(starknet.account);
                console.log(starknet.account);
                // set user address
                setAddress(starknet.selectedAddress);
                // set connection status
                setIsConnected(true);
            }

        }
        catch(error){
            console.log(error)
        }
    }

    async function showResult(proposalId){

        let m = [];

        try{

            await connectWallet().then( async ()=>{
                const contract = new Contract(contractAbi, contractAddress, provider);
                const vote_data    =  await  contract.get_proposal(proposalId);
                const vote_result  =  await  contract.show_vote_result(proposalId);
                const vote_history =  await  contract.show_vote_history(proposalId,address);

                m["vote_data"]   = arr2Str(vote_data);
                m["vote_result"] = arr2Int(vote_result);
                m["vote_history"] = parseInt(vote_history);
                console.log(m);
                return m;
            })



        }
        catch(error){
            console.log(error)
            return m;
        }

    }

    async function showBlockNum(){
        try{
            await connectWallet();
            const contract = new Contract(contractAbi, contractAddress, provider);
            const result =  await  contract.show_block_number();
            console.log(parseInt(result));
            return parseInt(result);
        }
        catch(error){
            console.log(error)
            return 0;
        }
    }


    async function vote(proposalId,optionId){
        try{
           await connectWallet();
            const contract = new Contract(contractAbi, contractAddress, provider);

            const resp = await contract.vote(proposalId,optionId);
            console.log(resp);
            await provider.waitForTransaction(resp.transaction_hash);
            return resp;

        }
        catch(error){
            console.log(error)
        }
    }

    const params = useParams();

    // useEffect(() => {
    //     async function fetchData() {
    //         // You can await here
    //         const response = await MyAPI.getData(someId);
    //         // ...
    //     }
    //     fetchData();
    // }, [someId]);

    useEffect( () => {
        connectWallet()
        // showResult(params.id)
        // eventBus.emit('showVote',params.id);

        // axios.post('https://test-wang.metaforo.io/api/arweave/upload', form)
        //     .then((response) => {
        //         // const metadataUrl = 'https://arweave.net/tx/'+ response.data.data.tx_id + '/data.json';
        //         const metadataUrl =  response.data.data.tx_id ;
        //         eventBus.emit('createVote', optionCount, metadataUrl, parseInt(blockNumber), whiteLists)
        //     });


        renderVote('aa');

    }, [])


    function renderVote(url){

        url = 'https://arweave.net/tx/1z5n0jQ8uancYyJT3BoAKzhy7dyHMa9cCyDSayoQkZQ/data.json';


        axios.get(url)
            .then((response) => {

                console.log(response);

                setTitle(response.data.title)
                setOptions(response.data.options)
                setContent(response.data.content)
                setBlockNumber(response.data.blockNumber)
                setWhiteLists(response.data.whiteLists)


            });

    }

    function showVote(id, ar){

    }


    return (
        <div className={"create_poll"}>

            <div className={"poll_process"}>
                Poll in Progress
            </div>

            <div className={"view_poll_title"}>
                {title}
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
                {content}
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
                    <div className={"vote_button"} onClick={()=>vote(2,1)}>
                        Vote
                    </div>

                    <div className={"show_result"} onClick={()=>showResult(2)}>
                        Show Result
                    </div>
                </div>


            </div>

        </div>


    );
}