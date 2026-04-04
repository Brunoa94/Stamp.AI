"use client";

import { X } from "lucide-react";
import { Button } from "@/features/ui/button";

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPopup({ isOpen, onClose }: SettingsPopupProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popup */}
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md z-50 border-2 border-purple-200 dark:border-purple-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="settings-title"
            className="text-2xl font-bold bg-linear-to-r from-slate-700 to-gray-700 dark:from-slate-400 dark:to-gray-400 bg-clip-text text-transparent"
          >
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
            aria-label="Close settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="mb-6">
          <label
            htmlFor="language-select"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            Language
          </label>
          <select
            id="language-select"
            className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="pt">Português</option>
          </select>
        </div>

        {/* Currency Selector */}
        <div className="mb-6">
          <label
            htmlFor="currency-select"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            Currency
          </label>
          <select
            id="currency-select"
            className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            aria-label="Select currency"
          >
            <option value="usd">USD ($)</option>
            <option value="eur">EUR (€)</option>
            <option value="gbp">GBP (£)</option>
            <option value="jpy">JPY (¥)</option>
            <option value="cad">CAD ($)</option>
          </select>
        </div>

        {/* Save Button */}
        <Button className="w-full bg-linear-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105">
          Save Settings
        </Button>
      </div>
    </>
  );
}
