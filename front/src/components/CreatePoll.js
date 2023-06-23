import { useEffect, useState } from "react";
import {TextField , Tab, Box, Tabs, Typography } from "@mui/material";

import "../css/createPoll.css"
import add from '../icons/add.png'
import x from '../icons/x.png'
import axios from "axios";

import Starknet from "./Starknet";


import eventBus from './event'
import {connect} from "@argent/get-starknet";
import {Contract} from "starknet";
import contractAbi from "../abis/main_abi.json";
const contractAddress = "0x07dc09c4d1b1a656d7bcbd5c5f0474f97abce1369137a83d80091d74da30a84b";


export default function CreatePoll() {


    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [blockNumber, setBlockNumber] = useState('');
    const [options, setOptions] = useState(['','']);
    const [whiteLists, setWhiteLists] = useState(['']);
    const [value, setValue] = useState(0);
    const [provider, setProvider] = useState('');
    const [address, setAddress] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        connectWallet();

        // eventBus.addListener('say',  function (a,b ){ console.log(a,b) } );

    }, [])


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



    function optionsChange(id,text){
        const temp = [...options];
        temp[id] = text;
        setOptions(temp);
    }

    function addOption(){
        console.log(add);
        const temp = [...options];
        temp.push('');
        setOptions(temp);
    }

    function xOption(id){
        const temp = [...options];
        const front = temp.slice(0,id);
        if(temp.length === (id + 1) ){
            setOptions(front);
        } else {
            const end = temp.slice(id+1);
            setOptions(front.concat(end));
        }
    }

    function whiteListChange(id,text){
        const temp = [...whiteLists];
        temp[id] = text;
        setWhiteLists(temp);
    }

    function addWhiteList(){
        console.log(add);
        const temp = [...whiteLists];
        temp.push('');
        setWhiteLists(temp);
    }

    function xWhiteList(id){
        const temp = [...whiteLists];
        const front = temp.slice(0,id);
        if(temp.length === (id + 1) ){
            setWhiteLists(front);
        } else {
            const end = temp.slice(id+1);
            setWhiteLists(front.concat(end));
        }
    }




    function submit(){


        // const  optionCount,metadataUrl,votingEndBlock,voterList;


        const data = {
            title: title,
            content: content,
            blockNumber: blockNumber,
            options: options,
            whiteLists: whiteLists,
        };

        const optionCount = options.length;

        const form = new FormData();
        form.append('data',JSON.stringify(data));

        // axios.get('https://test.metaforo.io/api/feed/groups')
        //     .then(response =>
        //         console.log(response)
        //     );


        axios.post('https://test-wang.metaforo.io/api/arweave/upload', form)
            .then((response) => {
                // const metadataUrl = 'https://arweave.net/tx/'+ response.data.data.tx_id + '/data.json';
                const metadataUrl =  response.data.data.tx_id ;
                // eventBus.emit('createVote', optionCount, metadataUrl, parseInt(blockNumber), whiteLists)

                createProposal(optionCount, metadataUrl, parseInt(blockNumber), whiteLists).then((proposal_id)=>{
                    console.log(proposal_id);
                })

            });



    }



    async function createProposal(optionCount,metadataUrl,votingEndBlock,voterList){
        try{
            await connectWallet();
            const contract = new Contract(contractAbi, contractAddress, provider);
            const metadataUrl1 =  metadataUrl.substring(0,30)
            const metadataUrl2 =  metadataUrl.substring(30)
            const resp = await contract.create_new_proposal(optionCount,metadataUrl1,metadataUrl2,votingEndBlock,voterList);
            await provider.waitForTransaction(resp.transaction_hash);
            contract.get_proposal_id(address,metadataUrl1,metadataUrl2).then((proposal_id)=>{
                return parseInt(proposal_id);
                // console.log('proposal_id',parseInt(proposal_id))
            })
            // console.log(resp);
            // provider.waitForTransaction(resp.transaction_hash).then((res)=>{
            //     // console.log("wait");
            //
            // })
            return 0;
        }
        catch(error){
            console.log(error);
            return 0;
        }
    }



    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }


    function TabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    return (
        <div className={"create_poll"}>


            <div className={"create_poll_title_div"}>
                <div className={"create_poll_title"}>
                    Add New Poll
                </div>

                <div className={"connect_wallet"}>
                    Connect Wallet
                </div>
            </div>


            <div className={"create_title"}>
                Title
            </div>

            <TextField fullWidth value={title}
                       onChange={(event: React.ChangeEvent) => {
                           setTitle(event.target.value);
                       }}
            />

            <div className={"create_title"}>
                Content  (option)
            </div>

            <TextField fullWidth
                       multiline
                       value={content}
                       rows={4}
                       onChange={(event: React.ChangeEvent) => {
                           setContent(event.target.value);
                       }}
            />


            <div className={"create_title"}>
                Options
            </div>

            {
                options.map( (item,id) =>
                    (

                        <div key={id} className={"option_div m-5"}  style={  {"width":"100%"} } >
                            <TextField
                                fullWidth
                                value={item}
                                placeholder={"option " + (id + 1)}
                                onChange={(event: React.ChangeEvent) => {
                                    item = event.target.value;
                                    optionsChange(id,event.target.value);
                                }}
                            />

                            {
                                id > 1 &&
                                <img className={"option_x"} onClick={() => xOption(id)} src={x} />
                            }


                        </div>

                    )
                )

            }

            <div className={"add_block"} onClick={addOption} >
                <img src={add} style={{'width':'16px'}} />
                <div className={"add_text"}>Add Option</div>
            </div>


            <div className={"create_title"}>
                Block Number
            </div>

            <TextField fullWidth value={blockNumber}
                       onChange={(event: React.ChangeEvent) => {
                           setBlockNumber(event.target.value);
                       }}
            />


            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange}>
                    <Tab label="Token or Nft" {...a11yProps(0)} />
                    <Tab label="White Lists" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                Item One
            </TabPanel>
            <TabPanel value={value} index={1}>

                <div className={"create_title"}>
                    White Lists (option)
                </div>

                {
                    whiteLists.map( (item,id) =>
                        (

                            <div key={id} className={"option_div m-5"}  style={  {"width":"100%"} } >
                                <TextField
                                    fullWidth
                                    value={item}
                                    placeholder={"address " + (id + 1)}
                                    onChange={(event: React.ChangeEvent) => {
                                        item = event.target.value;
                                        whiteListChange(id,event.target.value);
                                    }}
                                />

                                {
                                    id > 0 &&
                                    <img className={"option_x"} onClick={() => xWhiteList(id)} src={x} />
                                }


                            </div>

                        )
                    )
                }

                <div className={"add_block"} onClick={addWhiteList} >
                    <img src={add} style={{'width':'16px'}} />
                    <div className={"add_text"}>Add White List</div>
                </div>

            </TabPanel>



            <div className={"submit"}  onClick={submit}>
                Submit
            </div>

        </div>


    );
}