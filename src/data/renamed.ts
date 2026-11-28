/**
 * Lessons that were split in two, and the questions that moved with the second half.
 * Saved progress is upgraded once (useProgress, version 4): a learner who passed or read the original lesson
 * keeps both halves, and a saved mistake follows its question to the new id. scripts/verify.mjs checks both maps.
 */

/** Original lesson id -> the id of its new second half. */
export const SPLIT_LESSONS: Record<string, string> = {
  'ml-06': 'ml-07',
  'ca-02': 'ca-02b',
  'ca-04': 'ca-04b',
  'pr-03': 'pr-03b',
  'la-11': 'la-12',
};

/** Old question id -> new question id. */
export const RENAMED_QUESTIONS: Record<string, string> = {
  'ml-06-4': 'ml-07-3',
  'ml-06-5': 'ml-07-5',
  'ml-06-6': 'ml-07-6',
  'ml-06-x6': 'ml-07-x3',
  'ca-02-3': 'ca-02b-3',
  'ca-02-4': 'ca-02b-4',
  'ca-02-5': 'ca-02b-5',
  'ca-02-6': 'ca-02b-6',
  'ca-02-x4': 'ca-02b-x2',
  'ca-04-5': 'ca-04b-5',
  'ca-04-6': 'ca-04b-6',
  'pr-03-4': 'pr-03b-4',
  'pr-03-5': 'pr-03b-5',
  'pr-03-6': 'pr-03b-6',
  'pr-03-x5': 'pr-03b-x3',
  'pr-03-x6': 'pr-03b-x4',
  'la-11-2': 'la-12-2',
  'la-11-6': 'la-12-6',
  'la-11-x5': 'la-12-x2',
  'la-11-x6': 'la-12-x3',
};
