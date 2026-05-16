import React, { useState, useEffect } from 'react';
import API from '../api';
import { FileText, Download, Table as TableIcon, Layers } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchParts = async () => {
            try {
                const { data } = await API.get('/parts');
                setParts(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchParts();
    }, []);

    const exportPDF = () => {
        const doc = jsPDF();
        doc.text('Spare-Part Inventory Report', 14, 15);
        
        const tableColumn = ["Part ID", "Names", "Quantity", "Price", "Total", "Supplier", "Location", "Date"];
        const tableRows = [];

        parts.forEach(part => {
            const partData = [
                part.partId,
                part.names.join(', '),
                part.quantity,
                `$${part.price}`,
                `$${part.totalPrice}`,
                part.supplier,
                part.location,
                new Date(part.dateAdded).toLocaleDateString()
            ];
            tableRows.push(partData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.save(`Inventory_Report_${new Date().toISOString()}.pdf`);
    };

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(parts.map(p => ({
            'Part ID': p.partId,
            'Names': p.names.join(', '),
            'Quantity': p.quantity,
            'Price': p.price,
            'Total Price': p.totalPrice,
            'Supplier': p.supplier,
            'Location': p.location,
            'Date Added': new Date(p.dateAdded).toLocaleDateString()
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
        XLSX.writeFile(workbook, `Inventory_Report_${new Date().toISOString()}.xlsx`);
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold text-text-main mb-2">Reports & Exports</h1>
                <p className="text-text-muted">Generate and download inventory data in multiple formats</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-8 flex flex-col items-center text-center">
                    <div className="bg-red-50 p-6 rounded-3xl mb-6">
                        <FileText className="text-red-500" size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-text-main mb-6">PDF Document</h3>
                    <button onClick={exportPDF} className="btn btn-primary w-full justify-center py-4">
                        <Download size={20} />
                        Download PDF
                    </button>
                </div>

                <div className="glass p-8 flex flex-col items-center text-center">
                    <div className="bg-green-50 p-6 rounded-3xl mb-6">
                        <TableIcon className="text-green-500" size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-text-main mb-6">Excel Spreadsheet</h3>
                    <button onClick={exportExcel} className="btn btn-primary w-full justify-center py-4">
                        <Download size={20} />
                        Download Excel
                    </button>
                </div>
            </div>

            <div className="glass p-8 mt-4">
                <div className="flex items-center gap-3 mb-6">
                    <Layers className="text-primary" size={24} />
                    <h3 className="text-xl font-bold text-text-main">Report Preview</h3>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <p className="text-sm text-text-muted mb-4">You are about to export {parts.length} records. Last updated: {new Date().toLocaleString()}</p>
                    <div className="flex flex-col gap-2">
                        {parts.slice(0, 5).map((p, i) => (
                            <div key={i} className="flex justify-between text-xs py-2 border-b border-slate-200 last:border-0">
                                <span className="text-text-main font-mono">{p.partId}</span>
                                <span className="text-text-muted">{p.names[0]}</span>
                                <span className="text-accent-cyan font-semibold">${p.totalPrice}</span>
                            </div>
                        ))}
                        {parts.length > 5 && <p className="text-[10px] text-center text-text-muted mt-2">... and {parts.length - 5} more records</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
