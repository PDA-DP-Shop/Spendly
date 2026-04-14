import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, LayoutGrid, List, 
  Trash2, Package, ArrowLeft, X, ChevronRight
} from 'lucide-react';

import { useItemsStore } from '../store/itemsStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatMoney } from '../utils/formatMoney';

const UNITS = ['Piece', 'Kg', 'Gram', 'Litre', 'ML', 'Dozen', 'Metre', 'Box', 'Packet', 'Service'];

const CATEGORIES = [
  { id: 'grocery', name: 'Grocery', icon: '🛒' },
  { id: 'medical', name: 'Medical', icon: '💊' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'food', name: 'Food', icon: '🍕' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'other', name: 'Other', icon: '📦' },
];

const ItemsMenuScreen = () => {
    const navigate = useNavigate();
    const { items, loadItems, addItem, updateItem, deleteItem } = useItemsStore();
    const { settings } = useSettingsStore();
    const currency = settings?.currency || 'USD';
    
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
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

    const openAdd = () => {
        setEditingItem(null);
        setFormData({ name: '', price: '', category: 'grocery', unit: 'Piece', barcode: '', gst: 0 });
        setIsAdding(true);
    };

    const openEdit = (item) => {
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
    };

    const handleDelete = async () => {
        if (editingItem) {
            await deleteItem(editingItem.id);
            setIsAdding(false);
            setEditingItem(null);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-32 relative overflow-x-hidden font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
                <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-black font-[800] tracking-tight active:scale-95 transition-transform group">
                    <div className="p-2 bg-[#F8FAFC] rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[17px]">My Items</span>
                </button>
                <button
                    onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
                    className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center text-[#94A3B8] active:bg-black active:text-white transition-all"
                >
                    {viewMode === 'grid' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
                </button>
            </header>

            <div className="p-6 space-y-8">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CBD5E1]" />
                    <input
                        className="w-full bg-[#F8FAFC] border border-transparent p-5 pl-14 rounded-[24px] outline-none focus:border-[#F1F5F9] font-[700] text-black text-[15px] placeholder:text-[#CBD5E1]"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Stats bar */}
                <div className="flex items-center justify-between px-2">
                    <div className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest">
                        {filteredItems.length} Item{filteredItems.length !== 1 ? 's' : ''}
                    </div>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-full text-[12px] font-[800] active:scale-95 transition-transform shadow-md"
                    >
                        <Plus className="w-4 h-4" /> Add Item
                    </button>
                </div>

                {/* Items grid/list */}
                {filteredItems.length > 0 ? (
                    <motion.div layout className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((item, idx) => (
                                <motion.button
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => openEdit(item)}
                                    className={`bg-[#F8FAFC] border border-transparent rounded-[28px] active:bg-slate-100 transition-all text-left ${
                                        viewMode === 'list' ? 'flex items-center p-5 gap-5 w-full' : 'p-6 space-y-4'
                                    }`}
                                >
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[26px] shadow-sm border border-[#F1F5F9] flex-shrink-0">
                                        {CATEGORIES.find(c => c.id === item.category)?.icon || '📦'}
                                    </div>
                                    <div className={viewMode === 'list' ? 'flex-1 min-w-0' : 'space-y-1'}>
                                        <div className="font-[800] text-black text-[15px] tracking-tight truncate">{item.name}</div>
                                        <div className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest">
                                            {item.unit || 'Piece'} · {item.timesUsed || 0}× used
                                        </div>
                                    </div>
                                    <div className={viewMode === 'list' ? 'text-right flex-shrink-0' : 'pt-4 border-t border-[#F1F5F9] flex items-center justify-between'}>
                                        <div className="font-[800] text-black text-[16px] tracking-tight">{formatMoney(item.price, currency)}</div>
                                        {viewMode === 'list' && <ChevronRight className="w-4 h-4 text-[#CBD5E1] mt-1" />}
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="py-20 text-center bg-[#F8FAFC] rounded-[40px] border-2 border-dashed border-[#F1F5F9]">
                        <Package className="w-12 h-12 text-[#CBD5E1] mx-auto mb-4" />
                        <h3 className="text-[18px] font-[800] text-black">No Items Yet</h3>
                        <p className="text-[#94A3B8] text-sm font-[500] mt-1">Tap "Add Item" to save your first product.</p>
                        <button
                            onClick={openAdd}
                            className="mt-6 bg-black text-white px-8 py-4 rounded-full font-[800] text-[14px] shadow-xl active:scale-95 transition-transform"
                        >
                            Add First Item
                        </button>
                    </div>
                )}
            </div>

            {/* Add / Edit Bottom Sheet */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-end">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                            className="relative w-full bg-white rounded-t-[40px] p-8 pb-16 shadow-2xl space-y-7 max-h-[90dvh] overflow-y-auto scrollbar-hide"
                        >
                            {/* Sheet Handle */}
                            <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full mx-auto -mt-2 mb-2" />

                            {/* Sheet Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-[24px] font-[800] text-black tracking-tight">
                                        {editingItem ? 'Edit Item' : 'New Item'}
                                    </h2>
                                    <p className="text-[11px] font-[700] text-[#94A3B8] uppercase tracking-widest mt-1">
                                        {editingItem ? 'Update product details' : 'Add to your inventory'}
                                    </p>
                                </div>
                                <button onClick={() => setIsAdding(false)} className="w-12 h-12 bg-[#F8FAFC] rounded-full flex items-center justify-center text-black border border-[#F1F5F9]">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-1.5">Item Name</label>
                                    <input
                                        className="w-full bg-[#F8FAFC] border border-[#F1F5F9] p-5 rounded-[20px] outline-none font-[700] text-black text-[16px] placeholder:text-[#CBD5E1]"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Milk Packet"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-1.5">Price ({currency})</label>
                                        <input
                                            type="number"
                                            className="w-full bg-[#F8FAFC] border border-[#F1F5F9] p-5 rounded-[20px] outline-none font-[800] text-black text-[16px] placeholder:text-[#CBD5E1]"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-1.5">Unit</label>
                                        <select
                                            className="w-full bg-[#F8FAFC] border border-[#F1F5F9] p-5 rounded-[20px] outline-none font-[700] text-black text-[15px] appearance-none"
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        >
                                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-2">Category</label>
                                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                                className={`flex items-center gap-2 px-5 py-3 rounded-full border text-[12px] font-[800] whitespace-nowrap transition-all ${
                                                    formData.category === cat.id
                                                        ? 'bg-black border-black text-white shadow-md'
                                                        : 'bg-[#F8FAFC] border-transparent text-[#64748B]'
                                                }`}
                                            >
                                                <span>{cat.icon}</span> {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-1.5">Barcode (Optional)</label>
                                    <input
                                        className="w-full bg-[#F8FAFC] border border-[#F1F5F9] p-5 rounded-[20px] outline-none font-[700] text-black text-[15px] placeholder:text-[#CBD5E1]"
                                        value={formData.barcode}
                                        onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                        placeholder="Scan or enter barcode"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                {editingItem && (
                                    <button
                                        onClick={handleDelete}
                                        className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center border border-red-100 active:bg-red-100 transition-all flex-shrink-0"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={handleSave}
                                    className="flex-1 h-16 bg-black text-white rounded-full font-[800] text-[16px] shadow-xl active:bg-slate-900 transition-all"
                                >
                                    {editingItem ? 'Save Changes' : 'Add Item'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ItemsMenuScreen;
