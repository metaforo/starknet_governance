import logo from './logo.svg';
import './App.css';
import { Outlet } from "react-router-dom";
import { StarknetConfig } from '@starknet-react/core'

function App() {
  return (
      <StarknetConfig>
          <div className="App">
            <Outlet/>
          </div>
      </StarknetConfig>
  );
}

export default App;
