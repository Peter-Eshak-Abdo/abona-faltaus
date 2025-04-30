'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1500); // المدة اللي يظهر فيها اللودر

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {loading && <LoadingSpinner />}
      {children}
    </>
  );
}
