import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { getComplaintsByStudent } from '../../services/complaintsService';
import { getStoredStudentIdentity } from './studentIdentity';
import { getStoredStudentId, saveStudentId } from './studentStorage';

const getErrorMessage = (error) => error?.response?.data?.message || 'Failed to load student complaints.';
const COMPLAINTS_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/complaints';
const STUDENT_API_BASE_URL = (() => {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const baseUrl = COMPLAINTS_API_BASE_URL.startsWith('http')
      ? COMPLAINTS_API_BASE_URL
      : new URL(COMPLAINTS_API_BASE_URL, origin).toString();
    return new URL('/api/students', baseUrl).toString();
  } catch {
    return 'http://localhost:5000/api/students';
  }
})();

const getFullName = (profile) => [profile?.firstName?.trim(), profile?.lastName?.trim()].filter(Boolean).join(' ');

export const useStudentComplaints = ({ isSupportRoute, setFeedback, setFormData }) => {
  const storedIdentity = getStoredStudentIdentity();
  const [currentStudentId, setCurrentStudentId] = useState(() => getStoredStudentId() || storedIdentity.studentId);
  const [studentIdentity, setStudentIdentity] = useState(() => ({
    studentId: getStoredStudentId() || storedIdentity.studentId,
    studentName: storedIdentity.studentName,
    roomNumber: storedIdentity.roomNumber,
  }));
  const [studentComplaints, setStudentComplaints] = useState([]);
  const [loadingStudentComplaints, setLoadingStudentComplaints] = useState(false);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);

  const loadStudentComplaints = useCallback(
    async (inputStudentId, options = {}) => {
      const { showSuccess = true, showEmptyIdError = true, silentError = false } = options;
      const studentId = (inputStudentId || currentStudentId || '').trim();
      if (!studentId) {
        if (showEmptyIdError) setFeedback({ type: 'error', message: 'Student ID is required.' });
        return;
      }

      setCurrentStudentId(studentId);
      saveStudentId(studentId);
      setFormData((previous) => ({ ...previous, studentId }));
      setLoadingStudentComplaints(true);
      try {
        const response = await getComplaintsByStudent(studentId);
        setStudentComplaints(response.data || []);
        if (showSuccess) {
          setFeedback({ type: 'success', message: `Loaded ${response.count || 0} complaint(s) for ${studentId}.` });
        }
      } catch (error) {
        if (!silentError) setFeedback({ type: 'error', message: getErrorMessage(error) });
      } finally {
        setLoadingStudentComplaints(false);
      }
    },
    [currentStudentId, setFeedback, setFormData]
  );

  useEffect(() => {
    if (isSupportRoute) return;

    const localIdentity = getStoredStudentIdentity();
    const savedStudentId = (getStoredStudentId() || localIdentity.studentId || '').trim();
    const localStudentName = localIdentity.studentName;
    const localRoomNumber = localIdentity.roomNumber;

    if (savedStudentId || localStudentName || localRoomNumber) {
      setStudentIdentity({
        studentId: savedStudentId,
        studentName: localStudentName,
        roomNumber: localRoomNumber,
      });

      if (savedStudentId) {
        setCurrentStudentId(savedStudentId);
        saveStudentId(savedStudentId);
      }

      setFormData((previous) => ({
        ...previous,
        ...(savedStudentId ? { studentId: savedStudentId } : {}),
        ...(localStudentName ? { studentName: localStudentName } : {}),
        ...(localRoomNumber ? { roomNumber: localRoomNumber } : {}),
      }));
    }

    const token = typeof window === 'undefined' ? '' : window.localStorage.getItem('token') || '';
    if (!token) return;

    let isCancelled = false;
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    const syncAuthenticatedStudent = async () => {
      try {
        const [profileResponse, roomResponse] = await Promise.all([
          axios.get(`${STUDENT_API_BASE_URL}/profile`, authConfig).catch(() => ({ data: null })),
          axios.get(`${STUDENT_API_BASE_URL}/room`, authConfig).catch(() => ({ data: null })),
        ]);

        if (isCancelled) return;

        const profile = profileResponse.data;
        const roomAllocation = roomResponse.data;
        const authenticatedIdentity = {
          studentId: (profile?.registrationNumber || savedStudentId || '').trim(),
          studentName: getFullName(profile) || localStudentName,
          roomNumber: roomAllocation?.roomId?.roomNumber || localRoomNumber,
        };

        setStudentIdentity(authenticatedIdentity);

        if (authenticatedIdentity.studentId) {
          setCurrentStudentId(authenticatedIdentity.studentId);
          saveStudentId(authenticatedIdentity.studentId);
        }

        setFormData((previous) => ({
          ...previous,
          ...(authenticatedIdentity.studentId ? { studentId: authenticatedIdentity.studentId } : {}),
          ...(authenticatedIdentity.studentName ? { studentName: authenticatedIdentity.studentName } : {}),
          ...(authenticatedIdentity.roomNumber ? { roomNumber: authenticatedIdentity.roomNumber } : {}),
        }));
      } catch {
        // Keep the stored identity fallback when profile sync fails.
      }
    };

    syncAuthenticatedStudent();

    return () => {
      isCancelled = true;
    };
  }, [isSupportRoute, setFormData]);

  useEffect(() => {
    if (isSupportRoute) return setHasAutoLoaded(false);
    if (hasAutoLoaded) return;
    const savedId = (currentStudentId || getStoredStudentId()).trim();
    if (!savedId) return;
    setHasAutoLoaded(true);
    loadStudentComplaints(savedId, { showSuccess: false, showEmptyIdError: false, silentError: true });
  }, [isSupportRoute, hasAutoLoaded, currentStudentId, loadStudentComplaints]);

  useEffect(() => {
    if (!currentStudentId) return;
    setFormData((previous) => (previous.studentId === currentStudentId ? previous : { ...previous, studentId: currentStudentId }));
  }, [currentStudentId, setFormData]);

  return {
    currentStudentId,
    setCurrentStudentId,
    studentIdentity,
    studentComplaints,
    loadingStudentComplaints,
    loadStudentComplaints,
  };
};
