import { MapPin, Calendar, Clock, MessageCircle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hackathon } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatTextForDisplay } from '@/lib/textFormatter';

interface HackathonCardProps {
  hackathon: Hackathon;
  onViewDetails?: (id: string) => void;
  onJoin?: (id: string) => void;
  onClose?: (id: string) => void;
  onDelete?: (id: string) => void;
  isCreator?: boolean;
  joined?: boolean;
}

export function HackathonCard({
  hackathon,
  onViewDetails,
  onJoin,
  onClose,
  onDelete,
  isCreator = false,
  joined = false,
}: HackathonCardProps) {
  const statusColor: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-purple-100 text-purple-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
      {hackathon.image && (
        <div className="w-full h-48 bg-muted relative flex-shrink-0">
          <img 
            src={hackathon.image} 
            alt={hackathon.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/hackmatesroundlogo.png'; }}
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-bold shadow-sm ${
              statusColor[hackathon.status] || 'bg-gray-100 text-gray-800'
            }`}>
              {hackathon.status === 'in-progress' ? 'In Progress' : hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
            </span>
          </div>
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-1 text-primary">{hackathon.title}</h3>
          {!hackathon.image && (
            <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium mb-2 ${statusColor[hackathon.status] || 'bg-gray-100 text-gray-800'}`}>
              {hackathon.status === 'in-progress' ? 'In Progress' : hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
            </span>
          )}
          <p className="text-sm text-muted-foreground font-medium">By {hackathon.creatorName}</p>
        </div>

      <div className="text-sm text-muted-foreground mb-4 line-clamp-2 whitespace-pre-wrap">{formatTextForDisplay(hackathon.description)}</div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{hackathon.venue}, {hackathon.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>
            {new Date(`${hackathon.date}T${hackathon.time}`).toLocaleDateString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>
            {new Date(`${hackathon.date}T${hackathon.time}`).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
            {hackathon.mode === 'in-person' ? 'In-Person' : hackathon.mode.charAt(0).toUpperCase() + hackathon.mode.slice(1)}
          </span>
          {hackathon.teamMembers && (
            <span className="text-xs text-muted-foreground">
              {hackathon.teamMembers.length} member{hackathon.teamMembers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Skills Tags */}
      {hackathon.requiredSkills && hackathon.requiredSkills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {hackathon.requiredSkills.map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Count */}
      {hackathon.generalChat && hackathon.generalChat.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
          <MessageCircle className="w-3 h-3" />
          <span>{hackathon.generalChat.length} messages</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => onViewDetails?.(hackathon.id)}
          variant="default"
          size="sm"
          className="flex-1"
        >
          View Details
        </Button>

        {hackathon.status === 'open' && !isCreator && (
          <Button
            onClick={() => onJoin?.(hackathon.id)}
            variant={joined ? "secondary" : "outline"}
            size="sm"
            className="flex-1"
          >
            {joined ? 'Leave' : 'Join'}
          </Button>
        )}

        {hackathon.status !== 'open' && !isCreator && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled
          >
            {hackathon.status === 'in-progress' ? 'In Progress' : hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
          </Button>
        )}

        {isCreator && hackathon.status === 'open' && (
          <>
            <Button
              onClick={() => onClose?.(hackathon.id)}
              variant="outline"
              size="sm"
              className="text-orange-500 hover:bg-orange-50"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onDelete?.(hackathon.id)}
              variant="outline"
              size="sm"
              className="text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
      </div>
    </Card>
  );
}
