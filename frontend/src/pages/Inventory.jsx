import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import * as XLSX from 'xlsx';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Filter,
    Upload
} from 'lucide-react';

const Inventory = () => {
    const [parts, setParts] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPart, setEditingPart] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        partId: '',
        names: '',
        quantity: 0,
        price: 0,
        supplier: '',
        location: '',
        minStockThreshold: 5,
        category: ''
    });

    const fetchParts = async () => {
        try {
            const { data } = await API.get(`/parts?search=${search}`);
            setParts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchParts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            names: formData.names.split(',').map(n => n.trim())
        };

        try {
            if (editingPart) {
                await API.put(`/parts/${editingPart._id}`, payload);
            } else {
                await API.post('/parts', payload);
            }
            setShowModal(false);
            setEditingPart(null);
            setFormData({ partId: '', names: '', quantity: 0, price: 0, supplier: '', location: '', minStockThreshold: 5, category: '' });
            fetchParts();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving part');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this part?')) {
            try {
                await API.delete(`/parts/${id}`);
                fetchParts();
            } catch (err) {
                alert('Error deleting part');
            }
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                
                const formattedData = data.map(item => ({
                    partId: item.partId || item['Part ID'] || `TMP-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                    names: item.names ? (typeof item.names === 'string' ? item.names.split(',').map(n=>n.trim()) : item.names) : [item.Name || item.name || item['Name(s)'] || 'Unknown'],
                    quantity: Number(item.quantity || item.Quantity || 0),
                    price: Number(item.price || item.Price || 0),
                    supplier: item.supplier || item.Supplier || 'Unknown',
                    location: item.location || item.Location || 'Unknown',
                    minStockThreshold: Number(item.minStockThreshold || item['Min Stock Threshold'] || 5),
                    category: item.category || item.Category || 'General'
                }));

                await API.post('/parts/import', formattedData);
                alert(`Successfully imported ${formattedData.length} parts!`);
                fetchParts();
            } catch (err) {
                console.error(err);
                alert('Error importing file. Please make sure the format is correct.');
            }
            e.target.value = null;
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-main mb-2">Inventory Management</h1>
                    <p className="text-text-muted">Total {parts.length} spare parts found</p>
                </div>
                <div className="flex gap-4">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".xlsx, .xls, .csv" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                    />
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="btn btn-outline"
                    >
                        <Upload size={20} />
                        Import Excel
                    </button>
                    <button 
                        onClick={() => { setShowModal(true); setEditingPart(null); }}
                        className="btn btn-primary"
                    >
                        <Plus size={20} />
                        Add Spare Part
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px] flex items-center">
                    <Search className="absolute left-4 text-text-muted" size={18} />
                    <input 
                        type="text" 
                        className="input-field pl-12 w-full" 
                        placeholder="Search by ID, Name, Category or Supplier..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn btn-outline">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            <div className="glass overflow-hidden">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Part ID</th>
                                <th>Name(s)</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parts.map((part) => (
                                <tr key={part._id}>
                                    <td className="font-mono text-xs text-primary">{part.partId}</td>
                                    <td>
                                        <div className="flex flex-wrap gap-1">
                                            {part.names.map((name, i) => (
                                                <span key={i} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs text-text-main">
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>{part.category}</td>
                                    <td className="font-bold">{part.quantity}</td>
                                    <td>${part.price}</td>
                                    <td className="text-accent-green font-semibold">${part.totalPrice}</td>
                                    <td>{part.location}</td>
                                    <td>
                                        {part.quantity <= part.minStockThreshold ? (
                                            <span className="text-red-600 text-xs flex items-center gap-1 font-semibold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                                                Low Stock
                                            </span>
                                        ) : (
                                            <span className="text-green-600 text-xs flex items-center gap-1 font-semibold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                                                Healthy
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingPart(part);
                                                    setFormData({
                                                        ...part,
                                                        names: part.names.join(', ')
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-primary transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(part._id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-text-main mb-6">
                            {editingPart ? 'Edit Spare Part' : 'Add New Spare Part'}
                        </h2>
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="input-group">
                                <label>Part ID</label>
                                <input 
                                    className="input-field" 
                                    value={formData.partId}
                                    onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <label>Names (comma separated)</label>
                                <input 
                                    className="input-field" 
                                    placeholder="e.g. Brake Pad, BP-Front"
                                    value={formData.names}
                                    onChange={(e) => setFormData({ ...formData, names: e.target.value })}
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <label>Category</label>
                                <input 
                                    className="input-field" 
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <label>Quantity</label>
                                <input 
                                    type="number" 
                                    className="input-field" 
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <label>Price per Unit</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="input-field" 
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <label>Min Stock Threshold</label>
                                <input 
                                    type="number" 
                                    className="input-field" 
                                    value={formData.minStockThreshold}
                                    onChange={(e) => setFormData({ ...formData, minStockThreshold: e.target.value })}
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <label>Supplier</label>
                                <input 
                                    className="input-field" 
                                    value={formData.supplier}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <label>Storage Location</label>
                                <input 
                                    className="input-field" 
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required 
                                />
                            </div>

                            <div className="md:col-span-2 flex gap-4 mt-4">
                                <button type="submit" className="btn btn-primary flex-1 justify-center">
                                    {editingPart ? 'Update Part' : 'Create Part'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-outline flex-1 justify-center"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
