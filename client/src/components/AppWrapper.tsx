import { useEffect, useRef } from "react";

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const mounted = useRef(false);

  useEffect(() => {
    // Prevent duplicate mounting in development
    if (mounted.current) {
      return;
    }
    mounted.current = true;
  }, []);

  if (!mounted.current) {
    return null;
  }

  return <>{children}</>;
}