const express = require('express');
const cors = require('cors');
const KWallet = require('./WalletCore');

const app = express();
const kwallet = new KWallet();

app.use(cors());
app.use(express.json());

app.post('/kwallet/create', async (req, res) => {
    const result = kwallet.createWallet();
    
    if (result.success) {
        await kwallet.connectToNetwork('http://127.0.0.1:8545');
    }
    
    res.json(result);
});

app.post('/kwallet/load', (req, res) => {
    const { address } = req.body;
    const result = kwallet.loadWallet(address);
    
    if (result.success) {
        kwallet.connectToNetwork('http://127.0.0.1:8545');
    }
    
    res.json(result);
});

app.post('/kwallet/connect', async (req, res) => {
    const result = await kwallet.connectToNetwork('http://127.0.0.1:8545');
    res.json(result);
});

app.post('/kwallet/sign', async (req, res) => {
    const { message } = req.body;
    const result = await kwallet.signMessage(message);
    res.json(result);
});

// for existing mnemonic
app.post('/kwallet/import', (req, res) => {
    const { mnemonic } = req.body;
    const result = kwallet.importFromMnemonic(mnemonic);
    if (result.success) {
        kwallet.connectToNetwork('http://127.0.0.1:8545');
    }
    res.json(result);
});


app.get('/kwallet/info', (req, res) => {
    const result = kwallet.getWalletInfo();
    res.json(result);
});

app.get('/kwallet/all', (req, res) => {
    const result = kwallet.getAllWallets();
    res.json(result);
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`✅ K-Wallet Server running on http://localhost:${PORT}`);
});
