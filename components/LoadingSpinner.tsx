'use client';

import EagleLoader from './EagleLoader';

export default function LoadingSpinner() {
  return <EagleLoader statusText="جاري تحميل الصفحة..." fullScreen={true} />;
}

