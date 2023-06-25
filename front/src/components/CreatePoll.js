import { useEffect, useState } from "react";
import {TextField , Tab, Box, Tabs, Typography , Modal } from "@mui/material";

import "../css/createPoll.css"
import add from '../icons/add.png'
import x from '../icons/x.png'
import axios from "axios";

import Starknet from "./Starknet";


import eventBus from './event'
import {connect} from "@argent/get-starknet";
import {Contract} from "starknet";
import contractAbi from "../abis/main_abi.json";
const contractAddress = "0x073abfeec458c5b77c8ef1cc726c69c7a6471663af93514052ae6693eee68514";


export default function CreatePoll() {


    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [blockNumber, setBlockNumber] = useState('');
    const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
    const [options, setOptions] = useState(['','']);
    const [transactionHash, setTransactionHash] = useState('');
    const [whiteLists, setWhiteLists] = useState(['']);
    const [value, setValue] = useState(0);
    const [provider, setProvider] = useState('');
    const [address, setAddress] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    const [modelOpen, setModelOpen] = useState(false);
    const [loading, setLoading] = useState('Loading...');

    const [caddress, setCaddresse] = useState('');
    const [selector  , setSelector] = useState('');

    // const mask = mui.createMask(callback);//callback为用户点击蒙版时自动执行的回调；
    // mask.show();//显示遮罩
    // mask.close();//关闭遮罩

    const connectWallet = async() => {
        try{
            console.log('isConnected: ', isConnected);
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

    useEffect(() => {
        connectWallet();
        // eventBus.addListener('say',  function (a,b ){ console.log(a,b) } );
    }, [isConnected])


    useEffect(() => {
        if(isConnected){
            const contract = new Contract(contractAbi, contractAddress, provider);
            contract.show_block_number().then((result)=>{
                setCurrentBlockNumber(parseInt(result));
            })
        }
    }, [isConnected])


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




    async function submit(){


        // const  optionCount,metadataUrl,votingEndBlock,voterList;

        setModelOpen(true);


        await showBlockNum().then((response) => {
            var create_at = 0;
            const data = {
                title: title,
                content: content,
                blockNumber: blockNumber,
                options: options,
                caddress: caddress,
                selector: selector,
                whiteLists: whiteLists,
                type : value
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
                    const fullArweaveUrl = 'https://arweave.net/tx/'+ response.data.data.tx_id + '/data.json';
                    console.log("ArweaveUrl: ", fullArweaveUrl);
                    const metadataUrl =  response.data.data.tx_id ;
                    // eventBus.emit('createVote', optionCount, metadataUrl, parseInt(blockNumber), whiteLists)

                    if(value === 0){
                        createProposalNft(optionCount, metadataUrl, parseInt(blockNumber),caddress,selector).then((proposal_id)=>{
                            console.log(proposal_id);

                            var currentUrl = window.location.href;
                            currentUrl =  currentUrl.replace('create','view') + '/' + proposal_id;
                            setLoading(currentUrl);

                        })
                    } else {
                        createProposal(optionCount, metadataUrl, parseInt(blockNumber), whiteLists).then((proposal_id)=>{
                            console.log(proposal_id);

                            var currentUrl = window.location.href;
                            currentUrl =   currentUrl.replace('create','view') + '/' + proposal_id;
                            setLoading(currentUrl);

                        })
                    }




                });

        });





    }

    async function showBlockNum(){
        try{
            await connectWallet();
            const contract = new Contract(contractAbi, contractAddress, provider);
            const result =  await  contract.show_block_number();
            return parseInt(result);
        }
        catch(error){
            console.log(error)
            return 0;
        }
    }


    async function createProposalNft(optionCount,metadataUrl,votingEndBlock,cAddress,selector){
        try{
            await connectWallet();
            const contract = new Contract(contractAbi, contractAddress, provider);
            const metadataUrl1 =  metadataUrl.substring(0,30);
            const metadataUrl2 =  metadataUrl.substring(30);

            const resp = await contract.create_new_proposal_nft(optionCount,metadataUrl1,metadataUrl2,votingEndBlock,cAddress,selector);
            setTransactionHash((resp.transaction_hash));
            console.log(resp.transaction_hash);
            console.log(address);

            await provider.waitForTransaction(resp.transaction_hash);
            const proposal_id = await contract.get_proposal_id(address,metadataUrl1,metadataUrl2);
            console.log('proposal_id',parseInt(proposal_id))

            return parseInt(proposal_id);
        }
        catch(error){
            console.log(error);
            return 0;
        }
    }




    async function createProposal(optionCount,metadataUrl,votingEndBlock,voterList){
        try{
            await connectWallet();
            const contract = new Contract(contractAbi, contractAddress, provider);
            const metadataUrl1 =  metadataUrl.substring(0,30)
            const metadataUrl2 =  metadataUrl.substring(30)
            const resp = await contract.create_new_proposal(optionCount,metadataUrl1,metadataUrl2,votingEndBlock,voterList);
            setTransactionHash((resp.transaction_hash));
            await provider.waitForTransaction(resp.transaction_hash);

            const proposal_id = await contract.get_proposal_id(address,metadataUrl1,metadataUrl2);
            console.log('proposal_id',parseInt(proposal_id))

            return parseInt(proposal_id);

            // contract.get_proposal_id(address,metadataUrl1,metadataUrl2).then((proposal_id)=>{
            //     console.log('proposal_id',parseInt(proposal_id))
            //
            //
            // });
            // console.log(resp);
            // provider.waitForTransaction(resp.transaction_hash).then((res)=>{
            //     // console.log("wait");
            //
            // })
        }
        catch(error){
            console.log(error);
            return 0;
        }
    }



    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);

        if(newValue!==0){
            setSelector('');
            setCaddresse('');
        } else {
            setWhiteLists(['']);
        }

    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }


    const handleOpen = () => setModelOpen(true);
    const handleClose = () => function (){
        if(loading === 'Loading...'){
            return false;
        }
        setModelOpen(false);
    };

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

            <Modal
                open={modelOpen}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {
                            loading !== 'Loading...' &&
                               <span> view at <a href={loading}></a> </span>
                        }
                        {loading}
                    </Typography>

                </Box>
            </Modal>


            <div className={"create_poll_title_div"}>
                <div className={"create_poll_title"}>
                    Add New Poll
                </div>

                {/*<div className={"connect_wallet"} onClick={connectWallet}>*/}
                {/*    Connect Wallet*/}
                {/*</div>*/}
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
                <div className={"add_text"}  style={{
                    marginLeft: 10,
                }}>Add Option</div>
            </div>


            <div className={"create_title"}>
                Block Number {currentBlockNumber > 0 && <>(Current Block Number is {currentBlockNumber})</>}
            </div>

            <TextField fullWidth value={blockNumber}
                       onChange={(event: React.ChangeEvent) => {
                           setBlockNumber(event.target.value);
                       }}
            />

            <div className={"create_title"} >
                Voting Strategies
            </div>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange}>
                    <Tab label="Token or Nft" {...a11yProps(0)} />
                    <Tab label="White Lists" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0} style={{width: 600}}>

                <div className={"create_title"}  style={{
                    marginTop: 10,
                }}>
                    Contract Address
                </div>

                <TextField fullWidth value={caddress}
                           onChange={(event: React.ChangeEvent) => {
                               setCaddresse(event.target.value);
                           }}
                />

                <div className={"create_title"}>
                    Function Selector
                </div>

                <TextField fullWidth value={selector}
                           onChange={(event: React.ChangeEvent) => {
                               setSelector(event.target.value);
                           }}
                />

            </TabPanel>
            <TabPanel value={value} index={1} style={{width: 600}}>

                <div className={"create_title"} style={{
                    marginTop: 10,
                }}>
                    Who Can Vote
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
                    <div className={"add_text"} style={{
                        marginLeft: 10,
                    }}>Add White List</div>
                </div>

            </TabPanel>


            <div style={{display: 'flex', alignItems: 'center',}}>
            <div className={"submit clickable"}  onClick={submit} variant={'contained'}>
                Submit
            </div>
                <div style={{marginLeft: 20}}>
                    {transactionHash.length > 0 && <a href={`https://testnet.starkscan.co/tx/${transactionHash}`}>Show on StarkScan</a>}
                </div>
            </div>

        </div>


    );
}