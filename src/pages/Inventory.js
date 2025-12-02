// ... Inventory.js ඇතුළත
const { userRole } = useAuth();
const isViewOnlyUser = userRole === 'User';

// Backend Response එකෙන් ලැබෙන data (උදාහරණයක්)
const inventoryItems = [
    { 
        id: 1, name: 'Shoe Model X', section: 'Packing', 
        variants: [
            { id: 'v1', quantity: 10, size: 7 }, 
            { id: 'v2', quantity: 0, size: 8 }, // User ට නොපෙන්විය යුතුය
        ] 
    }
];

// ⚠️ Role-Based Data Filtering Logic:
const filteredItems = inventoryItems.map(item => ({
    ...item,
    variants: isViewOnlyUser 
        ? item.variants.filter(variant => variant.quantity > 0) // User: Quantity > 0 පමණක්
        : item.variants // Admin/Master: සියල්ල
})).filter(item => item.variants.length > 0); // Variant කිසිවක් නැති Item ඉවත් කිරීම
