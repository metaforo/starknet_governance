import { useEffect, useState } from "react";
import {TextField} from "@mui/material";

import "../css/createPoll.css"
import add from '../icons/add.png'
import x from '../icons/x.png'
import check from '../icons/check.png'
import uncheck from '../icons/uncheck.png'
import axios from "axios";
import {connect} from "@argent/get-starknet";
import {Contract,Provider,defaultProvider} from "starknet";
import contractAbi from "../abis/main_abi.json";
import { useParams } from "react-router-dom";
import eventBus from "./event";

const contractAddress = "0x073abfeec458c5b77c8ef1cc726c69c7a6471663af93514052ae6693eee68514";
/* global BigInt */
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


    const [showResultStatus,setShowResultStatus] = useState(false);

    const [voteResult,setVoteResult] = useState(['100','100']);

    const [voteDetail, setVoteDetail] = useState([
        {
            option : '',
            count : '0',
            status : false,
            per : '0',
        }
    ])

    const [voteResultPer,setVoteResultPer] = useState(['0','0']);

    const [pollStatus, setPollStatus] = useState(true)
    const [votesCount, setVotesCount] = useState(0)
    const [closeAt, setCloseAt] = useState(0)

    const [voted, setVoted] = useState(0)

    // persist state on reload
    const dp = new Provider({
        sequencer: {
            baseUrl: 'https://alpha4.starknet.io',
        }
    })

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
            const starknet = await connect();

            if ( !isConnected ){
                // let the user choose a starknet wallet
                // connect to the user-chosen wallet
                await starknet?.enable({ starknetVersion: "v4" })
                // set account provider
                setProvider(starknet.account);
                console.log(starknet);
                // set user address
                setAddress(starknet.selectedAddress);
                // set connection status
                setIsConnected(true);
            }

            return starknet;

        }
        catch(error){
            console.log(error)
        }
    }

    function hexToString(str){
        let val="";
        let arr = str.split(",");
        console.log(arr)
        for(let  i = 0; i < arr.length; i++){
            val += arr[i].fromCharCode(i);
        }
        return val;
    }

    async function showResult(proposalId){

        let m = [];

        try{

            // const vote_data = await dp.callContract({
            //     contractAddress: contractAddress,
            //     entrypoint: 'get_proposal',
            //     calldata: [proposalId],
            // });
            //
            // const vote_result = await dp.callContract({
            //     contractAddress: contractAddress,
            //     entrypoint: 'show_vote_result',
            //     calldata: [proposalId],
            // });


            // const vote_history = await dp.callContract({
            //     contractAddress: contractAddress,
            //     entrypoint: 'show_vote_history',
            //     calldata: [proposalId,address],
            // });


            // console.log(poolBalanceTokenB);

                const connect =  await connectWallet();

                const contract     = new Contract(contractAbi, contractAddress, dp);
                const vote_data    =  await  contract.get_proposal(proposalId);
                const vote_result  =  await  contract.show_vote_result(proposalId);
                // console.log(connect);
                const vote_history =  await  contract.show_vote_history(proposalId,connect.selectedAddress);

                m["vote_data"]   = arr2Str(vote_data);
                m["vote_result"] = arr2Int(vote_result);
                m["vote_history"] = parseInt(vote_history);
                console.log(m);

                renderVote( toStr (BigInt( m["vote_data"][2])) + toStr(BigInt( m["vote_data"][3])) );

                setVoteResult(m["vote_result"]);

                var temp = [];

                var total = 0;

                m["vote_result"].map( (item,id) => {
                    total += item;
                })

                var data =  {
                    option : '111',
                    count : '0',
                    status : false,
                    per : 0,
                }

                for (let i = 0; i < m["vote_result"].length; i++) {

                    var per = 0;
                    if (m["vote_result"][i] > 0) {
                        per = (Number(m["vote_result"][i])/Number(total) * 100);
                    }
                    data =  {
                        option : '111',
                        count : m["vote_result"][i].toString(),
                        status : false,
                        per : per.toFixed(2).toString(),
                    }

                    console.log( i ,m["vote_result"][i])
                    console.log('adddata',data);
                    temp.push(
                        data
                    )

                    temp[i].count = m["vote_result"][i].toString();
                    // console.log(temp)
                }


            // m["vote_result"].map( (item,id) => {
            //         total += item;
            //
            //         // console.log(temp)
            //         // temp[id].count = item.toString();
            //         // temp[id].status = false
            //     })
            //     if(total > 0){
            //         var temp_per = [];
            //
            //         m["vote_result"].map( (item,id) => {
            //
            //             // temp_per.push( (Number(item)/Number(total) * 100).toFixed(2).toString() )
            //
            //
            //             temp[id].per = (Number(item)/Number(total) * 100).toFixed(2).toString();
            //         })
            //
            //         setVoteResult(setVoteResultPer)
            //     }

                setVotesCount(total);
                setVoted(m["vote_history"]);

                if(m["vote_history"] > 0){
                    temp[m["vote_history"]-1].status = true;
                    setShowResultStatus(true);
                }
                
                setVoteDetail(temp);


                return m;

        }
        catch(error){
            console.log(error)
            return m;
        }

    }

    function toStr(data){

        const feltToString = felt => felt
            // To hex
            .toString(16)
            // Split into 2 chars
            .match(/.{2}/g)
            // Get char from code
            .map( c => String.fromCharCode(parseInt( c, 16 ) ) )
            // Join to a string
            .join('');

        const felt = data;

        return feltToString(felt);

    }


    async function showBlockNum(){
        try{
            // await connectWallet();
            const contract = new Contract(contractAbi, contractAddress, dp);
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

        window.onload=function (){
            connectWallet().then(()=>{
                const r = showResult(params.id).then(( r )=>function (){
                    console.log('r',r);
                });
                console.log('raa',r);
            });


        }

        // showResult(params.id)
        // eventBus.emit('showVote',params.id);

        // axios.post('https://test-wang.metaforo.io/api/arweave/upload', form)
        //     .then((response) => {
        //         // const metadataUrl = 'https://arweave.net/tx/'+ response.data.data.tx_id + '/data.json';
        //         const metadataUrl =  response.data.data.tx_id ;
        //         eventBus.emit('createVote', optionCount, metadataUrl, parseInt(blockNumber), whiteLists)
        //     });




    }, [])


    function renderVote(url){

        // url = 'https://arweave.net/tx/yFVV91bHcEOcHHlaksvdkSilhUkdRQOWA0znznH8SjY/data.json';
        url = 'https://arweave.net/tx/'+url+'/data.json';


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

    function clickVote(){
        // showResult(2);


        checkStatus.map( (item,id) => {

            if(item === true){
                vote(params.id, id +1 )

                return;
            }

        })


    }

    function showVote(id, ar){

    }

    function click(id, boolean){


        const temp = [...checkStatus];

        temp[id] = boolean;
        //
        setCheckStatus(temp);

        console.log(checkStatus)

    }


    function clickBtn(id){

        if(checkStatus[id]){

            return     <img onClick={ () => click(id,false)  } src={check} className={"clickable"} style={{'width':'20px'}} />;

        } else {
            return     <img onClick={ () => click(id,true)  }  src={uncheck}  className={"clickable"} style={{'width':'20px'}} />;
        }


    }

    return (
        <div className={"create_poll"}>

            {
                pollStatus &&
                <div className={"poll_process"}>
                    Poll in Progress
                </div>
            }

            {
                !pollStatus &&
                <div className={"poll_process"}>
                    Poll closed
                </div>
            }



            <div className={"view_poll_title"}>
                {title}
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
            </div>

            <div className={"view_poll_result"}>
                <div className={"view_poll_result_title"}>
                    {/*Votes 216    Closed at 123123  ·  Current is 1231321*/}
                    <div>
                        <span className={"view_poll_result_title_color_1"}>Votes </span>
                        <span className={"view_poll_result_title_color_2"}>{votesCount} </span>
                        {/*<span> · </span>*/}
                        {/*<span className={"view_poll_result_title_color_1"}>Closed at </span>*/}
                        {/*<span className={"view_poll_result_title_color_2"}>{closeAt} </span>*/}
                        {/*<span> · </span>*/}
                    </div>

                </div>



                {   !showResultStatus &&
                    checkStatus.map( (item,id) =>
                        (

                            <div key={id} className={"view_poll_result_options_block"}>
                                <div className={"view_poll_result_options"}>
                                    <div className={"view_poll_result_options_content"}>
                                        {options[id]}
                                    </div>

                                    {clickBtn(id)}
                                </div>
                            </div>
                        )
                    )
                }



                {   showResultStatus &&
                voteDetail.map( (item,id) =>
                    (

                        <div key={id+voteResult[id]+voteResultPer[id]} className={ id === (voted - 1) ? "view_poll_result_options_block select_vote" : "view_poll_result_options_block" }>
                            <div className={"view_poll_result_options"}>

                                <div className={"view_poll_result_options_content"}>
                                    {options[id]}
                                </div>

                                <div className={"view_poll_persent"}>
                                    {item.count} ({item.per}%)
                                </div>
                            </div>
                            <div className={"view_poll_color"} style={{'width':item.per+'%'}}>

                            </div>
                        </div>

                    )
                )
                }
                {
                    voted === 0 &&
                    <div className={"vote_block"}>
                        <div className={"vote_button clickable"} onClick={clickVote}>
                            Vote
                        </div>

                        <div className={"show_result clickable"} onClick={()=>{
                            setShowResultStatus(!showResultStatus)
                        }} >


                            {
                                !showResultStatus &&
                                'Show Result'

                            }
                            {
                                showResultStatus &&
                                'Return Vote'

                            }
                        </div>
                    </div>
                }



            </div>

        </div>


    );
}