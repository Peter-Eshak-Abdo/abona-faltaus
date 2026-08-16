'use client';

import { useLoading } from './loading-context';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
  const { loading } = useLoading();

  return (
    <>
      {loading && <LoadingSpinner />}
      {children}
    </>
  );
}

