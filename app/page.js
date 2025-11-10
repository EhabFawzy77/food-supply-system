// app/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Package, TrendingUp, Users,
  Shield, CheckCircle, ArrowLeft
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // التحقق من تسجيل الدخول
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        router.push('/dashboard');
      }
    }
  }, [router]);

  const features = [
    {
      icon: ShoppingCart,
      title: 'إدارة المبيعات',
      description: 'نظام مبيعات كامل مع دعم الكاش والآجل'
    },
    {
      icon: Package,
      title: 'إدارة المخزون',
      description: 'تتبع دقيق للمخزون مع تنبيهات ذكية'
    },
    {
      icon: Users,
      title: 'إدارة العملاء',
      description: 'قاعدة بيانات شاملة للعملاء والموردين'
    },
    {
      icon: TrendingUp,
      title: 'تقارير تفصيلية',
      description: 'تحليلات متقدمة لأداء عملك'
    },
    {
      icon: Shield,
      title: 'أمان متقدم',
      description: 'حماية بيانات بأحدث معايير الأمان'
    },
    {
      icon: CheckCircle,
      title: 'سهل الاستخدام',
      description: 'واجهة عربية بسيطة وواضحة'
    }
  ];

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" dir="rtl">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-6">
              نظام إدارة التوريدات الغذائية
            </h1>
            <p className="text-2xl mb-8 text-indigo-200">
              جاري التحميل...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" dir="rtl">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white mb-16">
          <h1 className="text-6xl font-bold mb-6 animate-fade-in">
            نظام إدارة التوريدات الغذائية
          </h1>
          <p className="text-2xl mb-8 text-indigo-200">
            حل متكامل لإدارة شركتك من مبيعات ومخزون وعملاء وتقارير
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-indigo-900 px-12 py-4 rounded-full text-xl font-bold hover:bg-indigo-100 transition transform hover:scale-105 shadow-2xl flex items-center gap-3 mx-auto"
          >
            ابدأ الآن
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition transform hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <feature.icon className="w-16 h-16 text-indigo-300 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-indigo-200">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {[
            { number: '1000+', label: 'شركة تستخدم النظام' },
            { number: '50K+', label: 'فاتورة شهرياً' },
            { number: '99.9%', label: 'نسبة التوفر' },
            { number: '24/7', label: 'دعم فني' }
          ].map((stat, index) => (
            <div key={index} className="text-center text-white">
              <div className="text-5xl font-bold mb-2 text-indigo-300">
                {stat.number}
              </div>
              <div className="text-lg text-indigo-200">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-20 text-white">
          <p className="text-lg mb-4">
            جاهز للبدء؟
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 px-10 py-3 rounded-full text-lg font-bold hover:from-indigo-600 hover:to-purple-700 transition shadow-xl"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
}