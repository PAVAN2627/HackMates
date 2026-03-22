import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MobileDebugInfo() {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 z-50 opacity-50 hover:opacity-100"
      >
        Debug
      </Button>
    );
  }

  const debugInfo = {
    userAgent: navigator.userAgent,
    isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      navigator.userAgent.toLowerCase()
    ),
    isInAppBrowser: /FBAN|FBAV|Instagram|Line|WhatsApp|Snapchat|WeChat|TikTok/i.test(navigator.userAgent),
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    maxTouchPoints: navigator.maxTouchPoints,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    language: navigator.language,
    localStorage: typeof Storage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    redirectFlag: sessionStorage.getItem('googleAuthRedirect'),
    signupMethod: sessionStorage.getItem('signupMethod'),
    pendingSignup: localStorage.getItem('pendingGoogleSignup'),
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm max-h-96 overflow-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          Debug Info
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-1">
        {Object.entries(debugInfo).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-medium">{key}:</span>
            <span className="text-right max-w-32 truncate" title={String(value)}>
              {String(value)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
