import { useState, useRef, useEffect } from 'react';
import { Edit, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MessageContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (newContent: string) => void;
  onDelete: () => void;
  messageContent: string;
  position: { x: number; y: number };
  isOwnMessage: boolean;
}

export function MessageContextMenu({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  messageContent,
  position,
  isOwnMessage
}: MessageContextMenuProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(messageContent);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isEditing) {
          setIsEditing(false);
          setEditContent(messageContent);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isEditing, messageContent, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageContent);
      toast.success('Message copied to clipboard');
      onClose();
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent.trim() !== messageContent) {
      onEdit(editContent.trim());
      setIsEditing(false);
      onClose();
    } else if (editContent.trim() === messageContent) {
      setIsEditing(false);
    } else {
      toast.error('Message cannot be empty');
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(messageContent);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete();
      onClose();
    }
  };

  if (!isOpen) return null;

  // Calculate menu position to keep it within viewport
  const menuStyle = {
    position: 'fixed' as const,
    left: Math.min(position.x, window.innerWidth - 200),
    top: Math.min(position.y, window.innerHeight - 150),
    zIndex: 1000,
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="bg-background border border-border rounded-lg shadow-lg p-2 min-w-[180px] animate-in fade-in-0 zoom-in-95 duration-100"
    >
      {isEditing ? (
        <div className="space-y-2">
          <Input
            ref={inputRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleEditSubmit();
              }
            }}
            className="text-sm"
            placeholder="Edit message..."
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={handleEditSubmit}
              className="flex-1 h-7 text-xs"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditCancel}
              className="flex-1 h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="w-full justify-start h-8 text-xs"
          >
            <Copy className="h-3 w-3 mr-2" />
            Copy
          </Button>
          
          {isOwnMessage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="w-full justify-start h-8 text-xs"
              >
                <Edit className="h-3 w-3 mr-2" />
                Edit
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="w-full justify-start h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}