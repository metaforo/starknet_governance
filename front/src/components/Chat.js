import { useEffect, useState } from "react";
import { connect, disconnect } from '@argent/get-starknet'

export default function Chat() {

    const [connection, setConnection] = useState(null);
    const [provider, setProvider] = useState(null);
    const [address, setAddress] = useState(null);


    // useEffect(() => {
    //
    //     const connectToStarknet = async () => {
    //
    //         const connection = await connect({ modalMode: "neverAsk" });
    //
    //         if (connection && connection.isConnected) {
    //             setConnection(connection);
    //             setProvider(connection.account);
    //             setAddress(connection.selectedAddress);
    //         }
    //     };
    //
    //     connectToStarknet();
    // }, [])

    const connectWallet = async () => {

        await disconnect();

        const connection = await connect();

        if (connection && connection.isConnected) {
            setConnection(connection);
            setProvider(connection.account);
            setAddress(connection.selectedAddress);
        }

        console.log(connection.account);
    }

    function login(){
        connectWallet().then(

        );
    }

    async function connecttest() {
        console.log(2222);
        await connect();
    }

    return (
        <div>


            <button onClick={login}>
                Activate Lasers
            </button>
            <button onClick={connecttest}>
               connect
            </button>
        </div>


    );
}