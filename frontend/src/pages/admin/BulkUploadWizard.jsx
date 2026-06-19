import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, FileText, ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import Papa from 'papaparse';
import api from '../../services/api';

const BulkUploadWizard = ({ canteen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [parsedData, setParsedData] = useState([]);
  const [categorizedData, setCategorizedData] = useState({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const fileInputRef = useRef(null);

  // --- Step 1: Parsing ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Validate and clean data
        const cleaned = results.data.map(row => {
          const name = row.name || row.Name || row.item_name || '';
          const priceStr = row.price || row.Price || '0';
          const description = row.description || row.Description || '';
          const price = parseFloat(priceStr.toString().replace(/[^0-9.]/g, '')) || 0;
          
          let status = 'OK';
          if (!name || price <= 0) {
            status = 'Error';
          } else if (!description) {
            status = 'Warn';
          }

          return { name, price, description, status };
        });

        setParsedData(cleaned);
        setStep(2);
      },
      error: (err) => {
        console.error('CSV Parsing Error:', err);
        alert('Failed to parse CSV file.');
      }
    });
  };

  // --- Step 3: Heuristic Categorization ---
  const autoCategorize = () => {
    const categories = {
      'Beverages': ['tea', 'coffee', 'chai', 'juice', 'shake', 'lassi', 'water', 'soda'],
      'Main Course': ['thali', 'rice', 'biryani', 'paneer', 'dal', 'curry', 'sabzi', 'meal'],
      'Breads': ['roti', 'naan', 'paratha', 'kulcha', 'chapati'],
      'Fast Food': ['burger', 'pizza', 'fries', 'wrap', 'roll', 'sandwich'],
      'Snacks & Bites': ['samosa', 'kachori', 'puff', 'chips', 'chaat', 'pakora'],
      'South Indian': ['dosa', 'idli', 'vada', 'uttapam', 'upma'],
      'Desserts': ['sweet', 'gulab jamun', 'ice cream', 'pastry', 'cake', 'brownie']
    };

    const grouped = {
      'Beverages': [],
      'Main Course': [],
      'Breads': [],
      'Fast Food': [],
      'Snacks & Bites': [],
      'South Indian': [],
      'Desserts': [],
      'Uncategorized': []
    };

    parsedData.forEach(item => {
      const lowerName = item.name.toLowerCase();
      const lowerDesc = item.description.toLowerCase();
      
      let assigned = false;
      for (const [catName, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => lowerName.includes(kw) || lowerDesc.includes(kw))) {
          grouped[catName].push({ ...item, category: catName });
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        grouped.Uncategorized.push({ ...item, category: 'Uncategorized' });
      }
    });

    setCategorizedData(grouped);
    setStep(3);
  };

  // --- Step 4: Publish to Backend ---
  const handlePublish = async () => {
    // Flatten categorized data back to an array
    const validItemsToUpload = Object.values(categorizedData)
      .flat()
      .filter(item => item.status !== 'Error')
      .map(item => ({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image_url: null,
        is_available: true,
        is_veg: true // Assuming true for bulk upload MVP
      }));

    if (validItemsToUpload.length === 0) {
      setPublishError('No valid items to upload.');
      return;
    }

    try {
      setIsPublishing(true);
      setPublishError(null);
      
      // The backend needs a POST to /menu/{canteen_id}/bulk ideally,
      // but let's assume we post them one by one if bulk is not available,
      // or we check if there's a bulk endpoint.
      // Since no bulk endpoint was mentioned in the spec, we'll iterate.
      for (const item of validItemsToUpload) {
        await api.post(`/owner/menu?canteen_id=${canteen.id}`, item);
      }
      
      onSuccess();
    } catch (err) {
      console.error('Publish error:', err);
      setPublishError('Failed to publish some or all items. Please check the backend logs.');
      setIsPublishing(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto text-slate-100">
      <button 
        onClick={onClose}
        className="flex items-center text-sm text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        cancel upload
      </button>

      <h1 className="text-2xl font-bold text-white mb-2">Bulk Menu Upload</h1>
      <p className="text-slate-400 mb-8">Import, review, and categorize menu items efficiently for {canteen.name}.</p>

      {/* Stepper UI */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800 -z-10"></div>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2 bg-[#0F172A] px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
              step >= s ? 'bg-amber-500 border-amber-500 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}>
              {s}
            </div>
            <span className={`text-xs font-semibold tracking-wider uppercase ${
              step >= s ? 'text-amber-500' : 'text-slate-500'
            }`}>
              {s === 1 ? 'Upload' : s === 2 ? 'Preview' : s === 3 ? 'Categorize' : 'Confirm'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="bg-[#1A1D21] border border-slate-700/80 rounded-xl p-10 flex flex-col items-center justify-center border-dashed">
          <UploadCloud className="w-16 h-16 text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">Drop your CSV file here</h3>
          <p className="text-slate-400 text-sm mb-6">or click to browse from your computer</p>
          
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors cursor-pointer"
          >
            Browse Files
          </button>
          
          <div className="mt-8 text-xs text-slate-500 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            CSV must contain headers: name, price, description
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="bg-[#1A1D21] border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-700/80 bg-slate-800/20 flex justify-between items-center">
            <h2 className="font-semibold text-slate-200">Data Preview</h2>
            <div className="text-xs text-slate-400 flex gap-4">
              <span>{parsedData.length} items detected</span>
              <span className="text-yellow-500">{parsedData.filter(i => i.status === 'Warn').length} warnings</span>
              <span className="text-red-500">{parsedData.filter(i => i.status === 'Error').length} errors</span>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/40 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/80">
                {parsedData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{item.name || '(Empty)'}</td>
                    <td className="px-6 py-4 text-amber-500">₹{item.price}</td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{item.description || '(Empty)'}</td>
                    <td className="px-6 py-4 text-right">
                      {item.status === 'OK' && <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle className="w-3 h-3 mr-1" /> OK</span>}
                      {item.status === 'Warn' && <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><AlertTriangle className="w-3 h-3 mr-1" /> Warn</span>}
                      {item.status === 'Error' && <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><AlertCircle className="w-3 h-3 mr-1" /> Error</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-700/80 bg-slate-800/20 flex justify-end">
            <button 
              onClick={autoCategorize}
              disabled={parsedData.filter(i => i.status !== 'Error').length === 0}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-medium rounded-lg transition-colors cursor-pointer flex items-center"
            >
              Next: Categorize <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Categorization */}
      {step === 3 && (
        <div className="space-y-6">
          <p className="text-slate-400 mb-6">Our system has attempted to group your items based on keywords.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(categorizedData).map(([cat, items]) => (
              <div key={cat} className="bg-[#1A1D21] border border-slate-700/80 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">{cat}</h3>
                <p className="text-3xl font-bold text-amber-500 mb-2">{items.length}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Items</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-8">
            <button 
              onClick={() => setStep(4)}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors cursor-pointer flex items-center"
            >
              Review & Publish <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="bg-[#1A1D21] border border-slate-700/80 rounded-xl p-8 max-w-md mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Ready to Publish</h2>
          <p className="text-slate-400 mb-6">
            You are about to publish {Object.values(categorizedData).flat().filter(i => i.status !== 'Error').length} items to {canteen.name}'s live menu.
          </p>
          
          {publishError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {publishError}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => setStep(3)}
              disabled={isPublishing}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Back
            </button>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center"
            >
              {isPublishing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
              ) : 'Confirm & Publish'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default BulkUploadWizard;
