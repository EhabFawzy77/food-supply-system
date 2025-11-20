'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle, Search, X } from 'lucide-react';

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'لتر',
    purchasePrice: '',
    sellingPrice: '',
    minStockLevel: '',
    supplier: '',
    image: null,
    color: '',
    size: '',
    brand: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data || []);
      }
    } catch (error) {
      console.error('خطأ في جلب الموردين:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.purchasePrice || !formData.sellingPrice) {
      return;
    }

    const url = editingProduct
      ? `/api/products/${editingProduct._id}`
      : '/api/products';

    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const formDataToSend = new FormData();

      // إضافة البيانات النصية
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('unit', formData.unit);
      formDataToSend.append('purchasePrice', formData.purchasePrice);
      formDataToSend.append('sellingPrice', formData.sellingPrice);
      formDataToSend.append('minStockLevel', formData.minStockLevel || '');
      formDataToSend.append('supplier', formData.supplier || '');
      formDataToSend.append('color', formData.color || '');
      formDataToSend.append('size', formData.size || '');
      formDataToSend.append('brand', formData.brand || '');

      // إضافة الصورة إذا كانت موجودة
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const res = await fetch(url, {
        method,
        body: formDataToSend
      });

      const data = await res.json();

      if (data.success) {
        fetchProducts();
        resetForm();
        setShowModal(false);
      } else {
        console.error('خطأ في حفظ المنتج:', data.error || 'حدث خطأ');
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
      minStockLevel: product.minStockLevel || '',
      supplier: product.supplier?._id || '',
      image: null,
      color: product.color || '',
      size: product.size || '',
      brand: product.brand || ''
    });
    setImagePreview(product.image || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        fetchProducts();
      } else {
        console.error('خطأ في حذف المنتج:', data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('خطأ في حذف المنتج:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      unit: 'لتر',
      purchasePrice: '',
      sellingPrice: '',
      minStockLevel: '',
      supplier: '',
      image: null,
      color: '',
      size: '',
      brand: ''
    });
    setEditingProduct(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const profitMargin = (purchasePrice, sellingPrice) => {
    if (!purchasePrice || !sellingPrice) return 0;
    return (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/20 p-8 text-center animate-fadeIn">
          <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 relative" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/30 rounded-2xl shadow-2xl border border-white/20 p-6 mb-8 animate-fadeIn">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  إدارة المنتجات
                </h1>
                <p className="text-gray-600 mt-1">إدارة شاملة لمنتجات الشركة</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm"
                />
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                إضافة منتج جديد
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product._id}
              className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/20 p-3 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                  <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-xs font-medium">
                    {product.category}
                  </span>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-gray-600">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm">الوحدة:</span>
                  <span className="font-semibold text-gray-800">{product.unit}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm">سعر الشراء:</span>
                  <span className="font-semibold text-gray-800">{product.purchasePrice.toLocaleString()} جنيه</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm">سعر البيع:</span>
                  <span className="font-semibold text-green-600">{product.sellingPrice.toLocaleString()} جنيه</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm">هامش الربح:</span>
                  <span className="font-semibold text-indigo-600">
                    {profitMargin(product.purchasePrice, product.sellingPrice)}%
                  </span>
                </div>
                {(product.color || product.size || product.brand) && (
                  <div className="py-2 border-b border-gray-100">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {product.color && (
                        <div className="text-center">
                          <span className="text-gray-500">اللون:</span>
                          <div className="font-semibold text-gray-800">{product.color}</div>
                        </div>
                      )}
                      {product.size && (
                        <div className="text-center">
                          <span className="text-gray-500">الحجم:</span>
                          <div className="font-semibold text-gray-800">{product.size}</div>
                        </div>
                      )}
                      {product.brand && (
                        <div className="text-center">
                          <span className="text-gray-500">الماركة:</span>
                          <div className="font-semibold text-gray-800">{product.brand}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {product.supplier && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm">المورد:</span>
                    <span className="font-semibold text-xs text-gray-700">{product.supplier.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm">الحد الأدنى:</span>
                  <span className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    {product.minStockLevel || 0} {product.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/20 p-12 text-center animate-fadeIn">
            <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500">ابدأ بإضافة منتجات جديدة لإدارة مخزونك</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-scaleIn">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2 font-semibold">اسم المنتج *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="أدخل اسم المنتج"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-semibold">التصنيف *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">اختر التصنيف</option>
                      <option value="دهانات داخلية">دهانات داخلية</option>
                      <option value="دهانات خارجية">دهانات خارجية</option>
                      <option value="أدوات الدهان">أدوات الدهان</option>
                      <option value="مواد كيميائية">مواد كيميائية</option>
                      <option value="ورق الصنفرة">ورق الصنفرة</option>
                      <option value="فرش الدهان">فرش الدهان</option>
                      <option value="أسطوانات الرذاذ">أسطوانات الرذاذ</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-semibold">الوحدة</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="كجم">كجم</option>
                      <option value="لتر">لتر</option>
                      <option value="قطعة">قطعة</option>
                      <option value="كرتونة">كرتونة</option>
                      <option value="علبة">علبة</option>
                      <option value="كيس">كيس</option>
                      <option value="لفه">لفه</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 font-semibold">سعر الشراء *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-semibold">سعر البيع *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-semibold">الحد الأدنى للمخزون</label>
                    <input
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-semibold">المورد</label>
                    <select
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">اختر المورد (اختياري)</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 font-semibold">اللون</label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="مثال: أبيض، أزرق"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-semibold">الحجم</label>
                      <input
                        type="text"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="مثال: 1 لتر، 5 كجم"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-semibold">الماركة</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="مثال: جوتن، كيمي"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-semibold">صورة المنتج</label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      {imagePreview && (
                        <div className="flex justify-center">
                          <img
                            src={imagePreview}
                            alt="معاينة الصورة"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-indigo-200 shadow-lg"
                          />
                        </div>
                      )}
                      {editingProduct && editingProduct.image && !imagePreview && (
                        <div className="flex justify-center">
                          <img
                            src={editingProduct.image}
                            alt="الصورة الحالية"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-indigo-200 shadow-lg"
                            onError={(e) => {
                              e.target.src = '/images/product-placeholder.png';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                    >
                      {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}