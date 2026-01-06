import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Wifi, WifiOff, Zap, Database, Clock } from 'lucide-react';

export function PerformanceDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<any>({});
  const { isOnline, connectionSpeed } = useConnectionStatus();

  useEffect(() => {
    // Listen for Ctrl+Shift+P to toggle debug panel
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible);
        if (!isVisible) {
          collectMetrics();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  const collectMetrics = () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;
    
    setMetrics({
      pageLoad: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
      dnsLookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
      serverResponse: Math.round(navigation.responseEnd - navigation.responseStart),
      memoryUsed: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 'N/A',
      memoryLimit: memory ? Math.round(memory.jsHeapSizeLimit / 1024 / 1024) : 'N/A',
      cacheSize: Object.keys(localStorage).filter(key => 
        key.includes('profile_') || key.includes('hackathons_')
      ).length,
    });
  };

  const clearCache = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.includes('profile_') || key.includes('hackathons_')) {
        localStorage.removeItem(key);
      }
    });
    alert('Cache cleared! Refresh the page to see changes.');
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant="outline" className="text-xs opacity-50">
          Ctrl+Shift+P for debug
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Performance Debug</h3>
        <Button size="sm" variant="ghost" onClick={() => setIsVisible(false)}>
          ×
        </Button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-3 w-3 text-green-500" /> : <WifiOff className="h-3 w-3 text-red-500" />}
          <span>Connection: {isOnline ? 'Online' : 'Offline'}</span>
          <Badge variant={connectionSpeed === 'fast' ? 'default' : 'destructive'} className="text-xs">
            {connectionSpeed}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>Page Load: {metrics.pageLoad || 0}ms</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3" />
          <span>DOM Ready: {metrics.domContentLoaded || 0}ms</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Database className="h-3 w-3" />
          <span>Memory: {metrics.memoryUsed}MB / {metrics.memoryLimit}MB</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Cache Items: {metrics.cacheSize || 0}</span>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" onClick={collectMetrics}>
          Refresh
        </Button>
        <Button size="sm" variant="destructive" onClick={clearCache}>
          Clear Cache
        </Button>
      </div>
    </div>
  );
}