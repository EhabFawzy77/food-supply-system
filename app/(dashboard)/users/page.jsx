'use client';
import { useState, useEffect } from 'react';
import { 
  Users, Plus, Edit, Trash2, Shield, Lock, Eye, EyeOff,
  CheckCircle, XCircle, Search, X
} from 'lucide-react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'user'
  });

  const roles = [
    { value: 'admin', label: 'مدير عام', color: 'red', permissions: 'كل الصلاحيات' },
    { value: 'manager', label: 'مدير', color: 'blue', permissions: 'كل شيء عدا المستخدمين' },
    { value: 'user', label: 'مستخدم', color: 'green', permissions: 'المبيعات والعملاء' },
    { value: 'guest', label: 'ضيف', color: 'gray', permissions: 'المخزون فقط' }
  ];

  useEffect(() => {
    // محاكاة جلب المستخدمين
    setUsers([
      {
        _id: '1',
        username: 'admin',
        fullName: 'المدير العام',
        email: 'admin@company.com',
        phone: '01012345678',
        role: 'admin',
        isActive: true,
        lastLogin: '2024-11-09T10:30:00',
        createdAt: '2024-01-01'
      },
      {
        _id: '2',
        username: 'manager1',
        fullName: 'أحمد محمود',
        email: 'ahmed@company.com',
        phone: '01123456789',
        role: 'manager',
        isActive: true,
        lastLogin: '2024-11-09T09:15:00',
        createdAt: '2024-02-15'
      },
      {
        _id: '3',
        username: 'user1',
        fullName: 'محمد علي',
        email: 'mohamed@company.com',
        phone: '01234567890',
        role: 'user',
        isActive: true,
        lastLogin: '2024-11-09T08:45:00',
        createdAt: '2024-03-20'
      },
      {
        _id: '4',
        username: 'guest1',
        fullName: 'خالد حسن',
        email: 'khaled@company.com',
        phone: '01098765432',
        role: 'guest',
        isActive: false,
        lastLogin: '2024-11-05T14:20:00',
        createdAt: '2024-04-10'
      }
    ]);
  }, []);

  const handleSubmit = async () => {
    const url = editingUser 
      ? `/api/users/${editingUser._id}`
      : '/api/auth/register';
    
    const method = editingUser ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        resetForm();
        alert(editingUser ? 'تم التحديث بنجاح' : 'تم إضافة المستخدم بنجاح');
      }
    } catch (error) {
      alert('حدث خطأ في حفظ المستخدم');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (res.ok) {
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isActive: !currentStatus } : u
        ));
      }
    } catch (error) {
      alert('حدث خطأ في تغيير حالة المستخدم');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== id));
        alert('تم حذف المستخدم بنجاح');
      }
    } catch (error) {
      alert('حدث خطأ في حذف المستخدم');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'user'
    });
    setEditingUser(null);
    setShowPassword(false);
  };

  const getRoleBadge = (role) => {
    const roleData = roles.find(r => r.value === role);
    if (!roleData) return null;
    
    const colors = {
      red: 'bg-red-100 text-red-700 border-red-300',
      blue: 'bg-blue-100 text-blue-700 border-blue-300',
      green: 'bg-green-100 text-green-700 border-green-300',
      gray: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[roleData.color]}`}>
        {roleData.label}
      </span>
    );
  };

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsers = users.filter(u => u.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header & Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">إدارة المستخدمين</h1>
                <p className="text-gray-600 text-sm">التحكم في حسابات المستخدمين والصلاحيات</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              إضافة مستخدم جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{users.length}</span>
              </div>
              <div className="text-sm font-semibold">إجمالي المستخدمين</div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{activeUsers}</span>
              </div>
              <div className="text-sm font-semibold">مستخدمين نشطين</div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{users.length - activeUsers}</span>
              </div>
              <div className="text-sm font-semibold">معطلين</div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</span>
              </div>
              <div className="text-sm font-semibold">مدراء</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن مستخدم (الاسم، اسم المستخدم، البريد)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المستخدم</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الدور</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">البريد والهاتف</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">آخر تسجيل دخول</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-bold">
                            {user.fullName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{user.fullName}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(user.lastLogin).toLocaleString('ar-EG')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserStatus(user._id, user.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                          user.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        } transition`}
                      >
                        {user.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            نشط
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            معطل
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          disabled={user.role === 'admin'}
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

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">اسم المستخدم</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    disabled={!!editingUser}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    كلمة المرور {editingUser && '(اتركها فارغة إذا لم ترد التغيير)'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      type="button"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">الدور والصلاحيات</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.permissions}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permissions Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  الصلاحيات المتاحة للدور المحدد:
                </h4>
                <div className="text-sm text-blue-700">
                  {roles.find(r => r.value === formData.role)?.permissions}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  {editingUser ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}