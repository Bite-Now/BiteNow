import React, { useState, useEffect } from 'react';
import { Search, Loader2, Store, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import MenuEditor from './MenuEditor';

const AdminCanteens = () => {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [error, setError] = useState(null);

  const fetchCanteens = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/canteens');
      setCanteens(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching canteens:', err);
      setError('Failed to load canteens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanteens();
  }, []);

  const filteredCanteens = canteens.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If a canteen is selected, drill down into its menu
  if (selectedCanteen) {
    return (
      <MenuEditor 
        canteen={selectedCanteen} 
        onBack={() => setSelectedCanteen(null)} 
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Canteen Menus</h1>
          <p className="text-slate-400 text-sm mt-1">Manage inventory and offerings across all campus locations.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search menus..."
            className="w-full bg-[#1A1D21] border border-slate-700/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#1A1D21] border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-700/80 bg-slate-800/20">
          <h2 className="font-semibold text-slate-200">Active Locations</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
            <p>{error}</p>
          </div>
        ) : filteredCanteens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Store className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-lg font-medium text-slate-300">No Canteens Found</p>
            <p className="text-sm mt-1 text-slate-500">
              {searchQuery ? 'Try adjusting your search.' : 'There are no registered canteens yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/40">
                <tr>
                  <th className="px-6 py-4 font-medium">Canteen Name</th>
                  <th className="px-6 py-4 font-medium">Total Items</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/80">
                {filteredCanteens.map((canteen) => (
                  <tr key={canteen.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{canteen.name}</td>
                    <td className="px-6 py-4 text-slate-400">{canteen.total_menu_items} items</td>
                    <td className="px-6 py-4">
                      {canteen.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedCanteen(canteen)}
                        className="px-4 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                      >
                        Manage Menu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCanteens;
