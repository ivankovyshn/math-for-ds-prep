/**
 * School-maths prerequisites: lessons that lean on a School Maths Toolkit (Module 0) lesson.
 * The lecture shows them as links at the top, so a learner who has forgotten the basics
 * can refresh them first. scripts/verify.mjs checks that every id exists.
 */
export const PREREQS: Record<string, string[]> = {
  'ml-03': ['sm-01'],
  'ml-04': ['sm-01'],
  'ml-06': ['sm-02', 'sm-05'],
  'la-01': ['sm-05'],
  'la-02': ['sm-03'],
  'la-03': ['sm-05'],
  'la-04': ['sm-02'],
  'la-05': ['sm-01'],
  'la-07': ['sm-02'],
  'la-10': ['sm-02'],
  'ca-01': ['sm-01', 'sm-05'],
  'ca-02': ['sm-04', 'sm-05'],
  'ca-03': ['sm-04'],
  'ca-04': ['sm-04', 'sm-05'],
  'ca-05': ['sm-03'],
  'pr-03': ['sm-04'],
  'st-02': ['sm-04'],
  'st-05': ['sm-03'],
  'op-02': ['sm-02'],
  'op-04': ['sm-03'],
  'op-05': ['sm-02', 'sm-03'],
};
