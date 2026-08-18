const ROLES = {
  STUDENT: 'student',
  PARENT: 'parent',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  CUSTOMER: 'customer', // preserved for backward-compatibility with current mobile app payload
};

const DEFAULT_ROLE = ROLES.STUDENT;

module.exports = {
  ROLES,
  DEFAULT_ROLE,
};
