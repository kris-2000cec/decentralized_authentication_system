const express = require('express');
const cors = require('cors');
const { SiweMessage } = require('siwe');

const app = express();
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());

const sessions = new Map();

app.get('/nonce', (req, res) => {
    const nonce = Math.random().toString(36).substring(2, 10);
    res.json({ success: true, nonce });
});

app.post('/verify', async (req, res) => {
    try {
        const { message, signature, address } = req.body;
        
        console.log('Verifying signature for:', address);
        
        const siweMessage = new SiweMessage(message);
        const result = await siweMessage.verify({ signature });

        if (!result.success) {
            return res.json({ success: false, message: 'Signature verification failed' });
        }

        if (siweMessage.address.toLowerCase() !== address.toLowerCase()) {
            return res.json({ success: false, message: 'Address mismatch' });
        }

        // Determine role (admin if address ends with specific pattern)
        const role = address.toLowerCase().endsWith('ae5') ? 'admin' : 'user';

        sessions.set(address, { authenticated: true, address, role });
        
        res.json({ 
            success: true, 
            message: 'Authentication successful',
            address,
            role
        });
    } catch (err) {
        console.error('Verification error:', err.message);
        res.json({ success: false, message: err.message });
    }
});

app.get('/session', (req, res) => {
    const { address } = req.query;
    const session = sessions.get(address);
    
    if (session) {
        res.json({ success: true, ...session });
    } else {
        res.json({ success: false, message: 'No active session' });
    }
});

app.post('/logout', (req, res) => {
    const { address } = req.body;
    sessions.delete(address);
    res.json({ success: true });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Auth Server running on http://localhost:${PORT}`);
});
