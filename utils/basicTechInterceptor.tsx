import React from 'react';

interface BasicTechInterceptorProps {
  children: React.ReactNode;
}

export default function BasicTechInterceptor({ children }: BasicTechInterceptorProps) {
  return <>{children}</>;
}
