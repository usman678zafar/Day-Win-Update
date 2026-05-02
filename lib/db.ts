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

/** One-time: squad habits + per-member logs indexes and legacy cleanup. */
let habitLogStorageReadyFlag = false;
let habitLogStoragePromise: Promise<void> | undefined;

async function migrateHabitsToSquadTemplates(): Promise<void> {
  const { default: Habit } = await import("@/models/Habit");
  const { default: HabitLog } = await import("@/models/HabitLog");
  const habitColl = Habit.collection;
  const logColl = HabitLog.collection;

  for (const name of ["squad_1_user_1"]) {
    try {
      await habitColl.dropIndex(name);
    } catch {
      /* missing */
    }
  }

  await habitColl.updateMany(
    { createdBy: { $exists: false }, user: { $exists: true } },
    [{ $set: { createdBy: "$user" } }],
  );
  await habitColl.updateMany({}, { $unset: { user: "" } });

  const habits = await Habit.find({}).sort({ _id: 1 }).lean();
  const groups = new Map<string, (typeof habits)[number][]>();
  for (const h of habits) {
    const squadId = String(h.squad);
    const titleKey = String(h.title).trim().toLowerCase();
    const gkey = `${squadId}\0${titleKey}`;
    const arr = groups.get(gkey) ?? [];
    arr.push(h);
    groups.set(gkey, arr);
  }
  for (const arr of groups.values()) {
    if (arr.length <= 1) continue;
    const keeperId = arr[0]!._id;
    const dupIds = arr.slice(1).map((x) => x._id);
    if (dupIds.length === 0) continue;
    await logColl.updateMany(
      { habit: { $in: dupIds } },
      { $set: { habit: keeperId } },
    );
    await Habit.deleteMany({ _id: { $in: dupIds } });
  }
}

async function dedupeHabitLogs(): Promise<void> {
  const { default: HabitLog } = await import("@/models/HabitLog");
  const dupBatches = await HabitLog.collection
    .aggregate([
      {
        $group: {
          _id: { habit: "$habit", user: "$user", dateKey: "$dateKey" },
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();

  for (const row of dupBatches) {
    const ids = row.ids as mongoose.Types.ObjectId[];
    if (!ids || ids.length < 2) continue;
    const [, ...rest] = ids;
    await HabitLog.deleteMany({ _id: { $in: rest } });
  }
}

async function runHabitLogStorageMigration(): Promise<void> {
  if (habitLogStorageReadyFlag) {
    return;
  }
  habitLogStoragePromise ??= (async () => {
    const { default: Habit } = await import("@/models/Habit");
    const { default: HabitLog } = await import("@/models/HabitLog");
    const coll = HabitLog.collection;

    await migrateHabitsToSquadTemplates();

    for (const name of [
      "habitId_1_date_1",
      "habit_1_dateKey_1",
      "habit_1_user_1_dateKey_1",
    ]) {
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
        { user: null },
        { user: { $exists: false } },
        { dateKey: null },
        { dateKey: { $exists: false } },
        { dateKey: "" },
      ],
    });

    await dedupeHabitLogs();
    await HabitLog.syncIndexes();
    await Habit.syncIndexes();
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
