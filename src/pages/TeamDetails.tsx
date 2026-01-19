import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Trophy, Lock, FileText, Code, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp, query, where, onSnapshot, deleteDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Hackathon, HackathonTeam } from '@/types';
import { AvatarUpload } from '@/components/AvatarUpload';
import { useProfiles } from '@/hooks/useProfiles';
import { TeamContract } from '@/components/hackathon/TeamContract';
import { MessageContextMenu } from '@/components/MessageContextMenu';

interface TeamDetailsData extends HackathonTeam {
  hackathonId: string;
  hackathonName: string;
}

interface TeamMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
}

export default function TeamDetails() {
  const { hackathonId, teamId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getProfileById } = useProfiles();
  
  const [team, setTeam] = useState<TeamDetailsData | null>(null);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ messageId: string; x: number; y: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileCacheRef = useRef<{ [userId: string]: { avatar: string; name: string; timestamp: number } }>({});
  const [editedProject, setEditedProject] = useState({
    title: '',
    description: '',
    techStack: [] as string[],
  });

  useEffect(() => {
    loadTeamDetails();
  }, [hackathonId, teamId]);

  useEffect(() => {
    if (team) {
      loadMessages();
    }
  }, [team]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTeamDetails = async () => {
    if (!hackathonId || !teamId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const hackathonsRef = collection(db, COLLECTIONS.HACKATHONS);
      const snapshot = await getDocs(hackathonsRef);
      
      let foundHackathon: Hackathon | null = null;
      let foundTeam: TeamDetailsData | null = null;

      snapshot.forEach(doc => {
        if (doc.id === hackathonId) {
          foundHackathon = doc.data() as Hackathon;
          
          if (foundHackathon.teams) {
            const team = foundHackathon.teams.find(t => t.id === teamId);
            if (team) {
              foundTeam = {
                ...team,
                hackathonId: doc.id,
                hackathonName: foundHackathon.title,
              };
            }
          }
        }
      });

      if (foundTeam) {
        setTeam(foundTeam);
        setHackathon(foundHackathon);
        setEditedProject({
          title: foundTeam.projectTitle || '',
          description: foundTeam.projectDescription || '',
          techStack: foundTeam.techStack || [],
        });
      } else {
        toast.error('Team not found');
        navigate('/teams');
      }
    } catch (error) {
      console.error('Error loading team details:', error);
      toast.error('Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!hackathonId || !teamId) return;

    try {
      setLoadingMessages(true);
      const messagesRef = collection(db, `${COLLECTIONS.HACKATHONS}/${hackathonId}/teamChat_${teamId}`);
      
      const unsubscribe = onSnapshot(messagesRef, async (snapshot) => {
        const loadedMessages: TeamMessage[] = [];
        
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          
          // Always fetch avatar from Firestore profile (like general chat does)
          let userAvatar = '';
          let userName = data.userName || 'Unknown User';
          
          if (data.userId) {
            // Check cache first (with TTL)
            const cached = profileCacheRef.current[data.userId];
            const now = Date.now();
            const CACHE_TTL = 60 * 1000; // 1 minute cache
            
            if (cached && cached.timestamp && (now - cached.timestamp) < CACHE_TTL) {
              userAvatar = cached.avatar || '';
              userName = cached.name || userName;
            } else {
              // Fetch from Firestore for fresh data
              try {
                const profileDoc = await getDoc(doc(db, COLLECTIONS.USERS, data.userId));
                if (profileDoc.exists()) {
                  const profileData = profileDoc.data();
                  userAvatar = profileData?.avatar || '';
                  userName = profileData?.name || userName;
                  // Cache with timestamp
                  profileCacheRef.current[data.userId] = {
                    avatar: userAvatar,
                    name: userName,
                    timestamp: now
                  };
                }
              } catch (error) {
                console.warn('Failed to load profile for user:', data.userId, error);
              }
            }
          }
          
          loadedMessages.push({
            id: docSnap.id,
            userId: data.userId,
            userName: userName,
            userAvatar: userAvatar || undefined,
            content: data.content,
            timestamp: data.timestamp?.toDate?.() || new Date(),
          });
        }
        
        // Sort by timestamp ascending
        loadedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        setMessages(loadedMessages);
        setLoadingMessages(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !hackathonId || !teamId) {
      toast.error('Unable to send message');
      return;
    }

    setSendingMessage(true);
    try {
      // Always fetch fresh avatar from Firestore (like general chat does)
      let userAvatar = '';
      let userName = user.displayName || 'Unknown User';
      
      try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data();
          userAvatar = profileData?.avatar || '';
          userName = profileData?.name || userName;
          // Update cache
          const now = Date.now();
          profileCacheRef.current[user.uid] = {
            avatar: userAvatar,
            name: userName,
            timestamp: now
          };
        }
      } catch (error) {
        console.warn('Failed to fetch user profile:', error);
      }
      
      const messagesRef = collection(db, `${COLLECTIONS.HACKATHONS}/${hackathonId}/teamChat_${teamId}`);
      await addDoc(messagesRef, {
        userId: user.uid,
        userName: userName,
        userAvatar: userAvatar,
        content: messageText,
        timestamp: serverTimestamp(),
      });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSaveProject = async () => {
    if (!hackathonId || !teamId || !hackathon) return;

    try {
      const hackathonRef = doc(db, COLLECTIONS.HACKATHONS, hackathonId);
      const updatedTeams = hackathon.teams?.map(t => 
        t.id === teamId 
          ? {
              ...t,
              projectTitle: editedProject.title,
              projectDescription: editedProject.description,
              techStack: editedProject.techStack,
            }
          : t
      );

      await updateDoc(hackathonRef, { teams: updatedTeams });
      setIsEditing(false);
      toast.success('Project details updated!');
      loadTeamDetails();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project details');
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!hackathonId || !teamId) return;

    try {
      const messageRef = doc(db, `${COLLECTIONS.HACKATHONS}/${hackathonId}/teamChat_${teamId}`, messageId);
      await updateDoc(messageRef, {
        content: newContent,
        edited: true,
        editedAt: serverTimestamp(),
      });
      toast.success('Message updated');
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
      throw error;
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!hackathonId || !teamId) return;

    try {
      const messageRef = doc(db, `${COLLECTIONS.HACKATHONS}/${hackathonId}/teamChat_${teamId}`, messageId);
      await deleteDoc(messageRef);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
      throw error;
    }
  };

  const isTeamLeader = team?.leaderId === user?.uid;
  const isTeamMember = team?.memberIds?.includes(user?.uid || '');

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/teams')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Button>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-primary">Loading team details...</div>
        </div>
      </div>
    );
  }

  if (!team || !hackathon) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/teams')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Team not found</h2>
          <p className="text-muted-foreground">The team you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/teams')} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Teams
      </Button>

      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{hackathon.title}</p>
            <h1 className="text-4xl font-bold">{team.name}</h1>
          </div>
          <Badge className="bg-primary">
            {isTeamLeader ? 'Leader' : 'Member'}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {team.memberIds?.length || 0} members • Led by{' '}
          {team.memberIds?.find(id => id === team.leaderId) ? 'You' : 'Team Member'}
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="space-y-6">
        {/* Project Details */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Project</h2>
            </div>
            {isTeamLeader && !isEditing && (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Project Title</label>
                <Input
                  placeholder="Enter project title"
                  value={editedProject.title}
                  onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Description</label>
                <textarea
                  placeholder="Enter project description"
                  value={editedProject.description}
                  onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Tech Stack</label>
                <Input
                  placeholder="e.g., React, Node.js, Firebase (comma separated)"
                  value={editedProject.techStack.join(', ')}
                  onChange={(e) =>
                    setEditedProject({
                      ...editedProject,
                      techStack: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveProject} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {editedProject.title ? (
                <div>
                  <h3 className="font-semibold text-lg mb-2">{editedProject.title}</h3>
                  {editedProject.description && (
                    <p className="text-muted-foreground mb-4">{editedProject.description}</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No project title set yet</p>
              )}

              {editedProject.techStack && editedProject.techStack.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {editedProject.techStack.map(tech => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team Members - Grid Layout 2 per row */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Team Members</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {team.memberIds?.map(memberId => {
              const memberProfile = getProfileById(memberId);
              const isLeader = memberId === team.leaderId;
              const isCurrentUser = memberId === user?.uid;
              const hasCommitted = hackathon?.committedMembers?.includes(memberId) || false;

              return (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                  onClick={() => {
                    if (!isCurrentUser) {
                      navigate(`/profile/${memberId}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 min-w-0">
                    <AvatarUpload
                      currentAvatar={memberProfile?.avatar || null}
                      userName={memberProfile?.name || 'Unknown'}
                      userGender={memberProfile?.gender as any}
                      size="sm"
                      editable={false}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {isCurrentUser ? '👤 Me' : memberProfile?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {memberProfile?.college || 'Unknown College'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    {isLeader && (
                      <Badge className="bg-primary text-xs py-0">Leader</Badge>
                    )}
                    {!isLeader && (
                      <Badge variant="outline" className="text-xs py-0">Member</Badge>
                    )}
                    <Badge variant={hasCommitted ? "default" : "secondary"} className="text-xs py-0">
                      {hasCommitted ? '✓' : '○'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Chat */}
        <div className="glass rounded-xl p-3 h-96 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold">Team Chat</h3>
          </div>

          {/* Messages Container - Fixed Height with Scroll */}
          <div className="flex-1 overflow-y-auto mb-2 space-y-2">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="flex items-center justify-center mx-auto mb-3">
                    <img 
                      src="/assets/roundlogohackmates.png" 
                      alt="Loading" 
                      className="h-8 w-8 rounded-full animate-pulse"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Loading chat...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-6">
                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-2" />
                <p className="text-xs text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isOwnMessage = msg.userId === user?.uid;
                  
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''} group`}>
                      <div className="flex-shrink-0">
                        <AvatarUpload
                          currentAvatar={msg.userAvatar}
                          userName={msg.userName || 'Unknown'}
                          size="sm"
                          editable={false}
                        />
                      </div>
                      <div className={`flex-1 max-w-xs ${isOwnMessage ? 'text-right' : ''}`}>
                        {!isOwnMessage && (
                          <p className="text-xs font-semibold text-foreground mb-1 cursor-pointer hover:text-primary" 
                            onClick={() => navigate(`/profile/${msg.userId}`)}>
                            {msg.userName || 'Unknown User'}
                          </p>
                        )}
                        <div
                          className={`inline-block px-3 py-1 rounded-lg text-xs relative ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({
                              messageId: msg.id,
                              x: e.clientX,
                              y: e.clientY,
                            });
                          }}
                        >
                          <p className="break-words">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Context Menu */}
          {contextMenu && (
            <MessageContextMenu
              isOpen={!!contextMenu}
              onClose={() => setContextMenu(null)}
              onEdit={async (newContent) => {
                await handleEditMessage(contextMenu.messageId, newContent);
              }}
              onDelete={async () => {
                await handleDeleteMessage(contextMenu.messageId);
              }}
              messageContent={messages.find(m => m.id === contextMenu.messageId)?.content || ''}
              position={{ x: contextMenu.x, y: contextMenu.y }}
              isOwnMessage={messages.find(m => m.id === contextMenu.messageId)?.userId === user?.uid || false}
            />
          )}

          {/* Message Input */}
          <div className="flex gap-1 items-center flex-shrink-0">
            <Input
              placeholder="Message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sendingMessage}
              className="flex-1 min-w-0 text-xs h-8"
            />
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage || !messageText.trim()}
              size="sm"
              className="gap-0 px-2 flex-shrink-0 h-8"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Team Contract - Team Locked Status */}
        <TeamContract
          hackathonId={hackathonId || ''}
          teamId={team.id}
          teamMembers={team.memberIds?.map(memberId => {
            const memberProfile = getProfileById(memberId);
            return {
              userId: memberId,
              userName: memberProfile?.name || 'Unknown User',
              userAvatar: memberProfile?.avatar || undefined,
            };
          }) || []}
          committedMembers={team.committedMemberIds || []}
          isLocked={team.isTeamLocked || false}
          teams={hackathon?.teams || []}
          onContractUpdate={() => {
            // Reload hackathon data when contract is updated
            if (hackathonId) {
              loadTeamDetails();
            }
          }}
        />

        {/* Team Status Info */}
        {hackathon.status === 'completed' && (
          <div className="glass rounded-xl p-6 border-2 border-green-500/30 bg-green-500/5">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-6 w-6 text-green-500" />
              <h3 className="text-xl font-bold text-green-700 dark:text-green-400">
                Hackathon Completed! 🎉
              </h3>
            </div>
            <p className="text-green-600 dark:text-green-500">
              Great job on completing this hackathon! Rate your teammates to help them build their reliability score.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
