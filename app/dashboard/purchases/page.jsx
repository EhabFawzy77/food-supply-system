'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'كجم',
    purchasePrice: '',
    sellingPrice: '',
    minStockLevel: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = editingProduct 
      ? `/api/products/${editingProduct._id}`
      : '/api/products';
    
    const method = editingProduct ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        fetchProducts();
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      console.error('خطأ في حفظ المنتج:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      minStockLevel: product.minStockLevel,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        fetchProducts();
      }
    } catch (error) {
      console.error('خطأ في حذف المنتج:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      unit: 'كجم',
      purchasePrice: '',
      sellingPrice: '',
      minStockLevel: '',
    });
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const profitMargin = (purchasePrice, sellingPrice) => {
    if (!purchasePrice || !sellingPrice) return 0;
    return (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">إدارة المنتجات</h1>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              إضافة منتج جديد
            </button>
          </div>
          
          <input
            type="text"
            placeholder="البحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{product.name}</h3>
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    {product.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>الوحدة:</span>
                  <span className="font-semibold">{product.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>سعر الشراء:</span>
                  <span className="font-semibold">{product.purchasePrice} جنيه</span>
                </div>
                <div className="flex justify-between">
                  <span>سعر البيع:</span>
                  <span className="font-semibold text-green-600">{product.sellingPrice} جنيه</span>
                </div>
                <div className="flex justify-between">
                  <span>هامش الربح:</span>
                  <span className="font-semibold text-indigo-600">
                    {profitMargin(product.purchasePrice, product.sellingPrice)}%
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span>الحد الأدنى:</span>
                  <span className="flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    {product.minStockLevel} {product.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">اسم المنتج</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">التصنيف</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">الوحدة</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="كجم">كجم</option>
                    <option value="لتر">لتر</option>
                    <option value="قطعة">قطعة</option>
                    <option value="كرتونة">كرتونة</option>
                    <option value="علبة">علبة</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">سعر الشراء</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">سعر البيع</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">الحد الأدنى للمخزون</label>
                  <input
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                  >
                    {editingProduct ? 'تحديث' : 'إضافة'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}