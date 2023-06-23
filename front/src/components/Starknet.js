import { useState,useEffect } from "react";
import { connect } from '@argent/get-starknet'
import {Contract} from "starknet";
import contractAbi from "../abis/main_abi.json";
import eventBus from "./event";

const contractAddress = "0x07dc09c4d1b1a656d7bcbd5c5f0474f97abce1369137a83d80091d74da30a84b";
const voter_list = ["0x007CeE74ADB1Dceb142dFB83A495C9C765e893df5270a7Eb75D0dA82D63a737d"];


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


        eventBus.addListener('createVote',  function (optionCount, metadataUrl, blockNumber, whiteLists ){ createProposal(optionCount, metadataUrl, blockNumber, whiteLists) } );
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
            return  n2Arr(result);

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
            console.log(resp);
            await provider.waitForTransaction(resp.transaction_hash);
            return resp;

        }
        catch(error){
            console.log(error)
        }
    }




    async function createProposal(optionCount,metadataUrl,votingEndBlock,voterList){
        try{

            console.log('optionCount',optionCount);
            console.log('metadataUrl',metadataUrl);
            console.log('votingEndBlock',votingEndBlock);
            console.log('voterList',voterList);

            await connectWallet();
            const contract = new Contract(contractAbi, contractAddress, provider);

            const metadataUrl1 =  metadataUrl.substring(0,30)
            const metadataUrl2 =  metadataUrl.substring(30)

            console.log('metadataUrl',metadataUrl)
            console.log('metadataUrl1',metadataUrl1)
            console.log('metadataUrl2',metadataUrl2)
            

            const resp = await contract.create_new_proposal(optionCount,metadataUrl1,metadataUrl2,votingEndBlock,voterList);
            console.log(resp.transaction_hash);
            console.log(address)
            await provider.waitForTransaction(resp.transaction_hash);
            contract.get_proposal_id(address,metadataUrl1,metadataUrl2).then((proposal_id)=>{
                console.log('proposal_id',parseInt(proposal_id))
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


    async function createProposalNft(optionCount,metadataUrl1,metadataUrl2,votingEndBlock,cAddress,selector){
        try{

            await connectWallet();
            const contract = new Contract(contractAbi, contractAddress, provider);

            const resp = await contract.create_new_proposal_nft(optionCount,metadataUrl1,metadataUrl2,votingEndBlock,cAddress,selector);
            console.log(resp.transaction_hash);
            console.log(address)
            await provider.waitForTransaction(resp.transaction_hash);
            contract.get_proposal_id(address,metadataUrl1,metadataUrl2).then((proposal_id)=>{
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



                <button onClick={()=>createProposal(2,"1z5n0jQ8uancYyJT3BoAKzhy7dyHMa9cCyDSayoQkZQ",999999999,voter_list)}>
                    create proposal
                </button>
                <br/>


                <button onClick={()=>createProposalNft(2,"abc","efg",999999999,
                    "0x0702d639d8579f7a841e214b607b990df3ee9cbfdb1329c63fc8801d8779e343",
                    "0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e")}>
                    create proposal nft
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