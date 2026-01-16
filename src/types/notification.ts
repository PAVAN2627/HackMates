export type NotificationType = 'team_invite' | 'message' | 'announcement';

export interface Notification {
  id: string;
  userId: string; // Who receives the notification
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  // Team invite specific fields
  hackathonId?: string;
  hackathonTitle?: string;
  teamId?: string;
  teamName?: string;
  invitedBy?: string;
  invitedByName?: string;
  // Announcement specific fields
  announcementTitle?: string;
}
