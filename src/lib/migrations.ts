/**
 * Migration utilities for adding new features to existing users
 */

import { collection, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';

/**
 * Add default work style to existing users who don't have it
 * Run this once after deploying the work style feature
 */
export async function migrateWorkStyles() {
  console.log('Starting work style migration...');
  
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const snapshot = await getDocs(usersRef);
    
    let updated = 0;
    let skipped = 0;
    
    const batch = writeBatch(db);
    
    for (const userDoc of snapshot.docs) {
      const data = userDoc.data();
      
      // Skip if user already has work style
      if (data.workStyle) {
        skipped++;
        continue;
      }
      
      // Add default work style based on experience level
      const defaultWorkStyle = {
        goal: data.experience === 'Advanced' ? 'win' : 'learn',
        timePreference: 'flexible' as const,
        commitment: data.experience === 'Beginner' ? 'casual' : 'part-time' as const,
        hoursAvailable: data.experience === 'Advanced' ? 30 : 
                       data.experience === 'Intermediate' ? 20 : 10
      };
      
      batch.update(doc(db, COLLECTIONS.USERS, userDoc.id), {
        workStyle: defaultWorkStyle,
        reliabilityScore: 0,
        reliabilityLevel: 'newbie',
        projectsCompleted: 0
      });
      
      updated++;
    }
    
    await batch.commit();
    
    console.log(`Migration complete! Updated: ${updated}, Skipped: ${skipped}`);
    return { updated, skipped };
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Initialize reliability scores for existing users
 * This gives active users a head start
 */
export async function initializeReliabilityScores() {
  console.log('Initializing reliability scores...');
  
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const snapshot = await getDocs(usersRef);
    
    let updated = 0;
    const batch = writeBatch(db);
    
    for (const userDoc of snapshot.docs) {
      const data = userDoc.data();
      
      // Skip if already has reliability data
      if (data.reliabilityScore !== undefined) {
        continue;
      }
      
      // Give a small boost to users who have been active
      // (You can customize this logic based on your data)
      const hasProfile = data.bio && data.skills?.length > 0;
      const initialScore = hasProfile ? 50 : 0; // Active users start at 50
      const initialLevel = hasProfile ? 'reliable' : 'newbie';
      
      batch.update(doc(db, COLLECTIONS.USERS, userDoc.id), {
        reliabilityScore: initialScore,
        reliabilityLevel: initialLevel,
        projectsCompleted: 0
      });
      
      updated++;
    }
    
    await batch.commit();
    
    console.log(`Initialized reliability scores for ${updated} users`);
    return { updated };
  } catch (error) {
    console.error('Initialization failed:', error);
    throw error;
  }
}

/**
 * Clean up incomplete profiles
 * Remove users who never completed registration
 */
export async function cleanupIncompleteProfiles() {
  console.log('Cleaning up incomplete profiles...');
  
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const snapshot = await getDocs(usersRef);
    
    let deleted = 0;
    const batch = writeBatch(db);
    
    for (const userDoc of snapshot.docs) {
      const data = userDoc.data();
      
      // Delete if missing critical fields
      const isIncomplete = !data.name || !data.email || !data.college;
      
      if (isIncomplete) {
        batch.delete(doc(db, COLLECTIONS.USERS, userDoc.id));
        deleted++;
      }
    }
    
    await batch.commit();
    
    console.log(`Deleted ${deleted} incomplete profiles`);
    return { deleted };
  } catch (error) {
    console.error('Cleanup failed:', error);
    throw error;
  }
}

/**
 * Recalculate all reliability badges from feedback
 * Run this if you change the badge calculation algorithm
 */
export async function recalculateReliabilityBadges() {
  console.log('Recalculating reliability badges...');
  
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const feedbacksRef = collection(db, 'teamFeedbacks');
    
    const usersSnapshot = await getDocs(usersRef);
    const feedbacksSnapshot = await getDocs(feedbacksRef);
    
    // Group feedbacks by user
    const feedbacksByUser = new Map<string, any[]>();
    
    for (const feedbackDoc of feedbacksSnapshot.docs) {
      const feedback = feedbackDoc.data();
      const userId = feedback.toUserId;
      
      if (!feedbacksByUser.has(userId)) {
        feedbacksByUser.set(userId, []);
      }
      
      feedbacksByUser.get(userId)!.push(feedback);
    }
    
    // Update each user's badge
    let updated = 0;
    const batch = writeBatch(db);
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const feedbacks = feedbacksByUser.get(userId) || [];
      
      // Calculate badge (you'll need to import the calculation function)
      const projectsCompleted = feedbacks.filter(f => f.didContribute).length;
      const totalProjects = feedbacks.length;
      const completionRate = totalProjects > 0 ? (projectsCompleted / totalProjects) * 100 : 0;
      
      const ratings = feedbacks.filter(f => f.didContribute).map(f => f.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length 
        : 0;
      
      const score = Math.round(
        (completionRate * 0.7) + 
        ((averageRating / 5) * 100 * 0.3)
      );
      
      let level: 'newbie' | 'reliable' | 'finisher' | 'legend' = 'newbie';
      if (score >= 95 && projectsCompleted >= 10) level = 'legend';
      else if (score >= 80 && projectsCompleted >= 3) level = 'finisher';
      else if (score >= 60 && projectsCompleted >= 1) level = 'reliable';
      
      batch.update(doc(db, COLLECTIONS.USERS, userId), {
        reliabilityScore: score,
        reliabilityLevel: level,
        projectsCompleted
      });
      
      updated++;
    }
    
    await batch.commit();
    
    console.log(`Recalculated badges for ${updated} users`);
    return { updated };
  } catch (error) {
    console.error('Recalculation failed:', error);
    throw error;
  }
}

/**
 * Run all migrations in sequence
 * Use this for initial setup
 */
export async function runAllMigrations() {
  console.log('Running all migrations...');
  
  try {
    const results = {
      workStyles: await migrateWorkStyles(),
      reliability: await initializeReliabilityScores(),
      cleanup: await cleanupIncompleteProfiles()
    };
    
    console.log('All migrations complete!', results);
    return results;
  } catch (error) {
    console.error('Migration suite failed:', error);
    throw error;
  }
}
