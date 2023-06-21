import { useState } from "react";
import { connect } from '@argent/get-starknet'
import {Contract} from "starknet";
import contractAbi from "../abis/main_abi.json";



export default function Starknet() {

    const contractAddress = "0x03ae0619395c0b12974ae73a55bbf80649531d23ef64682a5f9aeda9c58d9e19";

    const [provider, setProvider] = useState('');
    const [address, setAddress] = useState('');
    const [isConnected, setIsConnected] = useState(false);


    function login(){
        connectWallet().then();
    }

    const connectWallet = async() => {
        try{
            // let the user choose a starknet wallet
            const starknet = await connect()
            // connect to the user-chosen wallet
            await starknet?.enable({ starknetVersion: "v4" })
            // set account provider
            setProvider(starknet.account)
            // set user address
            setAddress(starknet.selectedAddress)
            // set connection status
            setIsConnected(true)
        }
        catch(error){
            console.log(error)
        }
    }

    async function showVoteResult(proposalId){

        try{

            await connectWallet();
            const contract = new Contract(contractAbi, contractAddress, provider);
            contract.show_vote_result(proposalId).then((result)=>{
                console.log(result);
            });
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
            const resp = await  contract.create_new_proposal(optionCount,metadataUrl,821353,voter_list);
            await  provider.waitForTransaction(resp.transaction_hash)
            contract.get_proposal_id("0x007CeE74ADB1Dceb142dFB83A495C9C765e893df5270a7Eb75D0dA82D63a737d",metadataUrl).then((res)=>{
                console.log(res)
            })
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
                <button onClick={connectWallet}>
                    connect
                </button>

                <button onClick={()=>showVoteResult(1)}>
                    showVote
                </button>


                    <button onClick={()=>createProposal(2,"abc")}>
                create
                </button>



        </div>


    );
}