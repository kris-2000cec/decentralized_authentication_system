import React from 'react';

export default function Dashboard({ address, role, logout }) {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>⚡ Advanced Hedge Fund Manager</h1>
                <button className="logout-btn" onClick={logout}>Logout</button>
            </div>

            <div className="aum-display">
                <h2>Total Assets Under Management</h2>
                <div className="aum-value">$1,430,672,000,000</div>
                <p className="aum-label">(1.43 Trillion USD)</p>
            </div>

            <div className="user-info">
                <p><strong>Wallet Address:</strong> {address}</p>
                <p><strong>Role:</strong> <span className={`role-badge ${role}`}>{role.toUpperCase()}</span></p>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <h3>Global Equity Desk</h3>
                    <p className="metric-value">$700B</p>
                </div>
                <div className="metric-card">
                    <h3>Fixed Income & Credit</h3>
                    <p className="metric-value">$480B</p>
                </div>
                <div className="metric-card">
                    <h3>Digital Assets & Crypto</h3>
                    <p className="metric-value">$250B</p>
                </div>
            </div>

            {role === 'admin' && (
                <div className="admin-panel">
                    <h3>🔒 Admin Controls</h3>
                    <div className="admin-buttons">
                        <button>Adjust Portfolio Allocation</button>
                        <button>View All Users</button>
                        <button>Generate Reports</button>
                        <button>Risk Management</button>
                    </div>
                </div>
            )}

            {role === 'user' && (
                <div className="user-panel">
                    <h3>📊 User Dashboard</h3>
                    <p>Read-only access. Contact admin for additional permissions.</p>
                    <button>View Public Reports</button>
                </div>
            )}
        </div>
    );
}
