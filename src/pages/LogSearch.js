import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../auth/AuthContext'; // Role පරීක්ෂා කිරීම සඳහා

// මෙම Component එක ProtectedRoute මඟින් MasterAdmin සහ InventoryAdmin සඳහා ආරක්ෂා කර ඇත.

const LogSearch = () => {
    const { userRole, hasRole } = useAuth();
    
    // ⚠️ Frontend එකේදී Section Dropdown සඳහා අවශ්‍ය දත්ත (මෙය Backend එකෙන්ද ලබා ගත හැක)
    const availableSections = ['Packing', 'Sole', 'Insole'];
    
    // Search Query State
    const [searchParams, setSearchParams] = useState({
        itemId: '',
        type: '', // 'IN' or 'OUT'
        section: '',
        startDate: '',
        endDate: '',
    });

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial load එකේදී හෝ Search Params වෙනස් වන විට දත්ත Fetch කිරීම
    useEffect(() => {
        // පළමු වරට page එක load වන විට search නොකර සිටිය හැක.
        // නමුත්, date range වැනි default එකක් සෙට් කර search කළ හැකිය.
        // අපි search button එකක් භාවිතා කරමු.
        setLogs([]);
    }, []);

    // 1. Search Query Parameters වෙනස් කිරීම
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    // 2. Log Search API Call
    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Admin/Master Role එක තිබේදැයි නැවත පරීක්ෂා කිරීම (ProtectedRoute තිබුණත් හොඳ පුරුද්දකි)
        if (!hasRole(['MasterAdmin', 'InventoryAdmin'])) {
            setError('You do not have permission to access logs.');
            return;
        }

        setLoading(true);
        setError(null);
        setLogs([]);

        // ⚠️ Query Parameters සහිත URL එකක් නිර්මාණය කිරීම
        // හිස් parameters ඉවත් කිරීම
        const filteredParams = Object.fromEntries(
            Object.entries(searchParams).filter(([_, v]) => v)
        );
        
        // URLSearchParams මඟින් URL එක නිවැරදිව Encode කිරීම
        const queryString = new URLSearchParams(filteredParams).toString();
        
        try {
            // 📊 /api/logs/search (GET) Endpoint Call
            const response = await api.get(`/logs/search?${queryString}`);
            
            // සාර්ථක වූ පසු
            setLogs(response.data.logs || response.data); 

        } catch (err) {
            console.error('Log Search Error:', err.response || err);
            setError(err.response?.data?.message || 'Log search failed. Check filters or connection.');
        } finally {
            setLoading(false);
        }
    };
    
    // UI
    return (
        <div style={styles.container}>
            <h2>📊 Stock Log Search & Reports</h2>
            <p>Admin Access: **{userRole}**</p>
            
            {/* Filtering Interface */}
            <form onSubmit={handleSearch} style={styles.filterForm}>
                <h3>🔎 පෙරහන් (Filters)</h3>
                
                <div style={styles.filterGrid}>
                    {/* 1. Item ID */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Item ID</label>
                        <input
                            type="text"
                            name="itemId"
                            value={searchParams.itemId}
                            onChange={handleChange}
                            placeholder="Ex: Item-101"
                            style={styles.input}
                        />
                    </div>
                    
                    {/* 2. Type (IN/OUT Radio) */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Type</label>
                        <div style={styles.radioGroup}>
                            <label><input type="radio" name="type" value="IN" checked={searchParams.type === 'IN'} onChange={handleChange} /> IN</label>
                            <label><input type="radio" name="type" value="OUT" checked={searchParams.type === 'OUT'} onChange={handleChange} /> OUT</label>
                            <button type="button" onClick={() => setSearchParams(p => ({ ...p, type: '' }))} style={styles.clearButton}>Clear</button>
                        </div>
                    </div>
                    
                    {/* 3. Section Dropdown */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Section</label>
                        <select
                            name="section"
                            value={searchParams.section}
                            onChange={handleChange}
                            style={styles.select}
                        >
                            <option value="">සියලුම Sections</option>
                            {availableSections.map(sec => (
                                <option key={sec} value={sec}>{sec}</option>
                            ))}
                        </select>
                    </div>

                    {/* 4. Date Range: Start Date */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={searchParams.startDate}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>
                    
                    {/* 4. Date Range: End Date */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={searchParams.endDate}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>
                </div>

                <button type="submit" disabled={loading} style={styles.searchButton}>
                    {loading ? 'Searching...' : 'Search Logs'}
                </button>
            </form>

            {/* Results Display */}
            <h3 style={{ marginTop: '30px' }}>📄 Search Results ({logs.length} Found)</h3>
            
            {error && <p style={{ color: 'red', padding: '10px', border: '1px solid red' }}>🛑 Error: {error}</p>}
            
            <div style={styles.logTableContainer}>
                <table style={styles.logTable}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Log ID</th>
                            <th style={styles.th}>Item/Variant</th>
                            <th style={styles.th}>Type</th>
                            <th style={styles.th}>Quantity</th>
                            <th style={styles.th}>Section</th>
                            <th style={styles.th}>Note</th>
                            <th style={styles.th}>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} style={{ backgroundColor: log.type === 'IN' ? '#e6ffe6' : '#ffeeee' }}>
                                <td style={styles.td}>{log.id}</td>
                                <td style={styles.td}>{log.itemId} / {log.variantId}</td>
                                <td style={styles.td}>**{log.type}**</td>
                                <td style={styles.td}>{log.quantity}</td>
                                <td style={styles.td}>{log.section}</td>
                                <td style={styles.td}>{log.note}</td>
                                <td style={styles.td}>{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && !loading && (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '15px' }}>No logs found matching the criteria.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

// Styles
const styles = {
    container: { maxWidth: '1100px', margin: '30px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    filterForm: { padding: '20px', border: '1px solid #ccc', borderRadius: '6px', marginBottom: '20px', backgroundColor: '#f9f9f9' },
    filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' },
    input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
    select: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
    radioGroup: { display: 'flex', gap: '10px', alignItems: 'center', border: '1px solid #ccc', padding: '8px', borderRadius: '4px', backgroundColor: 'white' },
    clearButton: { marginLeft: 'auto', padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#f0f0f0' },
    searchButton: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '15px' },
    logTableContainer: { overflowX: 'auto', maxHeight: '500px' },
    logTable: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { border: '1px solid #ddd', padding: '10px', textAlign: 'left', backgroundColor: '#eef', position: 'sticky', top: 0 },
    td: { border: '1px solid #eee', padding: '10px', verticalAlign: 'top' },
};

export default LogSearch;
