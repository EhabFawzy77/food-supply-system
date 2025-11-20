'use client';
import { useState, useEffect } from 'react';
import {
  Warehouse, AlertTriangle, TrendingDown, Search,
  Package, FileText, Download
} from 'lucide-react';
import { exportUtils } from '../../../lib/utils/export';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    expiringSoon: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/inventory');
        const data = await res.json();
        if (data.success) {
          const normalized = (data.data || []).map((item) => {
            const stockItems = item.stockItems || [];
            const expiryDates = stockItems
              .map((stock) => (stock.expiryDate ? new Date(stock.expiryDate) : null))
              .filter(Boolean);
            const earliestExpiry = expiryDates.length
              ? new Date(Math.min(...expiryDates.map((date) => date.getTime())))
              : null;
            const locations = Array.from(new Set(stockItems.map((stock) => stock.location).filter(Boolean)));
            const batchNumbers = stockItems.map((stock) => stock.batchNumber).filter(Boolean);
            return {
              ...item,
              expiryDate: earliestExpiry ? earliestExpiry.toISOString() : null,
              locations,
              batchNumbers
            };
          });
          setInventory(normalized);
        } else {
          setInventory([]);
        }
      } catch (error) {
        console.error('خطأ في جلب المخزون:', error);
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  useEffect(() => {
    const totalItems = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const lowStock = inventory.filter((item) => {
      if (item.status === 'low') {
        return true;
      }
      const quantity = item.quantity || 0;
      const minStock = item.minStockLevel || 0;
      return quantity <= minStock;
    }).length;
    const expiringSoon = inventory.filter((item) => {
      if (item.status === 'expiring') {
        return true;
      }
      const days = getDaysUntilExpiry(item.expiryDate);
      return Number.isFinite(days) && days <= 30;
    }).length;
    const totalValue = inventory.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.product?.purchasePrice || 0),
      0
    );
    setStats({ totalItems, lowStock, expiringSoon, totalValue });
  }, [inventory]);

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) {
      return Number.POSITIVE_INFINITY;
    }
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (item) => {
    const quantity = item.quantity || 0;
    const minStockLevel = item.minStockLevel || 0;

    if (item.status === 'low' || quantity <= minStockLevel) {
      return (
        <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 rounded-full text-xs font-semibold border border-red-200">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          مخزون منخفض
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        جيد
      </div>
    );
  };

  const filteredInventory = inventory.filter((item) => {
    const name = item.product?.name?.toLowerCase?.() || '';
    const category = item.product?.category?.toLowerCase?.() || '';
    const searchValue = searchTerm.toLowerCase();
    const matchesSearch = name.includes(searchValue) || category.includes(searchValue);

    if (filterType === 'all') {
      return matchesSearch;
    }

    if (filterType === 'low') {
      const quantity = item.quantity || 0;
      const minStockLevel = item.minStockLevel || 0;
      return matchesSearch && (item.status === 'low' || quantity <= minStockLevel);
    }

    if (filterType === 'normal') {
      const quantity = item.quantity || 0;
      const minStockLevel = item.minStockLevel || 0;
      const isLow = item.status === 'low' || quantity <= minStockLevel;
      return matchesSearch && !isLow;
    }

    return matchesSearch;
  });

  const handleExport = () => {
    const exportData = filteredInventory.map(item => ({
      'اسم المنتج': item.product?.name || '',
      'الفئة': item.product?.category || '',
      'الكمية': item.quantity || 0,
      'الحد الأدنى': item.minStockLevel || 0,
      'القيمة': (item.quantity || 0) * (item.product?.purchasePrice || 0),
      'الموقع': item.locations?.join(', ') || '',
      'رقم الدفعة': item.batchNumbers?.join(', ') || '',
      'تاريخ الانتهاء': item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('ar-EG') : ''
    }));

    exportUtils.toCSV(exportData, 'تقرير-المخزون');
  };

  const StatCard = ({ icon: Icon, label, value, color, sublabel }) => (
    <div className={`bg-white rounded-lg shadow p-2 border-r-4 ${color}`}>
      <div className="flex items-center justify-between mb-1">
        <div className={`p-1 rounded ${color.replace('border', 'bg').replace('600', '100')}`}>
          <Icon className={`w-3 h-3 ${color.replace('border', 'text')}`} />
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-800">{value}</div>
          {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
        </div>
      </div>
      <div className="text-gray-600 font-semibold text-xs">{label}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">جاري تحميل المخزون...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Warehouse className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  إدارة المخزون
                </h1>
                <p className="text-gray-600 mt-2">مراقبة وإدارة مستويات المخزون والمنتجات</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 bg-gray-100 rounded-lg">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="ابحث في المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    filterType === 'all'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  الكل ({inventory.length})
                </button>
                <button
                  onClick={() => setFilterType('low')}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    filterType === 'low'
                      ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  منخفض ({stats.lowStock})
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalItems.toLocaleString()}</div>
                <div className="text-xs text-gray-500">قطعة</div>
              </div>
            </div>
            <div className="text-gray-600 font-semibold text-sm">إجمالي المنتجات</div>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-3 opacity-20"></div>
          </div>

          <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.lowStock}</div>
                <div className="text-xs text-gray-500">منخفض</div>
              </div>
            </div>
            <div className="text-gray-600 font-semibold text-sm">مخزون منخفض</div>
            <div className="w-full h-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-full mt-3 opacity-20"></div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalValue.toLocaleString()}</div>
                <div className="text-xs text-gray-500">جنيه</div>
              </div>
            </div>
            <div className="text-gray-600 font-semibold text-sm">قيمة المخزون</div>
            <div className="w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mt-3 opacity-20"></div>
          </div>

        </div>

        {/* Inventory Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInventory.map((item) => {
            const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
            const itemValue = (item.quantity || 0) * (item.product?.purchasePrice || 0);
            const quantity = item.quantity || 0;
            const minStockLevel = item.minStockLevel || 0;
            const batchNumbers = item.batchNumbers?.length ? item.batchNumbers.join(', ') : '-';
            const locations = item.locations?.length ? item.locations.join(', ') : '-';
            const productName = item.product?.name || '-';
            const productCategory = item.product?.category || '-';
            const productUnit = item.product?.unit || '';
            const formattedQuantity = Number(quantity).toLocaleString();
            const isLowStock = quantity <= minStockLevel;

            return (
              <div key={item._id} className={`group bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 p-6 hover:-translate-y-2 ${
                isLowStock ? 'ring-2 ring-red-200' : ''
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        isLowStock
                          ? 'bg-gradient-to-br from-red-500 to-rose-600'
                          : 'bg-gradient-to-br from-green-500 to-emerald-600'
                      }`}>
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-900 transition-colors">{productName}</h3>
                        <p className="text-sm text-gray-600">{productCategory} • {productUnit}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(item)}
                    {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                        {daysUntilExpiry} يوم
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50/50 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 font-medium">الكمية المتاحة</span>
                      <span className={`font-bold text-lg ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {formattedQuantity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isLowStock ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'
                        }`}
                        style={{ width: `${Math.min((quantity / (minStockLevel * 2)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">الحد الأدنى: {minStockLevel}</span>
                      <span className={`text-xs font-semibold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                        {isLowStock ? 'منخفض' : 'جيد'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3">
                      <div className="text-xs text-gray-600 font-medium mb-1">القيمة</div>
                      <div className="font-bold text-green-600 text-sm">{itemValue.toLocaleString()} ج</div>
                    </div>

                    {batchNumbers !== '-' && (
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3">
                        <div className="text-xs text-gray-600 font-medium mb-1">رقم الدفعة</div>
                        <div className="font-mono text-xs text-gray-700 truncate">{batchNumbers}</div>
                      </div>
                    )}
                  </div>

                  {locations !== '-' && (
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3">
                      <div className="text-xs text-gray-600 font-medium mb-1">الموقع</div>
                      <div className="text-sm text-gray-700">{locations}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredInventory.length === 0 && (
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6 inline-block">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">لا توجد منتجات</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
              لم يتم العثور على منتجات تطابق معايير البحث الحالية. جرب تغيير كلمات البحث أو إزالة الفلاتر.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}