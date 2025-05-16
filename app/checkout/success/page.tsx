"use client";

import { Button } from "~/components/ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="dark:bg-gray-900 bg-white min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="dark:bg-gray-800 bg-white rounded-2xl shadow-lg border dark:border-gray-700 border-gray-100 p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold dark:text-white text-gray-900 mb-4">
            Спасибо за заказ!
          </h1>
          <p className="dark:text-gray-400 text-gray-500 mb-8">
            Мы свяжемся с вами для подтверждения заказа.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">На главную</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/catalog">Продолжить покупки</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 