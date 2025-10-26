const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class KWallet {
    constructor() {
        this.wallet = null;
        this.provider = null;
        this.walletPath = path.join(__dirname, 'k-wallets.json');
    }

    createWallet() {
        try {
            const wallet = ethers.Wallet.createRandom();
            
            const walletData = {
                address: wallet.address,
                privateKey: wallet.privateKey,
                mnemonic: wallet.mnemonic.phrase,
                publicKey: wallet.publicKey
            };

            this.saveWallet(walletData);
            this.wallet = wallet;

            return {
                success: true,
                address: wallet.address,
                mnemonic: wallet.mnemonic.phrase
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async connectToNetwork(rpcUrl = 'http://127.0.0.1:8545') {
        try {
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            await this.provider.getNetwork();
            
            if (this.wallet) {
                this.wallet = this.wallet.connect(this.provider);
            }

            console.log('✅ K-Wallet connected to blockchain');
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to connect:', error.message);
            return { success: false, error: error.message };
        }
    }

    async signMessage(message) {
        try {
            if (!this.wallet) {
                throw new Error('No K-Wallet loaded');
            }

            const signature = await this.wallet.signMessage(message);
            return {
                success: true,
                signature: signature,
                address: this.wallet.address
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    saveWallet(walletData) {
        try {
            let wallets = [];
            if (fs.existsSync(this.walletPath)) {
                const data = fs.readFileSync(this.walletPath, 'utf8');
                wallets = JSON.parse(data);
            }

            wallets.push({
                address: walletData.address,
                privateKey: walletData.privateKey,
                mnemonic: walletData.mnemonic,
                publicKey: walletData.publicKey,
                createdAt: new Date().toISOString()
            });

            fs.writeFileSync(this.walletPath, JSON.stringify(wallets, null, 2));
            console.log('✅ K-Wallet saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving K-Wallet:', error);
            return false;
        }
    }

    loadWallet(address) {
        try {
            if (!fs.existsSync(this.walletPath)) {
                throw new Error('No K-Wallets found');
            }

            const wallets = JSON.parse(fs.readFileSync(this.walletPath, 'utf8'));
            const found = wallets.find(w => w.address.toLowerCase() === address.toLowerCase());
            
            if (!found) {
                throw new Error('K-Wallet not found');
            }

            this.wallet = new ethers.Wallet(found.privateKey);
            return { success: true, address: this.wallet.address };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getAllWallets() {
        try {
            if (!fs.existsSync(this.walletPath)) {
                return { success: true, wallets: [] };
            }

            const wallets = JSON.parse(fs.readFileSync(this.walletPath, 'utf8'));
            return {
                success: true,
                wallets: wallets.map(w => ({
                    address: w.address,
                    createdAt: w.createdAt
                }))
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getWalletInfo() {
        if (!this.wallet) {
            return { success: false, error: 'No K-Wallet loaded' };
        }

        return {
            success: true,
            address: this.wallet.address
        };
    }
}

module.exports = KWallet;
