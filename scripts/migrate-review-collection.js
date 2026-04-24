const mongoose = require('mongoose');

async function run() {
  const dbUri = process.env.MONGODB_URI || process.env.DB;

  if (!dbUri) {
    throw new Error('Missing MONGODB_URI or DB environment variable.');
  }

  await mongoose.connect(dbUri);
  const db = mongoose.connection.db;

  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  const hasReviewUpper = collections.some((c) => c.name === 'Review');
  const hasReviewLowerSingular = collections.some((c) => c.name === 'review');
  const hasTarget = collections.some((c) => c.name === 'reviews');

  if (!hasReviewUpper && !hasReviewLowerSingular) {
    console.log('No Review/review legacy collections found. Nothing to migrate.');
    return;
  }

  if (!hasTarget) {
    await db.createCollection('reviews');
  }

  if (hasReviewUpper) {
    await db.collection('Review').aggregate([
      { $match: {} },
      {
        $merge: {
          into: 'reviews',
          on: '_id',
          whenMatched: 'keepExisting',
          whenNotMatched: 'insert'
        }
      }
    ]).toArray();
  }

  if (hasReviewLowerSingular) {
    await db.collection('review').aggregate([
      { $match: {} },
      {
        $merge: {
          into: 'reviews',
          on: '_id',
          whenMatched: 'keepExisting',
          whenNotMatched: 'insert'
        }
      }
    ]).toArray();
  }

  const sourceUpperCount = hasReviewUpper ? await db.collection('Review').countDocuments() : 0;
  const sourceLowerSingularCount = hasReviewLowerSingular ? await db.collection('review').countDocuments() : 0;
  const targetCount = await db.collection('reviews').countDocuments();

  console.log(`Review count: ${sourceUpperCount}`);
  console.log(`review count: ${sourceLowerSingularCount}`);
  console.log(`reviews count: ${targetCount}`);

  if (String(process.env.DROP_OLD_REVIEW_COLLECTION).toLowerCase() === 'true') {
    if (hasReviewUpper) {
      await db.collection('Review').drop();
      console.log('Dropped old Review collection.');
    }
    if (hasReviewLowerSingular) {
      await db.collection('review').drop();
      console.log('Dropped old review collection.');
    }
  } else {
    console.log('Legacy Review/review collections not dropped. Set DROP_OLD_REVIEW_COLLECTION=true to drop after verification.');
  }
}

run()
  .catch((err) => {
    console.error('Migration failed:', err.message || err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });