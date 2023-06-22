import logo from './logo.svg';
import './App.css';
import { Outlet } from "react-router-dom";
import { StarknetConfig } from '@starknet-react/core'
import Starknet from "./components/Starknet";

function App() {

  return (
      <StarknetConfig>
          <div className="App">
            <Starknet/>
            <Outlet/>
          </div>
      </StarknetConfig>
  );
}

export default App;
