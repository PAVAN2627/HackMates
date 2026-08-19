import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

export interface ReportProof {
  name: string;
  dataUrl: string;
}

export interface ReportData {
  reportedUserId: string;
  reportedUserName: string;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  description: string;
  proofs: ReportProof[];
  status: 'pending';
  createdAt: Timestamp;
}

export function useReports() {
  const { user } = useAuth();

  const submitReport = async (
    reportedUserId: string,
    reportedUserName: string,
    reason: string,
    description: string,
    proofs: ReportProof[]
  ) => {
    if (!user) throw new Error('Must be logged in to report');

    const reportData: ReportData = {
      reportedUserId,
      reportedUserName,
      reporterName: user.displayName || 'Anonymous',
      reporterEmail: user.email || '',
      reason,
      description,
      proofs,
      status: 'pending',
      createdAt: Timestamp.now(),
    };

    try {
      const docRef = await addDoc(collection(db, 'reports'), reportData);
      return docRef.id;
    } catch (error: any) {
      console.error('Error submitting report:', error);
      throw error;
    }
  };

  return {
    submitReport,
  };
}
