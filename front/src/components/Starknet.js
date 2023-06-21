import { useEffect, useState } from "react";
import { connect, disconnect } from '@argent/get-starknet'
import { useContractRead, useContract } from "@starknet-react/core";
import {Provider, Contract, json, CommonTransactionReceiptResponse, CallData} from "starknet";


import contractAbi from "../abis/main_abi.json";

const contractAddress = "0x03ae0619395c0b12974ae73a55bbf80649531d23ef64682a5f9aeda9c58d9e19";


export default function Starknet() {

    const [provider, setProvider] = useState('')
    const [address, setAddress] = useState('')
    const [name, setName] = useState('')
    const [inputAddress, setInputAddress] = useState('')
    const [retrievedName, setRetrievedName] = useState('')
    const [isConnected, setIsConnected] = useState(false)


    //
    // const abi_erc20 = [
    //     {
    //         "name": "constructor",
    //         "type": "function",
    //         "inputs": [
    //             {
    //                 "name": "owner",
    //                 "type": "core::starknet::contract_address::ContractAddress"
    //             }
    //         ],
    //         "outputs": [],
    //         "state_mutability": "external"
    //     },
    //     {
    //         "name": "add_admin",
    //         "type": "function",
    //         "inputs": [
    //             {
    //                 "name": "admin",
    //                 "type": "core::starknet::contract_address::ContractAddress"
    //             }
    //         ],
    //         "outputs": [],
    //         "state_mutability": "external"
    //     },
    //     {
    //         "name": "delete_admin",
    //         "type": "function",
    //         "inputs": [
    //             {
    //                 "name": "admin",
    //                 "type": "core::starknet::contract_address::ContractAddress"
    //             }
    //         ],
    //         "outputs": [],
    //         "state_mutability": "external"
    //     },
    //     {
    //         "name": "create_new_proposal",
    //         "type": "function",
    //         "inputs": [
    //             {
    //                 "name": "option_count",
    //                 "type": "core::integer::u8"
    //             },
    //             {
    //                 "name": "metadata_url",
    //                 "type": "core::felt252"
    //             }
    //         ],
    //         "outputs": [],
    //         "state_mutability": "external"
    //     },
    //     {
    //         "name": "add_voter",
    //         "type": "function",
    //         "inputs": [
    //             {
    //                 "name": "proposal_id",
    //                 "type": "core::integer::u32"
    //             },
    //             {
    //                 "name": "voter",
    //                 "type": "core::starknet::contract_address::ContractAddress"
    //             }
    //         ],
    //         "outputs": [],
    //         "state_mutability": "external"
    //     },
    //     {
    //         "name": "delete_voter",
    //         "type": "function",
    //         "inputs": [
    //             {
    //                 "name": "proposal_id",
    //                 "type": "core::integer::u32"
    //             },
    //             {
    //                 "name": "voter",
    //                 "type": "core::starknet::contract_address::ContractAddress"
    //             }
    //         ],
    //         "outputs": [],
    //         "state_mutability": "external"
    //     },
    //     {
    //         "name": "start_proposal",
    //         "type": "function",
    //         "inputs": [
    //             {
    //                 "name": "proposal_id",
    //                 "type": "core::integer::u32"
    //             }
    //         ],
    //         "outputs": [],
    //         "state_mutability": "external"
    //     },
    //     {
    //         "name": "end_proposal",
    //         "type": "function",
    //         "inputs": [
    //             {
    //                 "name": "proposal_id",
    //                 "type": "core::integer::u32"
    //             }
    //         ],
    //         "outputs": [],
    //         "state_mutability": "external"
    //     },
    //     {
    //         "name": "vote",
    //         "type": "function",
    //         "inputs": [
    //             {
    //                 "name": "proposal_id",
    //                 "type": "core::integer::u32"
    //             },
    //             {
    //                 "name": "option_id",
    //                 "type": "core::integer::u8"
    //             }
    //         ],
    //         "outputs": [],
    //         "state_mutability": "external"
    //     },
    //     {
    //         "name": "show_my_vote_history",
    //         "type": "function",
    //         "inputs": [
    //             {
    //                 "name": "proposal_id",
    //                 "type": "core::integer::u32"
    //             }
    //         ],
    //         "outputs": [
    //             {
    //                 "type": "core::integer::u8"
    //             }
    //         ],
    //         "state_mutability": "view"
    //     },
    //     {
    //         "name": "show_vote_result",
    //         "type": "function",
    //         "inputs": [
    //             {
    //                 "name": "proposal_id",
    //                 "type": "core::integer::u32"
    //             }
    //         ],
    //         "outputs": [
    //             {
    //                 "type": "core::array::Array::<core::integer::u8>"
    //             }
    //         ],
    //         "state_mutability": "view"
    //     }
    // ];
    //
    // const CONTRACT_ADDRESS = '0x00ac359d6d2088a4dd136b429f431e211baeb7f99c89d31700bf8839b1123e6e';
    //
    //
    // // const proposal_id = [2];
    //
    // const { data: balance, isLoading, isError, isSuccess } = useContractRead({
    //     abi: abi_erc20,
    //     address: CONTRACT_ADDRESS,
    //     functionName: "show_vote_result",
    //     args: [[1]],
    // });
    //
    //
    //
    //
    // const contract = new Contract(abi_erc20, CONTRACT_ADDRESS, provider)



    // const { contract } = useContract({
    //     address: CONTRACT_ADDRESS,
    //     abi: abi_erc20,
    // });


//     useEffect(() => {
//
//         const connectToStarknet = async () => {
//
//             const connection = await connect();
//
//             if (connection && connection.isConnected) {
//                 setConnection(connection);
//                 setProvider(connection.account);
//                 setAddress(connection.selectedAddress);
//
//
//
//                 // initialize provider
//                 const provider1 = new Provider({ sequencer: { network: 'goerli-alpha' } }) ;
//
// // initialize deployed contract
//                 const testAddress = "0x7667469b8e93faa642573078b6bf8c790d3a6184b2a1bb39c5c923a732862e1";
//
// // connect the contract
//                 const myTestContract = new Contract(abi_erc20, connection.selectedAddress, provider1);
//
//
//                 const transfer = await account.execute([
//                     {
//                         contractAddress: eth_address,
//                         calldata: starknet.stark.compileCalldata({
//                             recipient: to,
//                             amount: {
//                                 type: 'struct',
//                                 low: '1000000',
//                                 high: '0',
//                             },
//                         }),
//                         entrypoint: 'transfer',
//                     },
//                 ]);
//
//             }
//         };
//
//         connectToStarknet();
//
//         console.log(222);
//
//
//
//     }, [])




    const connectWallets = async () => {

        await disconnect();

        const connection = await connect();

        if (connection && connection.isConnected) {

            // set account provider
            setProvider(connection.account)
            // set user address
            setAddress(connection.selectedAddress)
            // set connection status
            setIsConnected(true)
            //
            // setConnection(connection);
            // setProvider(connection.account);
            // setAddress(connection.selectedAddress);
        }

    }



    function login(){
        connectWallet().then(

        );
    }





    async function showVoteResult(proposalId){

        try{
            connectWallet().then(()=>{
                // initialize contract using abi, address and provider
                const contract = new Contract(contractAbi, contractAddress, provider);
                // make contract call
                contract.show_vote_result(proposalId).then((result)=>{
                    console.log(result);

                });
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

            // connectWallet().then(()=>{
            //     // initialize contract using abi, address and provider
            //     const contract = new Contract(contractAbi, contractAddress, provider);
            //     // make contract call
            //
            //     contract.create_new_proposal(optionCount,metadataUrl,821353,["0x007CeE74ADB1Dceb142dFB83A495C9C765e893df5270a7Eb75D0dA82D63a737d"]).then((result)=>{
            //         provider.waitForTransaction(result.transaction_hash).then((data)=>{
            //
            //             contract.get_proposal_id("0x007CeE74ADB1Dceb142dFB83A495C9C765e893df5270a7Eb75D0dA82D63a737d",metadataUrl).then((res)=>{
            //
            //                 console.log(res)
            //             })
            //
            //         });
            //     });
            //
            // });

        }
        catch(error){
            console.log(error)
        }
    }






    async function connecttest() {
        console.log(2222);
        await connect();
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
            alert(error.message)
        }
    }


    return (
        <div>


                <button onClick={login}>
                    Activate Lasers
                </button>
                <button onClick={connectWallets}>
                    connect
                </button>

                <button onClick={()=>showVoteResult(1)}>
                    showVote
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