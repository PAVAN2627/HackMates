import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

export function GoogleLoginTroubleshooting() {
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const troubleshootingSteps = [
    {
      title: "Check Your Internet Connection",
      description: "Ensure you have a stable internet connection",
      action: "Try loading another website to verify connectivity"
    },
    {
      title: "Allow Pop-ups",
      description: "Enable pop-ups for this website in your browser settings",
      action: "Look for a pop-up blocker icon in your address bar"
    },
    {
      title: "Clear Browser Cache",
      description: "Clear your browser's cache and cookies",
      action: "Go to Settings > Privacy > Clear browsing data"
    },
    {
      title: "Try a Different Browser",
      description: "Switch to Chrome, Firefox, or Safari",
      action: "Download and try signing in with a different browser"
    },
    {
      title: "Disable Ad Blockers",
      description: "Temporarily disable ad blockers or privacy extensions",
      action: "Turn off extensions that might block Google services"
    },
    {
      title: "Use Email Sign-in Instead",
      description: "If Google login continues to fail, use email registration",
      action: "Click 'Sign up with Email' as an alternative"
    }
  ];

  if (!showTroubleshooting) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowTroubleshooting(true)}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        <AlertCircle className="h-3 w-3 mr-1" />
        Having trouble signing in?
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex justify-between items-center">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Troubleshooting Google Sign-In
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTroubleshooting(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {troubleshootingSteps.map((step, index) => (
          <div key={index} className="border-l-2 border-muted pl-3">
            <h4 className="text-sm font-medium">{step.title}</h4>
            <p className="text-xs text-muted-foreground mb-1">{step.description}</p>
            <p className="text-xs text-primary">{step.action}</p>
          </div>
        ))}
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Still having issues? Contact support at{' '}
            <a 
              href="mailto:support@hackmates.com" 
              className="text-primary hover:underline"
            >
              support@hackmates.com
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}