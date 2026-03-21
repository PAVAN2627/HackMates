/**
 * One-time script to delete ALL Firestore collections and ALL Auth users.
 * Run with: node scripts/clear-firebase.js
 *
 * Requires a service account key. Download it from:
 * Firebase Console → Project Settings → Service Accounts → Generate new private key
 * Save it as scripts/serviceAccountKey.json
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'hackathon-team-formation',
});

const db = admin.firestore();
const auth = admin.auth();

const COLLECTIONS = [
  'users',
  'hackathons',
  'messages',
  'announcements',
  'directMessages',
  'notifications',
  'offPlatformTeams',
  'teamFeedback',
  'githubVerifications',
];

async function deleteCollection(colName) {
  const snap = await db.collection(colName).get();
  if (snap.empty) {
    console.log(`  ${colName}: empty, skipping`);
    return;
  }
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  console.log(`  ✅ ${colName}: deleted ${snap.size} docs`);
}

async function deleteAllUsers() {
  let pageToken;
  let total = 0;
  do {
    const result = await auth.listUsers(1000, pageToken);
    const uids = result.users.map(u => u.uid);
    if (uids.length > 0) {
      await auth.deleteUsers(uids);
      total += uids.length;
      console.log(`  ✅ Deleted ${uids.length} auth users`);
    }
    pageToken = result.pageToken;
  } while (pageToken);
  console.log(`  Total auth users deleted: ${total}`);
}

async function main() {
  console.log('\n🗑️  Clearing Firestore collections...');
  for (const col of COLLECTIONS) {
    await deleteCollection(col);
  }

  console.log('\n🗑️  Deleting all Auth users...');
  await deleteAllUsers();

  console.log('\n✅ Done! Fresh start ready.\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
