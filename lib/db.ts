import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cache;
}

/** One-time fix for legacy / corrupted habitlogs (bad indexes + null keys). */
let habitLogStorageReadyFlag = false;
let habitLogStoragePromise: Promise<void> | undefined;

async function runHabitLogStorageMigration(): Promise<void> {
  if (habitLogStorageReadyFlag) {
    return;
  }
  habitLogStoragePromise ??= (async () => {
    const { default: HabitLog } = await import("@/models/HabitLog");
    const coll = HabitLog.collection;

    for (const name of ["habitId_1_date_1", "habit_1_dateKey_1"]) {
      try {
        await coll.dropIndex(name);
      } catch {
        /* missing */
      }
    }

    await coll.deleteMany({
      $or: [
        { habit: null },
        { habit: { $exists: false } },
        { dateKey: null },
        { dateKey: { $exists: false } },
        { dateKey: "" },
      ],
    });

    await HabitLog.syncIndexes();
    habitLogStorageReadyFlag = true;
    habitLogStoragePromise = undefined;
  })();

  try {
    await habitLogStoragePromise;
  } catch (err) {
    habitLogStoragePromise = undefined;
    habitLogStorageReadyFlag = false;
    throw err;
  }
}

/** Connect only (auth, squads, users). Does not touch habitlogs indexes. */
export default async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }
  if (cache.conn) {
    return cache.conn;
  }
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI);
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

/**
 * Call before any HabitLog read/write. Runs one-time index repair + cleanup of invalid rows.
 * Not invoked from generic connectDB so Google sign-in is not blocked by habitlogs work.
 */
export async function ensureHabitLogStorageReady(): Promise<void> {
  await connectDB();
  await runHabitLogStorageMigration();
}
