import { useState,useEffect } from "react";
import { connect } from '@argent/get-starknet'
import {Contract} from "starknet";
import contractAbi from "../abis/main_abi.json";

const contractAddress = "0x02a6f38d7fabcacecee58f24dd0110970f914d9c43b997d69a259fb20b2a1bb9";


export default function Starknet() {


    const [provider, setProvider] = useState('');
    const [address, setAddress] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    const contract = new Contract(contractAbi, contractAddress, provider);


    function login(){
        connectWallet().then();
    }

    // persist state on reload
    useEffect(() => {
        connectWallet()
    }, [])

    function test(){
       let arr = ["1n","0n"];
       const tmp = n2Arr(arr);
       console.log(tmp);
    }

    function n2Arr(arr){
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
;

            if ( !isConnected ){
                // let the user choose a starknet wallet
                const starknet = await connect();
                // connect to the user-chosen wallet
                await starknet?.enable({ starknetVersion: "v4" })
                // set account provider
                setProvider(starknet.account);
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



    async function showVoteResult(proposalId){

        try{
            await connectWallet();
            const contract = new Contract(contractAbi, contractAddress, provider);
            const result =  await  contract.show_vote_result(proposalId);
            console.log(n2Arr(result));
        }
        catch(error){
            console.log(error)
        }

    }


    async function showVoteHistory(proposalId){

        try{
            await connectWallet();
            const contract = new Contract(contractAbi, contractAddress, provider);
            const result =  await  contract.show_vote_result(proposalId);
            console.log(result);
        }
        catch(error){
            console.log(error)
        }

    }





    async function showBlockNum(){

        try{
            await connectWallet();
            const result =  await  contract.show_block_number();

            console.log(parseInt(result));
        }
        catch(error){
            console.log(error)
        }

    }

    async function addAdmin(address){

        try{
            await connectWallet();
            const result =  await  contract.add_admin(address);

            console.log(result);
        }
        catch(error){
            console.log(error)
        }

    }

    async function vote(proposalId,optionId){
        try{

            await connectWallet();

            const resp = await contract.vote(proposalId,optionId);
            await provider.waitForTransaction(resp.transaction_hash);

            console.log(resp);

        }
        catch(error){
            console.log(error)
        }
    }




    async function createProposal(optionCount,metadataUrl){
        try{

            const voter_list = ["0x007CeE74ADB1Dceb142dFB83A495C9C765e893df5270a7Eb75D0dA82D63a737d"];
            await connectWallet();
            const contract = new Contract(contractAbi, contractAddress, provider);

            const resp = await contract.create_new_proposal(optionCount,metadataUrl,99999999,voter_list);

            await provider.waitForTransaction(resp.transaction_hash);

            contract.get_proposal_id("0x007CeE74ADB1Dceb142dFB83A495C9C765e893df5270a7Eb75D0dA82D63a737d",metadataUrl).then((proposal_id)=>{
                console.log(parseInt(proposal_id))
            })
            // console.log(resp);
            // provider.waitForTransaction(resp.transaction_hash).then((res)=>{
            //     // console.log("wait");
            //
            // })
        }
        catch(error){
            console.log(error)
        }
    }




    return (
        <div>


                <button onClick={login}>
                    Activate Lasers
                </button>
                <br/>

                <button onClick={connectWallet}>
                    connect
                </button>
                <br/>

                <button onClick={()=>showBlockNum()}>
                    showBlockNum
                </button>
                <br/>


                <button onClick={()=>showVoteResult(1)}>
                    showVote
                </button>
                <br/>


                <button onClick={()=>showVoteHistory(1)}>
                    showVoteHistory
                </button>
                <br/>



                <button onClick={()=>createProposal(2,"abc")}>
                    create proposal
                </button>
                <br/>


                <button onClick={()=>vote(1,1)}>
                    vote
                </button>
                <br/>


                <button onClick={()=>addAdmin("0x007CeE74ADB1Dceb142dFB83A495C9C765e893df5270a7Eb75D0dA82D63a737d")}>
                    addAdmin
                </button>
                <br/>


            <button onClick={()=>test()}>
                test
            </button>
            <br/>


        </div>


    );
}