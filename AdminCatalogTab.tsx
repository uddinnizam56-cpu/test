import React, { useState } from 'react';
import {
  Recycle,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Tag,
  Layers,
} from 'lucide-react';
import { ScrapItem, ScrapCategory, Language } from '../../types';

interface AdminCatalogTabProps {
  items: ScrapItem[];
  categories: ScrapCategory[];
  language: Language;
  onUpdateScrapRate: (itemId: string, newRate: number) => void;
  onCreateScrapItem?: (item: ScrapItem) => void;
  onUpdateScrapItem?: (itemId: string, updated: Partial<ScrapItem>) => void;
  onDeleteScrapItem?: (itemId: string) => void;
  onCreateCategory?: (cat: ScrapCategory) => void;
  onDeleteCategory?: (catId: string) => void;
}

export const AdminCatalogTab: React.FC<AdminCatalogTabProps> = ({
  items,
  categories,
  language,
  onUpdateScrapRate,
  onCreateScrapItem,
  onUpdateScrapItem,
  onDeleteScrapItem,
  onCreateCategory,
  onDeleteCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCatalogSubTab, setActiveCatalogSubTab] = useState<'items' | 'categories'>('items');

  // Scrap Item Modals
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScrapItem | null>(null);
  const [deleteItemConfirmId, setDeleteItemConfirmId] = useState<string | null>(null);

  // Category Modals
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [deleteCatConfirmId, setDeleteCatConfirmId] = useState<string | null>(null);

  // Item Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Metals');
  const [rate, setRate] = useState(50);
  const [unit, setUnit] = useState<'kg' | 'piece'>('kg');
  const [co2Offset, setCo2Offset] = useState(2.5);
  const [minQty, setMinQty] = useState('5 kg');
  const [description, setDescription] = useState('');
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('up');
  const [icon, setIcon] = useState('zap');

  // Category Form Fields
  const [catName, setCatName] = useState('');
  const [catNameKn, setCatNameKn] = useState('');
  const [catNameHi, setCatNameHi] = useState('');
  const [catColor, setCatColor] = useState('emerald');

  const filteredItems = items.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAddItem = () => {
    setName('');
    setCategory(categories[0]?.name || 'Metals');
    setRate(45);
    setUnit('kg');
    setCo2Offset(2.0);
    setMinQty('5 kg');
    setDescription('');
    setTrend('up');
    setIcon('zap');
    setAddItemOpen(true);
  };

  const handleOpenEditItem = (item: ScrapItem) => {
    setSelectedItem(item);
    setName(item.name);
    setCategory(item.category);
    setRate(item.rate);
    setUnit(item.unit);
    setCo2Offset(item.co2Offset);
    setMinQty(item.minQty);
    setDescription(item.description || '');
    setTrend(item.trend || 'stable');
    setIcon(item.icon);
    setEditItemOpen(true);
  };

  const handleSaveAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;
    const newItem: ScrapItem = {
      id: `scrap_${Date.now()}`,
      name,
      category,
      rate: Number(rate),
      unit,
      co2Offset: Number(co2Offset),
      minQty,
      description,
      trend,
      icon,
    };
    if (onCreateScrapItem) {
      onCreateScrapItem(newItem);
    }
    setAddItemOpen(false);
  };

  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !name) return;
    if (onUpdateScrapItem) {
      onUpdateScrapItem(selectedItem.id, {
        name,
        category,
        rate: Number(rate),
        unit,
        co2Offset: Number(co2Offset),
        minQty,
        description,
        trend,
        icon,
      });
    }
    setEditItemOpen(false);
    setSelectedItem(null);
  };

  const handleConfirmDeleteItem = (id: string) => {
    if (onDeleteScrapItem) {
      onDeleteScrapItem(id);
    }
    setDeleteItemConfirmId(null);
  };

  const handleSaveAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    const newCat: ScrapCategory = {
      id: `cat_${Date.now()}`,
      name: catName,
      nameKn: catNameKn || catName,
      nameHi: catNameHi || catName,
      icon: 'zap',
      itemCount: 0,
      color: catColor,
      bgGradient: 'from-emerald-500 to-teal-700',
    };
    if (onCreateCategory) {
      onCreateCategory(newCat);
    }
    setAddCatOpen(false);
    setCatName('');
    setCatNameKn('');
    setCatNameHi('');
  };

  const handleConfirmDeleteCategory = (id: string) => {
    if (onDeleteCategory) {
      onDeleteCategory(id);
    }
    setDeleteCatConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
              <Recycle className="w-3.5 h-3.5 text-emerald-400" />
              Scrap Material Catalog
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Real-Time Market Rates & ESG Multipliers</span>
          </div>
          <h2 className="text-2xl font-black font-display text-white">
            Scrap Materials & Rate Catalog
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Add new recyclable commodities, change live per-kg/piece market rates, update CO2 offset factors, and manage categories visible to all customers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddItem}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scrap Item</span>
          </button>
          <button
            onClick={() => setAddCatOpen(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 border border-emerald-500/30"
          >
            <Tag className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Items vs Categories */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveCatalogSubTab('items')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeCatalogSubTab === 'items'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Recycle className="w-4 h-4 text-emerald-400" />
          <span>All Recyclable Materials ({items.length})</span>
        </button>
        <button
          onClick={() => setActiveCatalogSubTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeCatalogSubTab === 'categories'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-200" />
          <span>Categories ({categories.length})</span>
        </button>
      </div>

      {/* SUB TAB 1: ALL ITEMS */}
      {activeCatalogSubTab === 'items' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedCategory === 'all' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`px-3 py-1 rounded-lg transition-all capitalize whitespace-nowrap ${
                    selectedCategory.toLowerCase() === c.name.toLowerCase()
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search scrap item name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Material Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Rate (₹/unit)</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4">CO₂ Offset</th>
                    <th className="py-3 px-4">Min Qty</th>
                    <th className="py-3 px-4">Market Trend</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-black text-slate-900 block">{item.name}</span>
                          {item.description && (
                            <span className="text-[10px] text-slate-400 truncate block max-w-xs">{item.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                        ₹{item.rate}/{item.unit}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-slate-500 font-bold">{item.unit}</td>
                      <td className="py-3.5 px-4 font-bold text-teal-700">{item.co2Offset} kg CO₂</td>
                      <td className="py-3.5 px-4 text-slate-600">{item.minQty}</td>
                      <td className="py-3.5 px-4">
                        {item.trend === 'up' && (
                          <span className="flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                            <TrendingUp className="w-3.5 h-3.5" /> High
                          </span>
                        )}
                        {item.trend === 'down' && (
                          <span className="flex items-center gap-1 text-[11px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md w-fit">
                            <TrendingDown className="w-3.5 h-3.5" /> Dip
                          </span>
                        )}
                        {item.trend === 'stable' && (
                          <span className="flex items-center gap-1 text-[11px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                            <Minus className="w-3.5 h-3.5" /> Stable
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                            title="Edit material details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteItemConfirmId(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Delete scrap item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: CATEGORIES */}
      {activeCatalogSubTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-black text-base text-slate-900">{c.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>ಕನ್ನಡ: {c.nameKn}</span>
                    <span>•</span>
                    <span>हिंदी: {c.nameHi}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-black">
                  {items.filter((i) => i.category.toLowerCase() === c.name.toLowerCase()).length} Items
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setDeleteCatConfirmId(c.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Category</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          ADD SCRAP ITEM MODAL
          ========================================================================= */}
      {addItemOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Recycle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 font-display">Add Recyclable Material</h3>
              </div>
              <button
                onClick={() => setAddItemOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddItem} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item / Material Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pure Copper Wire"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit of Measurement</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="kg">Per Kilogram (kg)</option>
                    <option value="piece">Per Piece (pc)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rate (₹ per {unit})</label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CO₂ Offset (kg/unit)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={co2Offset}
                    onChange={(e) => setCo2Offset(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-teal-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Minimum Pickup Qty</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 kg or 1 pc"
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price Trend</label>
                  <select
                    value={trend}
                    onChange={(e) => setTrend(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="up">Bullish / Up</option>
                    <option value="stable">Stable</option>
                    <option value="down">Bearish / Down</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Item Description / Segregation Guidance</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Electrical coils, motors, bright wiring"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddItemOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md"
                >
                  Publish Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT SCRAP ITEM MODAL
          ========================================================================= */}
      {editItemOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 font-display">Edit Recyclable Material</h3>
              </div>
              <button
                onClick={() => setEditItemOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item / Material Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="kg">Per Kilogram (kg)</option>
                    <option value="piece">Per Piece (pc)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rate (₹ per {unit})</label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CO₂ Offset (kg/unit)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={co2Offset}
                    onChange={(e) => setCo2Offset(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-teal-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Qty</label>
                  <input
                    type="text"
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price Trend</label>
                  <select
                    value={trend}
                    onChange={(e) => setTrend(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="up">Bullish / Up</option>
                    <option value="stable">Stable</option>
                    <option value="down">Bearish / Down</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditItemOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md"
                >
                  Update Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD CATEGORY MODAL
          ========================================================================= */}
      {addCatOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 font-display">Add Scrap Category</h3>
              </div>
              <button
                onClick={() => setAddCatOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category English Name</label>
                <input
                  type="text"
                  placeholder="e.g. Battery & Solar"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kannada Translation</label>
                <input
                  type="text"
                  placeholder="e.g. ಬ್ಯಾಟರಿಗಳು"
                  value={catNameKn}
                  onChange={(e) => setCatNameKn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hindi Translation</label>
                <input
                  type="text"
                  placeholder="e.g. बैटरी स्क्रैप"
                  value={catNameHi}
                  onChange={(e) => setCatNameHi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddCatOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRM DELETE ITEM MODAL
          ========================================================================= */}
      {deleteItemConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black font-display text-slate-900">Delete Material</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this scrap item from the platform catalog?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteItemConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDeleteItem(deleteItemConfirmId)}
                className="px-4 py-2 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                Delete Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRM DELETE CATEGORY MODAL
          ========================================================================= */}
      {deleteCatConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black font-display text-slate-900">Delete Category</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove this category? Items under this category will need reassignment.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteCatConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDeleteCategory(deleteCatConfirmId)}
                className="px-4 py-2 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
