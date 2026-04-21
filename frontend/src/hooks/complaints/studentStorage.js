const STUDENT_ID_STORAGE_KEY = 'uninest_complaints_student_id';

export const getStoredStudentId = () => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(STUDENT_ID_STORAGE_KEY) || '';
};

export const saveStudentId = (studentId) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STUDENT_ID_STORAGE_KEY, studentId);
};
