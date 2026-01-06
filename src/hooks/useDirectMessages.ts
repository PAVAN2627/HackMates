import { useState, useEffect, useCallback } from 'react';
import { db, COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  query,
  where,
  or,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { DirectMessage } from '@/types';

export function useDirectMessages() {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let allMessages: DirectMessage[] = [];
    let sentMessages: DirectMessage[] = [];
    let receivedMessages: DirectMessage[] = [];

    const updateMessages = () => {
      allMessages = [...sentMessages, ...receivedMessages];
      allMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMessages(allMessages);
      setLoading(false);
    };

    // Query for sent messages
    const sentQuery = query(
      collection(db, COLLECTIONS.DIRECT_MESSAGES),
      where('senderId', '==', user.uid)
    );

    // Query for received messages
    const receivedQuery = query(
      collection(db, COLLECTIONS.DIRECT_MESSAGES),
      where('recipientId', '==', user.uid)
    );

    const unsubscribeSent = onSnapshot(sentQuery, (snapshot) => {
      sentMessages = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        sentMessages.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as DirectMessage);
      });
      updateMessages();
    }, (error) => {
      console.error('Error fetching sent messages:', error);
      setLoading(false);
    });

    const unsubscribeReceived = onSnapshot(receivedQuery, (snapshot) => {
      receivedMessages = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        receivedMessages.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as DirectMessage);
      });
      updateMessages();
    }, (error) => {
      console.error('Error fetching received messages:', error);
      setLoading(false);
    });

    return () => {
      unsubscribeSent();
      unsubscribeReceived();
    };
  }, [user]);

  const sendMessage = useCallback(async (recipientId: string, content: string, senderName: string, senderAvatar?: string) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.DIRECT_MESSAGES), {
        senderId: user.uid,
        senderName,
        senderAvatar,
        recipientId,
        content,
        createdAt: Timestamp.now(),
        read: false,
      });

      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send message');
    }
  }, [user]);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      const messageRef = doc(db, COLLECTIONS.DIRECT_MESSAGES, messageId);
      await updateDoc(messageRef, { read: true });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark message as read');
    }
  }, []);

  const getConversation = useCallback((otherUserId: string) => {
    if (!user) return [];
    
    const conversation = messages.filter(m => 
      (m.senderId === user.uid && m.recipientId === otherUserId) ||
      (m.senderId === otherUserId && m.recipientId === user.uid)
    );
    
    // Sort conversation messages by creation time (oldest first for chat display)
    return conversation.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [user, messages]);

  const getConversationList = useCallback(() => {
    if (!user) return [];

    // Get unique sender IDs (conversations)
    const conversations: { [key: string]: DirectMessage } = {};
    
    messages.forEach(msg => {
      const otherUserId = msg.senderId === user.uid ? msg.recipientId : msg.senderId;
      if (!conversations[otherUserId] || conversations[otherUserId].createdAt < msg.createdAt) {
        conversations[otherUserId] = msg;
      }
    });

    return Object.values(conversations).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [user, messages]);

  const getUnreadCount = useCallback((otherUserId: string) => {
    if (!user) return 0;
    
    return messages.filter(m => 
      m.recipientId === user.uid && m.senderId === otherUserId && !m.read
    ).length;
  }, [user, messages]);

  const markConversationAsRead = useCallback(async (otherUserId: string) => {
    if (!user) return;
    
    try {
      const unreadMessages = messages.filter(m => 
        m.recipientId === user.uid && m.senderId === otherUserId && !m.read
      );
      
      // Mark all unread messages from this user as read
      const promises = unreadMessages.map(msg => markAsRead(msg.id));
      await Promise.all(promises);
    } catch (error: any) {
      console.error('Failed to mark conversation as read:', error);
    }
  }, [user, messages, markAsRead]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) throw new Error('Must be logged in');

    try {
      // Check if the message belongs to the current user
      const message = messages.find(m => m.id === messageId);
      if (!message || message.senderId !== user.uid) {
        throw new Error('You can only delete your own messages');
      }

      const messageRef = doc(db, COLLECTIONS.DIRECT_MESSAGES, messageId);
      await deleteDoc(messageRef);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete message');
    }
  }, [user, messages]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user) throw new Error('Must be logged in');

    try {
      // Check if the message belongs to the current user
      const message = messages.find(m => m.id === messageId);
      if (!message || message.senderId !== user.uid) {
        throw new Error('You can only edit your own messages');
      }

      const messageRef = doc(db, COLLECTIONS.DIRECT_MESSAGES, messageId);
      await updateDoc(messageRef, { 
        content: newContent,
        edited: true,
        editedAt: Timestamp.now()
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to edit message');
    }
  }, [user, messages]);

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    markConversationAsRead,
    getConversation,
    getConversationList,
    getUnreadCount,
    deleteMessage,
    editMessage,
  };
}
