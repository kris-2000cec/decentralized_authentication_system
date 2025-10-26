import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import Dashboard from './Dashboard';
import './App.css';

const KWALLET_API = 'http://localhost:5001';
const AUTH_API = 'http://localhost:5000';



function App() {
    const [page, setPage] = useState('home');
    const [walletAddress, setWalletAddress] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const [savedWallets, setSavedWallets] = useState([]);
    const [mnemonic, setMnemonic] = useState('');
    const [showMnemonic, setShowMnemonic] = useState(false);
    // ..for existing wallets via mnemonic
    const [mnemonicInput, setMnemonicInput] = useState("");
    useEffect(() => {
        fetchSavedWallets();
    }, []);

    const fetchSavedWallets = async () => {
        try {
            const res = await axios.get(`${KWALLET_API}/kwallet/all`);
            if (res.data.success) {
                setSavedWallets(res.data.wallets);
            }
        } catch (err) {
            console.error('Failed to fetch wallets:', err);
        }
    };

    // CREATE K-WALLET
    const createKWallet = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${KWALLET_API}/kwallet/create`);
            if (res.data.success) {
                setWalletAddress(res.data.address);
                setMnemonic(res.data.mnemonic);
                setShowMnemonic(true);
                await fetchSavedWallets();
                alert('✅ K-Wallet created successfully!');
            }
        } catch (error) {
            alert('❌ Error creating K-Wallet: ' + error.message);
        }
        setLoading(false);
    };

    // LOGIN WITH EXISTING K-WALLET
    const loginKWallet = async (address) => {
        setLoading(true);
        try {
            const res = await axios.post(`${KWALLET_API}/kwallet/load`, { address });
            if (res.data.success) {
                setWalletAddress(address);
                await authenticateKWallet(address);
            }
        } catch (error) {
            alert('❌ Error loading K-Wallet: ' + error.message);
        }
        setLoading(false);
    };

    // AUTHENTICATE K-WALLET
    const authenticateKWallet = async (address) => {
        setLoading(true);
        try {
            const nonceRes = await axios.get(`${AUTH_API}/nonce`);
            const { nonce } = nonceRes.data;

            const siweMessage = `${window.location.host} wants you to sign in with your Ethereum account:\n${address}\n\nSign in with Ethereum to the app.\n\nURI: ${window.location.origin}\nVersion: 1\nChain ID: 1337\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;

            const signRes = await axios.post(`${KWALLET_API}/kwallet/sign`, { message: siweMessage });
            
            if (!signRes.data.success) {
                throw new Error('Signing failed');
            }

            const verifyRes = await axios.post(`${AUTH_API}/verify`, {
                message: siweMessage,
                signature: signRes.data.signature,
                address
            });

            if (verifyRes.data.success) {
                setRole(verifyRes.data.role);
                setPage('dashboard');
            } else {
                throw new Error(verifyRes.data.message);
            }
        } catch (error) {
            alert('❌ Authentication failed: ' + error.message);
        }
        setLoading(false);
    };

    // LOGIN WITH METAMASK
    const loginMetaMask = async () => {
        setLoading(true);
        try {
            if (!window.ethereum) {
                alert('Please install MetaMask!');
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            setWalletAddress(address);

            const nonceRes = await axios.get(`${AUTH_API}/nonce`);
            const { nonce } = nonceRes.data;

            const siweMessage = `${window.location.host} wants you to sign in with your Ethereum account:\n${address}\n\nSign in with Ethereum to the app.\n\nURI: ${window.location.origin}\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;

            const signature = await signer.signMessage(siweMessage);

            const verifyRes = await axios.post(`${AUTH_API}/verify`, {
                message: siweMessage,
                signature,
                address
            });

            if (verifyRes.data.success) {
                setRole(verifyRes.data.role);
                setPage('dashboard');
            } else {
                throw new Error(verifyRes.data.message);
            }
        } catch (error) {
            alert('❌ MetaMask login failed: ' + error.message);
        }
        setLoading(false);
    };

    const logout = () => {
        setPage('home');
        setWalletAddress('');
        setRole('user');
    };


    //handle new mnemonic input login
    const handleMnemonicImport = async () => {
  setLoading(true);
  try {
    const res = await axios.post(`${KWALLET_API}/kwallet/import`, { mnemonic: mnemonicInput.trim() });
    if (res.data.success) {
      setWalletAddress(res.data.address);
      await authenticateKWallet(res.data.address);
      setMnemonicInput(""); // reset
    } else {
      alert("Invalid mnemonic!");
    }
  } catch (e) {
    alert("Import error: " + e.message);
  }
  setLoading(false);
};




    if (page === 'dashboard') {
        return <Dashboard address={walletAddress} role={role} logout={logout} />;
    }

    return (
        <div className="App">
            <div className="home-container">
                <h1>🔐 Decentralized Authentication System</h1>
                <p className="subtitle">Secure, Passwordless Login with Blockchain</p>

                <div className="auth-grid">
                    <div className="auth-card">
                        <h2>Create K-Wallet</h2>
                        <p>Generate a new blockchain wallet</p>
                        <button onClick={createKWallet} disabled={loading}>
                            {loading ? 'Creating...' : 'Create New K-Wallet'}
                        </button>
                    </div>

                    <div className="auth-card">
  <h2>Login with K-Wallet</h2>
  <p>Use your existing K-Wallet address or phrase</p>
  
  {/* Always show addresses for selection */}
  {savedWallets.length > 0 ? (
    <>
      <div style={{maxHeight: "125px", overflowY: "auto", marginBottom: "8px"}}>
        {savedWallets.map(w => (
          <div key={w.address}
               style={{
                 padding: "5px 10px", 
                 margin: "3px 0",
                 background: "#f5f5f5",
                 borderRadius: "6px",
                 fontFamily: "monospace",
                 cursor: "pointer"
               }}
               onClick={() => loginKWallet(w.address)}>
            {w.address}
          </div>
        ))}
      </div>
      <span style={{color: "#666", fontSize: "12px"}}>(click address to login with)</span>
    </>
  ) : (
    <p className="no-wallets">No saved wallets</p>
  )}
  
  <hr style={{margin:"12px 0"}}/>
  
  {/* Add phrase login below */}
  <input
    type="text"
    placeholder="Enter 12/24-word Recovery Phrase"
    value={mnemonicInput}
    onChange={e => setMnemonicInput(e.target.value)}
    style={{ width: "99%", marginTop: "10px", borderRadius: "8px", padding: "9px" }}
  />
  <button style={{ marginTop: "6px", width:"100%" }}
    onClick={handleMnemonicImport}
    disabled={loading || !mnemonicInput.trim()}>
    Login with Recovery Phrase
  </button>
</div>


                    <div className="auth-card">
                        <h2>Login with MetaMask</h2>
                        <p>Connect your MetaMask wallet</p>
                        <button onClick={loginMetaMask} disabled={loading}>
                            {loading ? 'Connecting...' : 'Connect MetaMask'}
                        </button>
                    </div>

                    <div className="auth-card">
                        <h2>Create MetaMask</h2>
                        <p>Don't have MetaMask yet?</p>
                        <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
                            <button>Download MetaMask</button>
                        </a>
                    </div>
                </div>

                {showMnemonic && (
                    <div className="mnemonic-modal">
                        <div className="mnemonic-content">
                            <h3>⚠️ SAVE YOUR RECOVERY PHRASE</h3>
                            <p className="warning-text">Write this down and keep it safe!</p>
                            <div className="mnemonic-box">{mnemonic}</div>
                            <button onClick={() => setShowMnemonic(false)}>I've Saved It</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
