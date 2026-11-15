import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Factory,
  ShieldCheck,
  Award,
  Leaf,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { BusinessProfile, Language } from '../../types';

interface AdminBusinessTabProps {
  businesses: BusinessProfile[];
  language: Language;
  onCreateBusiness?: (biz: BusinessProfile) => void;
  onUpdateBusiness?: (bizId: string, updated: Partial<BusinessProfile>) => void;
  onDeleteBusiness?: (bizId: string) => void;
}

export const AdminBusinessTab: React.FC<AdminBusinessTabProps> = ({
  businesses,
  language,
  onCreateBusiness,
  onUpdateBusiness,
  onDeleteBusiness,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<BusinessProfile | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [industryCategory, setIndustryCategory] = useState<BusinessProfile['industryCategory']>('IT Park & Tech');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('Electronics City');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560100');
  const [tonnageCollected, setTonnageCollected] = useState(25.0);
  const [co2OffsetTonnes, setCo2OffsetTonnes] = useState(65.0);
  const [eprCertificatesCount, setEprCertificatesCount] = useState(5);
  const [monthlyContractActive, setMonthlyContractActive] = useState(true);

  const INDUSTRIES = [
    'All',
    'Manufacturing',
    'IT Park & Tech',
    'Automobile',
    'Textiles',
    'Chemical & Plastics',
    'Warehouse',
  ];

  const filtered = businesses.filter((b) => {
    const matchesCat = categoryFilter === 'All' || b.industryCategory === categoryFilter;
    const matchesSearch =
      b.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.gstin.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setCompanyName('');
    setGstin(`29AABCP${Math.floor(1000 + Math.random() * 9000)}F1Z5`);
    setContactPerson('');
    setPhone('+91 98450 11223');
    setEmail('esg@partner.in');
    setIndustryCategory('IT Park & Tech');
    setStreet('Plot 12, Phase 1');
    setArea('Electronics City');
    setCity('Bengaluru');
    setPincode('560100');
    setTonnageCollected(20);
    setCo2OffsetTonnes(55);
    setEprCertificatesCount(4);
    setMonthlyContractActive(true);
    setAddModalOpen(true);
  };

  const handleOpenEdit = (biz: BusinessProfile) => {
    setSelectedBiz(biz);
    setCompanyName(biz.companyName);
    setGstin(biz.gstin);
    setContactPerson(biz.contactPerson);
    setPhone(biz.phone);
    setEmail(biz.email);
    setIndustryCategory(biz.industryCategory);
    setStreet(biz.facilityAddress.street);
    setArea(biz.facilityAddress.area);
    setCity(biz.facilityAddress.city);
    setPincode(biz.facilityAddress.pincode);
    setTonnageCollected(biz.tonnageCollected);
    setCo2OffsetTonnes(biz.co2OffsetTonnes);
    setEprCertificatesCount(biz.eprCertificatesCount);
    setMonthlyContractActive(biz.monthlyContractActive);
    setEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !gstin || !contactPerson) return;
    const newBiz: BusinessProfile = {
      id: `biz_${Date.now()}`,
      companyName,
      gstin,
      contactPerson,
      phone,
      email,
      industryCategory,
      facilityAddress: {
        id: `addr_biz_${Date.now()}`,
        title: 'Facility Hub',
        street,
        area,
        city,
        pincode,
        lat: 12.9716,
        lng: 77.6412,
        isDefault: true,
      },
      tonnageCollected: Number(tonnageCollected),
      co2OffsetTonnes: Number(co2OffsetTonnes),
      eprCertificatesCount: Number(eprCertificatesCount),
      monthlyContractActive,
    };
    if (onCreateBusiness) {
      onCreateBusiness(newBiz);
    }
    setAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBiz || !companyName) return;
    if (onUpdateBusiness) {
      onUpdateBusiness(selectedBiz.id, {
        companyName,
        gstin,
        contactPerson,
        phone,
        email,
        industryCategory,
        tonnageCollected: Number(tonnageCollected),
        co2OffsetTonnes: Number(co2OffsetTonnes),
        eprCertificatesCount: Number(eprCertificatesCount),
        monthlyContractActive,
        facilityAddress: {
          ...selectedBiz.facilityAddress,
          street,
          area,
          city,
          pincode,
        },
      });
    }
    setEditModalOpen(false);
    setSelectedBiz(null);
  };

  const handleConfirmDelete = (id: string) => {
    if (onDeleteBusiness) {
      onDeleteBusiness(id);
    }
    setDeleteConfirmId(null);
  };

  const totalTonnage = businesses.reduce((sum, b) => sum + (b.tonnageCollected || 0), 0);
  const totalCo2 = businesses.reduce((sum, b) => sum + (b.co2OffsetTonnes || 0), 0);
  const totalEpr = businesses.reduce((sum, b) => sum + (b.eprCertificatesCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-blue-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-500/30 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              B2B Corporate & Industrial Accounts
            </span>
            <span className="text-xs text-slate-400 font-semibold">• EPR Compliance & Commercial Logistics</span>
          </div>
          <h2 className="text-2xl font-black font-display text-white">
            Corporate Business Partners
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Manage factory scrap pickup contracts, IT park e-waste disposal, EPR compliance certificates, and corporate tonnage statistics.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Corporate Client</span>
        </button>
      </div>

      {/* Aggregate KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Partners</span>
          <span className="text-2xl font-black text-slate-900 font-display mt-0.5 block">{businesses.length}</span>
          <span className="text-[10px] text-blue-600 font-bold">Industrial facilities</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Scrap Diverted</span>
          <span className="text-2xl font-black text-emerald-700 font-display mt-0.5 block">{totalTonnage.toFixed(1)} Tons</span>
          <span className="text-[10px] text-emerald-600 font-bold">Commercial scrap</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">CO₂ Prevented</span>
          <span className="text-2xl font-black text-teal-700 font-display mt-0.5 block">{totalCo2.toFixed(1)} MT</span>
          <span className="text-[10px] text-teal-600 font-bold">Carbon offset score</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">EPR Certificates</span>
          <span className="text-2xl font-black text-amber-600 font-display mt-0.5 block">{totalEpr}</span>
          <span className="text-[10px] text-amber-600 font-bold">CPCB compliant</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto w-full sm:w-auto">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind}
              onClick={() => setCategoryFilter(ind)}
              className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                categoryFilter === ind ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search company, GSTIN, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Corporate List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Company Name & GSTIN</th>
                <th className="py-3 px-4">Industry</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Facility Area</th>
                <th className="py-3 px-4">Tonnage</th>
                <th className="py-3 px-4">EPR Certs</th>
                <th className="py-3 px-4">Monthly Contract</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-black text-slate-900 block">{b.companyName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{b.gstin}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                      {b.industryCategory}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="block font-bold text-slate-800">{b.contactPerson}</span>
                      <span className="text-[10px] text-slate-400">{b.phone}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{b.facilityAddress.area}, {b.facilityAddress.city}</td>
                  <td className="py-3.5 px-4 font-black text-emerald-700">{b.tonnageCollected} Tons</td>
                  <td className="py-3.5 px-4 font-bold text-amber-700">{b.eprCertificatesCount} Passed</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        b.monthlyContractActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.monthlyContractActive ? 'Active Retainer' : 'On-Demand'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        title="Edit corporate profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(b.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete corporate client"
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

      {/* =========================================================================
          ADD BUSINESS MODAL
          ========================================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900 font-display">Add Corporate Client</h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Facility Name</label>
                <input
                  type="text"
                  placeholder="e.g. Wipro Eco Tech Campus"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-black"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Industry Category</label>
                  <select
                    value={industryCategory}
                    onChange={(e) => setIndustryCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="IT Park & Tech">IT Park & Tech</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Automobile">Automobile</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Chemical & Plastics">Chemical & Plastics</option>
                    <option value="Warehouse">Warehouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Officer</label>
                  <input
                    type="text"
                    placeholder="e.g. Anand Varma (ESG Head)"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tonnage (T)</label>
                  <input
                    type="number"
                    value={tonnageCollected}
                    onChange={(e) => setTonnageCollected(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CO₂ (MT)</label>
                  <input
                    type="number"
                    value={co2OffsetTonnes}
                    onChange={(e) => setCo2OffsetTonnes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">EPR Certificates</label>
                  <input
                    type="number"
                    value={eprCertificatesCount}
                    onChange={(e) => setEprCertificatesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="monthlyActive"
                  checked={monthlyContractActive}
                  onChange={(e) => setMonthlyContractActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="monthlyActive" className="text-xs font-bold text-slate-700">
                  Active Monthly Retainer Contract
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-md"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT BUSINESS MODAL
          ========================================================================= */}
      {editModalOpen && selectedBiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900 font-display">Edit Corporate Client</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Facility Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-black"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Industry Category</label>
                  <select
                    value={industryCategory}
                    onChange={(e) => setIndustryCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="IT Park & Tech">IT Park & Tech</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Automobile">Automobile</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Chemical & Plastics">Chemical & Plastics</option>
                    <option value="Warehouse">Warehouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Officer</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tonnage (T)</label>
                  <input
                    type="number"
                    value={tonnageCollected}
                    onChange={(e) => setTonnageCollected(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CO₂ (MT)</label>
                  <input
                    type="number"
                    value={co2OffsetTonnes}
                    onChange={(e) => setCo2OffsetTonnes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">EPR Certificates</label>
                  <input
                    type="number"
                    value={eprCertificatesCount}
                    onChange={(e) => setEprCertificatesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="monthlyActiveEdit"
                  checked={monthlyContractActive}
                  onChange={(e) => setMonthlyContractActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="monthlyActiveEdit" className="text-xs font-bold text-slate-700">
                  Active Monthly Retainer Contract
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-md"
                >
                  Update Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRM DELETE BUSINESS MODAL
          ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black font-display text-slate-900">Remove Corporate Client</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove this corporate account?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
