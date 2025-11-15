'use client';
import { useState, useEffect } from 'react';
import {
  Warehouse, AlertTriangle, TrendingDown, Search,
  Package, FileText, Download
} from 'lucide-react';

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
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">مخزون منخفض</span>;
    }

    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">جيد</span>;
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

  const StatCard = ({ icon: Icon, label, value, color, sublabel }) => (
    <div className={`bg-white rounded-lg shadow-lg p-4 border-r-4 ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${color.replace('border', 'bg').replace('600', '100')}`}>
          <Icon className={`w-5 h-5 ${color.replace('border', 'text')}`} />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
        </div>
      </div>
      <div className="text-gray-600 font-semibold">{label}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Warehouse className="w-6 h-6 text-indigo-600" />
              إدارة المخزون
            </h1>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
              <Download className="w-4 h-4" />
              تصدير تقرير
            </button>
          </div>
        </div>


        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <StatCard
            icon={Package}
            label="إجمالي المنتجات"
            value={stats.totalItems.toLocaleString()}
            color="border-blue-600"
            sublabel="قطعة في المخزن"
          />
          <StatCard
            icon={TrendingDown}
            label="مخزون منخفض"
            value={stats.lowStock}
            color="border-red-600"
            sublabel="يحتاج إعادة تعبئة"
          />
          <StatCard
            icon={FileText}
            label="قيمة المخزون"
            value={stats.totalValue.toLocaleString()}
            color="border-green-600"
            sublabel="جنيه مصري"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                  filterType === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل ({inventory.length})
              </button>
              <button
                onClick={() => setFilterType('low')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                  filterType === 'low'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                منخفض ({stats.lowStock})
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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

            return (
              <div key={item._id} className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{productName}</h3>
                    <p className="text-sm text-gray-500 mb-2">{productCategory} • {productUnit}</p>
                  </div>
                  <div className="ml-2">
                    {getStatusBadge(item)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">الكمية:</span>
                    <span className={`font-bold text-lg ${quantity <= minStockLevel ? 'text-red-600' : 'text-gray-800'}`}>
                      {formattedQuantity}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">الحد الأدنى:</span>
                    <span className="font-semibold text-gray-700">{minStockLevel}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">القيمة:</span>
                    <span className="font-bold text-green-600">{itemValue.toLocaleString()} جنيه</span>
                  </div>

                  {batchNumbers !== '-' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">رقم الدفعة:</span>
                      <span className="font-mono text-sm text-gray-700">{batchNumbers}</span>
                    </div>
                  )}

                  {locations !== '-' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">الموقع:</span>
                      <span className="text-sm text-gray-700">{locations}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredInventory.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500">لم يتم العثور على منتجات تطابق معايير البحث</p>
          </div>
        )}

      </div>
    </div>
  );
}