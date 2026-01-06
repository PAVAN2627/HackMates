// Performance monitoring utilities

export const performanceMonitor = {
  // Track operation timing
  time: (label: string) => {
    const start = performance.now();
    return {
      end: () => {
        const duration = performance.now() - start;
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  },

  // Track Firebase operations
  trackFirebaseOperation: async <T>(
    operation: () => Promise<T>,
    operationName: string,
    timeout = 10000
  ): Promise<T> => {
    const timer = performanceMonitor.time(`Firebase: ${operationName}`);
    
    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`${operationName} timeout`)), timeout)
        )
      ]);
      
      timer.end();
      return result;
    } catch (error) {
      timer.end();
      console.error(`❌ Firebase ${operationName} failed:`, error);
      throw error;
    }
  },

  // Log performance metrics
  logMetrics: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      console.log('📊 Performance Metrics:', {
        'DOM Content Loaded': `${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`,
        'Page Load': `${navigation.loadEventEnd - navigation.loadEventStart}ms`,
        'DNS Lookup': `${navigation.domainLookupEnd - navigation.domainLookupStart}ms`,
        'TCP Connection': `${navigation.connectEnd - navigation.connectStart}ms`,
        'Server Response': `${navigation.responseEnd - navigation.responseStart}ms`,
      });
    }
  }
};

// Auto-log metrics after page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => performanceMonitor.logMetrics(), 1000);
  });
}