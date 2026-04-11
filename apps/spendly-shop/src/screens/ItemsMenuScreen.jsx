import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, LayoutGrid, List, MoreVertical, 
  Trash2, Edit3, Package, ArrowLeft, Barcode,
  ChevronDown, Check
} from 'lucide-react';

import { useItemsStore } from '../store/itemsStore';
import { formatMoney } from '../utils/formatMoney';

const UNITS = [
  'Piece', 'Kg', 'Gram', 'Litre', 'ML', 
  'Dozen', 'Metre', 'Box', 'Packet', 'Service'
];

const CATEGORIES = [
  { id: 'grocery', name: 'Grocery', icon: '🛒' },
  { id: 'medical', name: 'Medical', icon: '💊' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'food', name: 'Food', icon: '🍕' },
  { id: 'other', name: 'Other', icon: '➕' }
];

const ItemsMenuScreen = () => {
    const navigate = useNavigate();
    const { items, loadItems, addItem, updateItem, deleteItem, getMostUsedItems } = useItemsStore();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '', price: '', category: 'grocery', unit: 'Piece', barcode: '', gst: 0
    });

    useEffect(() => { loadItems(); }, []);

    const filteredItems = items.filter(i => 
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (i.barcode && i.barcode.includes(searchQuery))
    );

    const mostUsed = getMostUsedItems(8);

    const handleSave = async () => {
        if (!formData.name || !formData.price) return;
        
        const data = { ...formData, price: parseFloat(formData.price) };
        if (editingItem) {
            await updateItem(editingItem.id, data);
        } else {
            await addItem(data);
        }
        setIsAdding(false);
        setEditingItem(null);
        setFormData({ name: '', price: '', category: 'grocery', unit: 'Piece', barcode: '', gst: 0 });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            price: item.price.toString(),
            category: item.category || 'grocery',
            unit: item.unit || 'Piece',
            barcode: item.barcode || '',
            gst: item.gst || 0
        });
        setIsAdding(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="bg-white p-6 pb-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-slate-50">
                <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-slate-800 font-black">
                    <ArrowLeft className="w-5 h-5" /> My Items
                </button>
                <div className="flex gap-4">
                    <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="text-slate-400">
                        {viewMode === 'grid' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
                    </button>
                    <button onClick={() => setIsAdding(true)} className="text-primary">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="p-4 space-y-6">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search items..."
                        className="w-full bg-white border border-slate-100 p-4 pl-11 rounded-2xl shadow-sm outline-none focus:border-primary transition-all font-bold text-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Most Used Section */}
                {!searchQuery && mostUsed.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Quick Add Items</h3>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1 -mx-4 px-5">
                            {mostUsed.map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => handleEdit(item)}
                                    className="flex-shrink-0 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm flex flex-col items-center min-w-[100px] active:scale-95 transition-transform"
                                >
                                    <div className="text-xs font-black text-slate-800 truncate w-full text-center">{item.name}</div>
                                    <div className="text-[10px] font-bold text-primary">{formatMoney(item.price)}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Items Grid/List */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                    {filteredItems.map(item => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => handleEdit(item)}
                            className={`bg-white border border-slate-100 rounded-3xl p-4 shadow-sm active:bg-slate-50 transition-colors ${
                                viewMode === 'list' ? 'flex items-center justify-between' : ''
                            }`}
                        >
                            <div className={viewMode === 'list' ? 'flex items-center gap-4' : 'space-y-2'}>
                                <div className={`w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl`}>
                                    {CATEGORIES.find(c => c.id === item.category)?.icon || '➕'}
                                </div>
                                <div>
                                    <div className="font-black text-slate-800 text-sm leading-tight">{item.name}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.unit || 'Piece'} • {item.timesUsed || 0} sold</div>
                                </div>
                            </div>
                            <div className={viewMode === 'grid' ? 'mt-3 pt-3 border-t border-slate-50' : 'text-right'}>
                                <div className="font-black text-primary">{formatMoney(item.price)}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="p-12 text-center text-slate-300 flex flex-col items-center">
                        <Package className="w-16 h-16 mb-4 opacity-20" />
                        <p className="font-bold">No items found</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Overlay */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-50 flex items-end">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="relative w-full bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl space-y-6"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-black text-slate-900">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                                <button onClick={() => setIsAdding(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Item Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-primary font-bold"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Price (₹)</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-primary font-bold"
                                            value={formData.price}
                                            onChange={e => setFormData({...formData, price: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Unit</label>
                                        <select 
                                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-primary font-bold appearance-none"
                                            value={formData.unit}
                                            onChange={e => setFormData({...formData, unit: e.target.value})}
                                        >
                                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                                    <div className="flex gap-2 overflow-x-auto py-2">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFormData({...formData, category: cat.id})}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                                                    formData.category === cat.id 
                                                    ? 'bg-primary border-primary text-white shadow-md' 
                                                    : 'bg-white border-slate-100 text-slate-600'
                                                }`}
                                            >
                                                <span>{cat.icon}</span>
                                                <span className="text-xs font-bold">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Barcode (Optional)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-primary font-bold"
                                            value={formData.barcode}
                                            onChange={e => setFormData({...formData, barcode: e.target.value})}
                                        />
                                        <button className="w-14 h-14 bg-emerald-50 text-primary border border-emerald-100 rounded-2xl flex items-center justify-center">
                                            <Barcode className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                {editingItem && (
                                    <button 
                                        onClick={() => { deleteItem(editingItem.id); setIsAdding(false); }}
                                        className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center border border-red-100"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                )}
                                <button 
                                    onClick={handleSave}
                                    className="flex-1 h-14 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 active:scale-95 transition-transform"
                                >
                                    {editingItem ? 'Update Item' : 'Save Item'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Add Button */}
            <button 
                onClick={() => { setEditingItem(null); setIsAdding(true); }}
                className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-40"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>
    );
};

const X = ({ className }) => {
  return <Plus className={className} style={{ transform: 'rotate(45deg)' }} />;
};

export default ItemsMenuScreen;
