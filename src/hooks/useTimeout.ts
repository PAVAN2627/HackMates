import { useEffect, useState } from 'react';

export function useTimeout(delay: number) {
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeout(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isTimeout;
}

export default useTimeout;