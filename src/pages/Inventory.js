import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import api from '../api/api';

const Inventory = () => {
    const { userRole, logout } = useAuth();
    const [inventoryData, setInventoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // View Logic තීරණය කරන boolean
    const isViewOnlyUser = userRole === 'User'; 

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            // 📦 /api/inventory/view (GET)
            const response = await api.get('/inventory/view');
            const rawData = response.data.items; // Backend එකේ response structure එක අනුව වෙනස් විය හැක

            // ⚠️ Role-Based Data Filtering and Nested Rendering Logic
            const filteredData = rawData
                .map(item => ({
                    ...item,
                    // Variant Array එක පෙරීම (Nested Filtering)
                    variants: isViewOnlyUser
                        // User නම්: quantity > 0 variants පමණක්
                        ? item.variants.filter(variant => variant.quantity > 0)
                        // Admin/Master නම්: සියලුම variants
                        : item.variants
                }))
                // Filter කිරීමෙන් පසු variant කිසිවක් නැති Item ඉවත් කිරීම
                .filter(item => item.variants.length > 0); 

            setInventoryData(filteredData);
            setError(null);

        } catch (err) {
            console.error('Inventory Error:', err);
            setError(err.response?.data?.message || 'Inventory data loading failed.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Inventory...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>📦 Inventory View</h1>
                <p>Logged in as: <b>{userRole}</b></p>
                <button onClick={logout} style={styles.logoutButton}>Logout</button>
            </div>
            
            {inventoryData.length === 0 ? (
                <p>ඔබගේ Role එකට අදාල Items කිසිවක් දැනට නොමැත.</p>
            ) : (
                inventoryData.map(item => (
                    <div key={item.id} style={styles.itemCard}>
                        {/* Item Details */}
                        <h3>{item.name} <span>(Section: {item.section})</span></h3>
                        
                        {/* Nested Variant List */}
                        <div style={styles.variantsTableContainer}>
                            <h4 style={{ marginBottom: '5px' }}>Variant Stock:</h4>
                            <table style={styles.variantsTable}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Variant ID</th>
                                        <th style={styles.th}>Size</th>
                                        <th style={styles.th}>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {item.variants.map(variant => (
                                        <tr key={variant.id}>
                                            <td style={styles.td}>{variant.id}</td>
                                            <td style={styles.td}>{variant.size}</td>
                                            <td style={styles.td}>{variant.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

const styles = {
    container: { maxWidth: '1000px', margin: '30px auto', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #ddd' },
    logoutButton: { padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    itemCard: { border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '6px', backgroundColor: '#f9f9f9' },
    variantsTableContainer: { overflowX: 'auto' },
    variantsTable: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { borderBottom: '2px solid #aaa', padding: '10px', textAlign: 'left', backgroundColor: '#eef' },
    td: { borderBottom: '1px solid #eee', padding: '10px' },
};

export default Inventory;
