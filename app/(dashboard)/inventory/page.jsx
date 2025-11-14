'use client';
import { useState, useEffect } from 'react';
import { 
  Warehouse, AlertTriangle, Clock, TrendingDown, Search, 
  Filter, Package, Calendar, FileText, Download
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

  useEffect(() => {
    // محاكاة بيانات المخزون
    const mockInventory = [
      {
        _id: '1',
        product: { name: 'أرز أبيض', category: 'حبوب', unit: 'كجم', purchasePrice: 20, sellingPrice: 25 },
        quantity: 150,
        minStockLevel: 200,
        batchNumber: 'B2024-001',
        expiryDate: '2024-12-31',
        location: 'رف A-1',
        status: 'low'
      },
      {
        _id: '2',
        product: { name: 'زيت عباد الشمس', category: 'زيوت', unit: 'لتر', purchasePrice: 38, sellingPrice: 45 },
        quantity: 320,
        minStockLevel: 150,
        batchNumber: 'B2024-002',
        expiryDate: '2025-06-30',
        location: 'رف B-2',
        status: 'normal'
      },
      {
        _id: '3',
        product: { name: 'سكر أبيض', category: 'سكريات', unit: 'كجم', purchasePrice: 25, sellingPrice: 30 },
        quantity: 80,
        minStockLevel: 200,
        batchNumber: 'B2024-003',
        expiryDate: '2025-12-31',
        location: 'رف A-3',
        status: 'low'
      },
      {
        _id: '4',
        product: { name: 'عصير برتقال', category: 'مشروبات', unit: 'لتر', purchasePrice: 15, sellingPrice: 20 },
        quantity: 45,
        minStockLevel: 100,
        batchNumber: 'B2024-004',
        expiryDate: '2024-11-20',
        location: 'رف C-1',
        status: 'expiring'
      },
      {
        _id: '5',
        product: { name: 'مكرونة', category: 'معكرونة', unit: 'كجم', purchasePrice: 15, sellingPrice: 18 },
        quantity: 500,
        minStockLevel: 150,
        batchNumber: 'B2024-005',
        expiryDate: '2025-08-15',
        location: 'رف A-2',
        status: 'normal'
      }
    ];

    setInventory(mockInventory);

    // حساب الإحصائيات
    const totalItems = mockInventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStock = mockInventory.filter(item => item.status === 'low').length;
    const expiringSoon = mockInventory.filter(item => item.status === 'expiring').length;
    const totalValue = mockInventory.reduce((sum, item) => 
      sum + (item.quantity * item.product.purchasePrice), 0
    );

    setStats({ totalItems, lowStock, expiringSoon, totalValue });
  }, []);

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (item) => {
    const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
    
    if (item.quantity <= item.minStockLevel) {
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">مخزون منخفض</span>;
    }
    
    if (daysUntilExpiry <= 30) {
      return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">قريب الانتهاء</span>;
    }
    
    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">جيد</span>;
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'low') return matchesSearch && item.status === 'low';
    if (filterType === 'expiring') return matchesSearch && item.status === 'expiring';
    if (filterType === 'normal') return matchesSearch && item.status === 'normal';
    
    return matchesSearch;
  });

  const StatCard = ({ icon: Icon, label, value, color, sublabel }) => (
    <div className={`bg-white rounded-lg shadow-lg p-6 border-r-4 ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${color.replace('border', 'bg').replace('600', '100')}`}>
          <Icon className={`w-6 h-6 ${color.replace('border', 'text')}`} />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
        </div>
      </div>
      <div className="text-gray-600 font-semibold">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Warehouse className="w-8 h-8 text-indigo-600" />
              إدارة المخزون
            </h1>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
              <Download className="w-5 h-5" />
              تصدير تقرير
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
            icon={Clock}
            label="قريب الانتهاء"
            value={stats.expiringSoon}
            color="border-orange-600"
            sublabel="خلال 30 يوم"
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
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
              <button
                onClick={() => setFilterType('expiring')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                  filterType === 'expiring'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                قريب الانتهاء ({stats.expiringSoon})
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المنتج</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الفئة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الكمية</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الحد الأدنى</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">رقم الدفعة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">تاريخ الانتهاء</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الموقع</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">القيمة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                  const itemValue = item.quantity * item.product.purchasePrice;
                  
                  return (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{item.product.name}</div>
                        <div className="text-sm text-gray-500">{item.product.unit}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.product.category}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${
                          item.quantity <= item.minStockLevel ? 'text-red-600' : 'text-gray-800'
                        }`}>
                          {item.quantity.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.minStockLevel}</td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-sm">{item.batchNumber}</td>
                      <td className="px-6 py-4">
                        <div className={`font-semibold ${
                          daysUntilExpiry <= 30 ? 'text-orange-600' : 'text-gray-800'
                        }`}>
                          {new Date(item.expiryDate).toLocaleDateString('ar-EG')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {daysUntilExpiry > 0 ? `${daysUntilExpiry} يوم متبقي` : 'منتهي'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.location}</td>
                      <td className="px-6 py-4 font-semibold text-green-600">
                        {itemValue.toLocaleString()} جنيه
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(item)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Section */}
        {(stats.lowStock > 0 || stats.expiringSoon > 0) && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              تنبيهات المخزون
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.lowStock > 0 && (
                <div className="p-4 bg-red-50 border-r-4 border-red-500 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-red-700">مخزون منخفض</span>
                  </div>
                  <p className="text-sm text-red-600">
                    هناك {stats.lowStock} منتج يحتاج إلى إعادة تعبئة
                  </p>
                </div>
              )}
              {stats.expiringSoon > 0 && (
                <div className="p-4 bg-orange-50 border-r-4 border-orange-500 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="font-bold text-orange-700">قريب الانتهاء</span>
                  </div>
                  <p className="text-sm text-orange-600">
                    هناك {stats.expiringSoon} منتج ينتهي خلال 30 يوم
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}