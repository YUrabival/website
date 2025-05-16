"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { api } from "~/utils/api";
import type { Address } from "../../types/index";
import { User, Mail, Phone, MapPin, Lock, Package, Settings, LogOut, Eye, EyeOff } from "lucide-react";

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  items: OrderItem[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [email, setEmail] = useState(session?.user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name ?? '',
    email: session?.user?.email ?? '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Россия'
  });
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notifOrder, setNotifOrder] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: profile, refetch: refetchProfile } = api.user.getProfile.useQuery();
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      setSuccess("Данные успешно сохранены");
      setEdit(false);
      setSaving(false);
    },
    onError: () => {
      setError("Ошибка при сохранении");
      setSaving(false);
    }
  });
  const sendVerification = api.user.sendVerificationEmail.useMutation();
  const verifyEmail = api.user.verifyEmail.useMutation({
    onSuccess: () => {
      setShowVerification(false);
    }
  });

  // Адреса пользователя
  const mainAddress = profile?.addresses?.find((a) => a.isDefault);
  const [street, setStreet] = useState(mainAddress?.street || "");
  const [city, setCity] = useState(mainAddress?.city || "");
  const [postalCode, setPostalCode] = useState(mainAddress?.postalCode || "");
  const [country, setCountry] = useState(mainAddress?.country || "Россия");
  const [state, setState] = useState(mainAddress?.state || "");

  useEffect(() => {
    if (session?.user) {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [session]);

  useEffect(() => {
    if (profile?.emailVerified) {
      setIsEmailVerified(true);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: (profile as any).phone ?? '',
        street: profile.addresses?.[0]?.street ?? '',
        city: profile.addresses?.[0]?.city ?? '',
        state: profile.addresses?.[0]?.state ?? '',
        postalCode: profile.addresses?.[0]?.postalCode ?? '',
        country: profile.addresses?.[0]?.country ?? 'Россия',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            isDefault: true
          }
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Ошибка при обновлении профиля');
      }

      await update();
      setSuccess('Профиль успешно обновлен');
      setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Произошла ошибка. Пожалуйста, попробуйте снова.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 500);
  };

  const handleVerifyEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('handleVerifyEmail called', verificationCode);
    setLoadingVerify(true);
    setVerifyMessage(null);
    try {
      await verifyEmail.mutateAsync(verificationCode);
      await refetchProfile();
      setVerifyMessage('Email успешно подтвержден!');
      setTimeout(() => {
        setShowVerification(false);
        setVerifyMessage(null);
      }, 1200);
      await update();
    } catch (error) {
      setVerifyMessage('Неверный код или ошибка подтверждения');
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      const res = await fetch('/api/user/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!res.ok) {
        throw new Error('Ошибка при отправке кода подтверждения');
      }

      setShowVerification(true);
      setSuccess('Код подтверждения отправлен на вашу почту');
    } catch (error) {
      setError('Не удалось отправить код подтверждения');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Сохраняем профиль
      await updateProfile.mutateAsync({ name, phone });
      // Сохраняем адрес
      const addressPayload = { street, city, postalCode, country, state, isDefault: true };
      if (mainAddress) {
        await fetch("/api/addresses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: mainAddress.id, ...addressPayload }),
        });
      } else {
        await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressPayload),
        });
      }
      setSuccess("Данные успешно сохранены");
      setEdit(false);
    } catch (e) {
      setError("Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Заполните все поля");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Ошибка смены пароля");
      }
      setPasswordSuccess("Пароль успешно изменён");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e: any) {
      setPasswordError(e.message || "Ошибка смены пароля");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setNotifSaved(false);
    // Здесь должен быть вызов API/tRPC для сохранения настроек уведомлений
    setTimeout(() => setNotifSaved(true), 600);
  };

  console.log('session', session);

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#181c23] via-[#232b3b] to-[#181c23] overflow-hidden">
      {/* SVG паттерн/фон */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="700" cy="100" r="80" fill="#2563eb" fillOpacity="0.15" />
        <circle cx="100" cy="500" r="120" fill="#2563eb" fillOpacity="0.10" />
        <rect x="200" y="200" width="400" height="200" rx="100" fill="#2563eb" fillOpacity="0.07" />
      </svg>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Основная карточка профиля */}
          <div className="bg-gray-900/90 rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-800">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 rounded-full bg-gray-800 border-4 border-gray-900 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="pt-16 pb-8 px-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-white">{session.user?.name}</h1>
                  <p className="text-gray-400">{session.user?.email}</p>
                </div>
                <div className="flex gap-2">
                  {session.user?.role?.toUpperCase() === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Админ панель
                    </Link>
                  )}
                  {session.user?.role?.toUpperCase() === 'MANAGER' && (
                    <Link
                      href="/manager"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Панель менеджера
                    </Link>
                  )}
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {isEditing ? 'Сохранить' : 'Редактировать'}
                  </button>
                </div>
              </div>

              {/* Навигация по разделам */}
              <div className="flex space-x-4 mb-8 border-b border-gray-800">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-4 px-2 ${activeTab === 'profile' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                >
                  Профиль
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`pb-4 px-2 ${activeTab === 'orders' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                >
                  Заказы
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`pb-4 px-2 ${activeTab === 'security' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                >
                  Безопасность
                </button>
              </div>

              {/* Содержимое активного раздела */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Имя</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-lg bg-gray-800 text-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full rounded-lg bg-gray-800 text-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            {!isEmailVerified && (
                              <button
                                type="button"
                                onClick={handleSendVerification}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
                              >
                                Подтвердить
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Телефон</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full rounded-lg bg-gray-800 text-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Улица</label>
                          <input
                            type="text"
                            value={formData.street}
                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                            className="w-full rounded-lg bg-gray-800 text-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Город</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full rounded-lg bg-gray-800 text-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Регион/Область</label>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full rounded-lg bg-gray-800 text-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Почтовый индекс</label>
                          <input
                            type="text"
                            value={formData.postalCode}
                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                            className="w-full rounded-lg bg-gray-800 text-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Страна</label>
                          <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            className="w-full rounded-lg bg-gray-800 text-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-4 mt-6">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                        <User className="w-6 h-6 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-400">Имя</p>
                          <p className="text-white">{formData.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                        <Mail className="w-6 h-6 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-400">Email</p>
                          <div className="flex items-center gap-2">
                            <p className="text-white">{formData.email}</p>
                            {profile?.emailVerified ? (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Подтвержден</span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Не подтвержден</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                        <Phone className="w-6 h-6 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-400">Телефон</p>
                          <p className="text-white">{formData.phone || 'Не указан'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                        <MapPin className="w-6 h-6 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-400">Адрес</p>
                          <p className="text-white">
                            {formData.street && formData.city ? 
                              `${formData.street}, ${formData.city}, ${formData.state}, ${formData.postalCode}, ${formData.country}` : 
                              'Не указан'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                        <Settings className="w-6 h-6 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-400">Роль</p>
                          <div className="flex items-center gap-2">
                            <p className="text-white">
                              {session.user?.role?.toUpperCase() === 'ADMIN' ? 'Администратор' :
                               session.user?.role?.toUpperCase() === 'MANAGER' ? 'Менеджер' :
                               'Пользователь'}
                            </p>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              session.user?.role?.toUpperCase() === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' :
                              session.user?.role?.toUpperCase() === 'MANAGER' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {session.user?.role?.toUpperCase() === 'ADMIN' ? 'Админ' :
                               session.user?.role?.toUpperCase() === 'MANAGER' ? 'Менеджер' :
                               'Пользователь'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="p-4 bg-gray-800/50 rounded-lg text-gray-400">У вас пока нет заказов.</div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="p-4 bg-gray-800/50 rounded-lg mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">Заказ #{order.id.slice(-5)}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm ${order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{order.status}</span>
                        </div>
                        <p className="text-gray-400 text-sm">Дата: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-400 text-sm mb-2">Сумма: {order.total.toLocaleString()} ₽</p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="flex-1 text-white">{item.product?.name || 'Товар'}</div>
                              <div className="text-gray-400">x{item.quantity}</div>
                              <div className="text-gray-400">{item.product?.price?.toLocaleString()} ₽</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="flex flex-col gap-8 w-full">
                  {/* Смена пароля */}
                  <form onSubmit={handleChangePassword} className="relative p-6 bg-gradient-to-br from-[#232b3b] to-[#181c23] rounded-2xl shadow-xl w-full border border-[#23272f] animate-fade-in">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Сменить пароль</h3>
                        <p className="text-sm text-gray-400">Рекомендуем использовать сложный пароль</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Старый пароль</label>
                        <div className="relative">
                          <input type={showOld ? "text" : "password"} placeholder="Введите текущий пароль" className="w-full rounded-xl bg-[#23272f] text-white placeholder-gray-400 px-4 py-3 border border-[#23272f] focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-sm pr-12" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400" tabIndex={-1} onClick={() => setShowOld(v => !v)}>{showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                        </div>
                        <span className="text-xs text-gray-500">Введите ваш текущий пароль для подтверждения личности.</span>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Новый пароль</label>
                        <div className="relative">
                          <input type={showNew ? "text" : "password"} placeholder="Придумайте новый пароль" className="w-full rounded-xl bg-[#23272f] text-white placeholder-gray-400 px-4 py-3 border border-[#23272f] focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-sm pr-12" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400" tabIndex={-1} onClick={() => setShowNew(v => !v)}>{showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                        </div>
                        <span className="text-xs text-gray-500">Минимум 8 символов, используйте буквы, цифры и спецсимволы.</span>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Повторите новый пароль</label>
                        <div className="relative">
                          <input type={showConfirm ? "text" : "password"} placeholder="Повторите новый пароль" className="w-full rounded-xl bg-[#23272f] text-white placeholder-gray-400 px-4 py-3 border border-[#23272f] focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-sm pr-12" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}>{showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                        </div>
                        <span className="text-xs text-gray-500">Введите новый пароль ещё раз для проверки.</span>
                      </div>
                    </div>
                    {passwordError && <div className="text-red-500 text-sm mt-2">{passwordError}</div>}
                    {passwordSuccess && <div className="text-green-500 text-sm mt-2">{passwordSuccess}</div>}
                    <div className="flex justify-end mt-4">
                      <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl shadow-md transition-all text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400" disabled={passwordLoading}>{passwordLoading ? 'Сохранение...' : 'Сменить пароль'}</button>
                    </div>
                  </form>
                  {/* Настройки уведомлений */}
                  <form onSubmit={e => { e.preventDefault(); handleSaveNotifications(); }} className="relative p-6 bg-gradient-to-br from-[#232b3b] to-[#181c23] rounded-2xl shadow-xl w-full border border-[#23272f] animate-fade-in">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Настройки уведомлений</h3>
                        <p className="text-sm text-gray-400">Управление email-уведомлениями</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 text-gray-200 cursor-pointer select-none">
                        <input type="checkbox" checked={notifOrder} onChange={e => setNotifOrder(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded focus:ring-2 focus:ring-blue-500 transition-all" />
                        Получать уведомления о заказах
                      </label>
                      <label className="flex items-center gap-3 text-gray-200 cursor-pointer select-none">
                        <input type="checkbox" checked={notifPromo} onChange={e => setNotifPromo(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded focus:ring-2 focus:ring-blue-500 transition-all" />
                        Получать уведомления о скидках и акциях
                      </label>
                    </div>
                    {notifSaved && <div className="text-green-500 text-sm mt-2">Настройки сохранены</div>}
                    <div className="flex justify-end mt-4">
                      <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl shadow-md transition-all text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400">Сохранить</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения email */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Подтверждение email</h3>
            <p className="text-gray-400 mb-4">
              Введите код подтверждения, отправленный на ваш email
            </p>
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <input
                type="text"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                placeholder="Код подтверждения"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {verifyMessage && (
                <div className={verifyMessage.includes('успешно') ? 'text-green-500' : 'text-red-500'}>
                  {verifyMessage}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  disabled={loadingVerify}
                >
                  {loadingVerify ? 'Проверка...' : 'Подтвердить'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowVerification(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 