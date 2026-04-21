const USER_STORAGE_KEY = 'user';

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

const buildFullName = (user) => {
  const explicitName = normalizeText(user?.name || user?.studentName);
  if (explicitName) return explicitName;

  return [normalizeText(user?.firstName), normalizeText(user?.lastName)].filter(Boolean).join(' ');
};

export const getStoredStudentIdentity = () => {
  const user = getStoredUser();

  return {
    studentId: normalizeText(user?.registrationNumber || user?.studentId || user?.student?.registrationNumber),
    studentName: buildFullName(user),
    roomNumber: normalizeText(user?.roomNumber || user?.room || user?.roomId?.roomNumber || user?.allocation?.roomId?.roomNumber),
  };
};
