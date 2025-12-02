import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../auth/AuthContext'; // Role පෙන්වීමට

// ⚠️ මෙම Component එක ProtectedRoute මගින් MasterAdmin සහ InventoryAdmin සඳහා පමණක් ආරක්ෂා කර තිබිය යුතුය.

const StockTransaction = () => {
    const { userRole } = useAuth();
    
    // UI State
    const [transactionType, setTransactionType] = useState('IN'); // 'IN' or 'OUT'
    const [items, setItems] = useState([]); // සියලුම Item IDs සහ Variants ගබඩා කරයි
    const [selectedItem, setSelectedItem] = useState(null);
    const [availableVariants, setAvailableVariants] = useState([]);
    
    // Form Data State
    const [formData, setFormData] = useState({
        itemId: '',
        variantId: '',
        quantity: '',
        note: '',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchItemsForDropdown();
    }, []);

    // 1. Item Dropdown සඳහා අවශ්‍ය දත්ත ලබා ගැනීම
    const fetchItemsForDropdown = async () => {
        // මෙය වෙනම endpoint එකක් විය හැකියි: /api/items/dropdown
        // නැතිනම්, inventory/view endpoint එකම භාවිතා කළ හැක.
        try {
            const response = await api.get('/inventory/view');
            // Backend එකෙන් ලැබෙන Item Data ව්‍යුහය
            const itemData = response.data.items || response.data; 
            setItems(itemData);
        } catch (err) {
            console.error('Failed to load items:', err);
            setError('Items list එක load කිරීමට නොහැකි විය.');
        }
    };

    // 2. Item ID එක තෝරන විට Variant Dropdown එක Populate කිරීම
    useEffect(() => {
        const selected = items.find(item => item.id === formData.itemId);
        
        setSelectedItem(selected);
        
        if (selected && selected.variants) {
            // Variant ID සහ Quantity පෙන්වීමට අවශ්‍ය Variants පමණක් ගනිමු
            setAvailableVariants(selected.variants.map(v => ({ 
                id: v.id, 
                size: v.size,
                currentQuantity: v.quantity // තොගය OUT සඳහා පෙන්වීමට
            })));
        } else {
            setAvailableVariants([]);
        }

        // Item ID වෙනස් වන විට Variant ID සහ Quantity ශුන්‍ය කිරීම
        setFormData(prev => ({ 
            ...prev, 
            variantId: '', 
            quantity: '',
            note: ''
        }));
    }, [formData.itemId, items]);

    // 3. Form Data වෙනස් කිරීම
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Quantity ධන අගයක් විය යුතුය (frontend validation)
        if (name === 'quantity') {
            const num = parseFloat(value);
            if (num < 0) {
                return; // ඍණ අගයන් ඇතුළු කිරීමට ඉඩ නොදෙන්න
            }
        }
        
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 4. Form Submission Logic (Stock IN / Stock OUT)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // මූලික Client Side Validation
        if (!formData.itemId || !formData.variantId || !formData.quantity || !formData.note) {
            setError('සියලුම fields (Item, Variant, Quantity, Note) පිරවිය යුතුය.');
            return;
        }
        
        const qty = parseFloat(formData.quantity);
        if (qty <= 0) {
            setError('Quantity එක ශුන්‍යයට වඩා වැඩි විය යුතුය.');
            return;
        }

        const endpoint = transactionType === 'IN' ? '/items/stock' : '/items/issue';
        
        // Stock OUT Logic: තොගය පරීක්ෂා කිරීම (Client Side Optimization)
        if (transactionType === 'OUT') {
            const currentVariant = availableVariants.find(v => v.id === formData.variantId);
            if (currentVariant && qty > currentVariant.currentQuantity) {
                // Backend එක මෙය අනිවාර්යයෙන්ම පරීක්ෂා කළ යුතුය, නමුත් frontend එකේද පණිවිඩයක් දෙමු.
                setError(`Issue කිරීමට තොගය ප්‍රමාණවත් නොවේ. ඇත්තේ ${currentVariant.currentQuantity} ක් පමණි.`);
                return;
            }
        }

        setError(null);
        setLoading(true);

        try {
            const dataToSend = {
                itemId: formData.itemId,
                variantId: formData.variantId,
                quantity: qty, // Quantity ධන අගයක් විය යුතුය
                note: formData.note,
            };

            await api.post(endpoint, dataToSend);

            setMessage(`Stock ${transactionType} ගනුදෙනුව සාර්ථකයි!`);
            
            // සාර්ථක වූ පසු Form එක Clear කිරීම
            setFormData({ itemId: '', variantId: '', quantity: '', note: '' });
            setAvailableVariants([]);
            setSelectedItem(null);

            // තොගය අලුත් කිරීම සඳහා නැවත Items Fetch කිරීම
            fetchItemsForDropdown(); 

        } catch (err) {
            console.error('Transaction Error:', err.response || err);
            // Backend එකෙන් එන පණිවිඩය (Ex: "තොගය ශුන්‍යයට වඩා අඩු විය නොහැක")
            setError(err.response?.data?.message || `Stock ${transactionType} ගනුදෙනුව අසාර්ථකයි.`);
        } finally {
            setLoading(false);
        }
    };
    
    // UI
    return (
        <div style={styles.container}>
            <h2>✍️ Stock Transaction Management</h2>
            <p>Logged in as: <b>{userRole}</b> (Admin Access)</p>
            
            <div style={styles.toggleButtons}>
                <button 
                    onClick={() => setTransactionType('IN')} 
                    style={{ ...styles.toggleButton, backgroundColor: transactionType === 'IN' ? '#4CAF50' : '#ddd' }}
                >
                    Stock IN
                </button>
                <button 
                    onClick={() => setTransactionType('OUT')} 
                    style={{ ...styles.toggleButton, backgroundColor: transactionType === 'OUT' ? '#f44336' : '#ddd' }}
                >
                    Stock OUT
                </button>
            </div>

            <h3 style={{ color: transactionType === 'IN' ? '#4CAF50' : '#f44336' }}>
                {transactionType === 'IN' ? 'තොගයට එකතු කිරීම' : 'තොගයෙන් නිකුත් කිරීම'}
            </h3>

            <form onSubmit={handleSubmit} style={styles.form}>
                
                {/* 1. Item Selection */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Item ID:</label>
                    <select 
                        name="itemId" 
                        value={formData.itemId} 
                        onChange={handleChange} 
                        required 
                        style={styles.select}
                    >
                        <option value="">Item එකක් තෝරන්න</option>
                        {items.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.id} - {item.name} ({item.section})
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. Variant Selection (Populated Dropdown) */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Variant ID:</label>
                    <select 
                        name="variantId" 
                        value={formData.variantId} 
                        onChange={handleChange} 
                        required 
                        disabled={!formData.itemId}
                        style={styles.select}
                    >
                        <option value="">Variant එකක් තෝරන්න</option>
                        {availableVariants.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.id} (Size: {v.size}) {transactionType === 'OUT' && `[Current: ${v.currentQuantity}]`}
                            </option>
                        ))}
                    </select>
                    {!formData.itemId && <p style={{ fontSize: '12px', color: '#888', margin: '5px 0 0' }}>Item ID එක තෝරන්න.</p>}
                </div>
                
                {/* 3. Quantity Input */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Quantity (ධන අගයක්):</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        min="1"
                        style={styles.input}
                    />
                </div>
                
                {/* 4. Note Input (අනිවාර්යයි) */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Note (අනිවාර්යයි):</label>
                    <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        required
                        style={styles.textarea}
                    />
                </div>
                
                {/* Messages */}
                {error && <p style={{ color: 'red', marginBottom: '15px' }}>🛑 Error: {error}</p>}
                {message && <p style={{ color: 'green', marginBottom: '15px' }}>✅ Success: {message}</p>}

                <button 
                    type="submit" 
                    disabled={loading} 
                    style={{ ...styles.submitButton, backgroundColor: transactionType === 'IN' ? '#4CAF50' : '#f44336' }}
                >
                    {loading ? 'Processing...' : `Submit Stock ${transactionType}`}
                </button>
            </form>
        </div>
    );
};

// Styles
const styles = {
    container: { maxWidth: '600px', margin: '30px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    toggleButtons: { display: 'flex', gap: '10px', marginBottom: '20px' },
    toggleButton: { padding: '10px 20px', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', flexGrow: 1, fontWeight: 'bold' },
    form: { padding: '15px', border: '1px solid #eee', borderRadius: '6px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' },
    textarea: { width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' },
    select: { width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' },
    submitButton: { padding: '12px 20px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }
};

export default StockTransaction;
