"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

// Define a type for notification settings
interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mock notification settings. In a real app, these would be fetched from a backend.
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    { id: 'daily-verse', name: 'Daily Verse', description: 'Receive a daily Bible verse notification.', enabled: true },
    { id: 'mass-reminders', name: 'Mass Reminders', description: 'Get reminders for upcoming masses and services.', enabled: false },
    { id: 'confession-reminders', name: 'Confession Reminders', description: 'Receive reminders for confession appointments.', enabled: true },
    { id: 'new-hymns', name: 'New Hymns & Al7an', description: 'Be notified when new hymns or Al7an are added.', enabled: true },
    { id: 'app-updates', name: 'App Updates', description: 'Get alerts for important app updates and features.', enabled: false }
  ]);

  // useEffect to ensure theme is only rendered client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };

  const handleNotificationToggle = (id: string) => {
    setNotificationSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
    // In a real application, you would send an API request here to update the backend.
    // Example: updateNotificationSetting(id, !setting.enabled);
  };

  if (!mounted) {
    return null; // Render nothing on the server to prevent hydration mismatch
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Settings</h1>

      {/* Dark Mode Section */}
      <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Display Settings</h2>
        <div className="flex items-center justify-between">
          <label htmlFor="theme-select" className="block text-lg font-medium text-gray-700 dark:text-gray-300">
            Theme
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={handleThemeChange}
            className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md
                       dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Notifications</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage which notifications you receive.
        </p>
        <ul className="space-y-4">
          {notificationSettings.map((setting) => (
            <li key={setting.id} className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{setting.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
              </div>
              {/* Toggle switch using Tailwind CSS peer utility */}
              <label htmlFor={`toggle-${setting.id}`} className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    id={`toggle-${setting.id}`}
                    className="sr-only peer"
                    checked={setting.enabled}
                    onChange={() => handleNotificationToggle(setting.id)}
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600 dark:peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
