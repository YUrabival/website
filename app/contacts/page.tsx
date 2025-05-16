'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь можно добавить логику отправки формы
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181c23] via-[#232b3b] to-[#181c23] overflow-hidden">
      {/* SVG паттерн/фон */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="700" cy="100" r="80" fill="#2563eb" fillOpacity="0.15" />
        <circle cx="100" cy="500" r="120" fill="#2563eb" fillOpacity="0.10" />
        <rect x="200" y="200" width="400" height="200" rx="100" fill="#2563eb" fillOpacity="0.07" />
      </svg>
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-full bg-gray-900/90 rounded-2xl shadow-2xl p-10 flex flex-col gap-6">
          <h1 className="text-3xl font-extrabold text-white mb-4 text-center">Контакты</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
              <Phone className="text-blue-500 mb-2" size={32} />
              <span className="text-white font-semibold">Телефон</span>
              <span className="text-gray-400 text-sm text-center">+7 (800) 123-45-67</span>
            </div>
            <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
              <Mail className="text-blue-500 mb-2" size={32} />
              <span className="text-white font-semibold">E-mail</span>
              <span className="text-gray-400 text-sm text-center">info@autopartsexpress.ru</span>
            </div>
            <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
              <MapPin className="text-blue-500 mb-2" size={32} />
              <span className="text-white font-semibold">Адрес</span>
              <span className="text-gray-400 text-sm text-center">Москва, ул. Примерная, 1</span>
            </div>
          </div>
          {/* Форма обратной связи */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <input
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              placeholder="Сообщение"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold py-3 rounded-lg shadow-lg mt-2"
            >
              Отправить
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 