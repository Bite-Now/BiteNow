import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Upload, Plus, AlertCircle, MenuSquare } from 'lucide-react';
import api from '../../services/api';
import BulkUploadWizard from './BulkUploadWizard';

const MenuEditor = ({ canteen, onBack }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/canteens/${canteen.id}/menu`);
      setMenuItems(response.data.menu || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError('Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showBulkUpload) {
      fetchMenu();
    }
  }, [canteen.id, showBulkUpload]);

  // The backend already groups items by category in response.data.menu
  const groupedItems = menuItems;

  if (showBulkUpload) {
    return (
      <BulkUploadWizard 
        canteen={canteen} 
        onClose={() => setShowBulkUpload(false)} 
        onSuccess={() => {
          setShowBulkUpload(false);
          fetchMenu();
        }}
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100">
      {/* Back Button and Header */}
      <button 
        onClick={onBack}
        className="flex items-center text-sm text-slate-400 hover:text-amber-500 mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
        back to canteens
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            Editing Menu For
          </div>
          <h1 className="text-3xl font-bold text-white">{canteen.name}</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 border border-amber-500 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 bg-[#1A1D21] border border-slate-700/80 rounded-xl">
          <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
          <p className="text-slate-400">{error}</p>
        </div>
      ) : Object.keys(groupedItems).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-[#1A1D21] border border-slate-700/80 rounded-xl text-slate-400">
          <MenuSquare className="w-12 h-12 text-slate-600 mb-3" />
          <p className="text-lg font-medium text-slate-300">No Menu Items Found</p>
          <p className="text-sm mt-1 text-slate-500">
            Click 'Bulk Upload' or 'Add Item' to start building the menu.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="bg-[#1A1D21] border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-700/80 bg-slate-800/20 flex justify-between items-center">
                <div className="flex items-center">
                  <MenuSquare className="w-5 h-5 text-amber-500 mr-3" />
                  <h2 className="font-semibold text-slate-200 uppercase tracking-wider text-sm">{category}</h2>
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                  {items.length} items
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-800/40">
                    <tr>
                      <th className="px-6 py-4 font-medium w-16">Img</th>
                      <th className="px-6 py-4 font-medium">Item Name</th>
                      <th className="px-6 py-4 font-medium">Price</th>
                      <th className="px-6 py-4 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/80">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-md object-cover border border-slate-700" />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center">
                              <MenuSquare className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-200">{item.name}</td>
                        <td className="px-6 py-4 font-medium text-amber-500">₹{item.price}</td>
                        <td className="px-6 py-4 text-slate-400 max-w-xs truncate" title={item.description}>
                          {item.description || 'No description'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuEditor;
