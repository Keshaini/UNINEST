const Notification = require('../../models/Notification');
const Student = require('../../models/Student');
const User = require('../../models/User');
const { getIo } = require('../../socket/socketStore');
const { normalizeString } = require('./utils');

const toTitleCase = (value = '') =>
  normalizeString(value)
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const notificationRoomName = (userId) => `notifications:${userId}`;

const toRealtimeNotification = (notification) => ({
  _id: notification._id,
  userId: notification.userId,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  link: notification.link || '',
  priority: notification.priority || 'medium',
  read: notification.read,
  readAt: notification.readAt || null,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

const emitNotification = (userId, notification) => {
  const io = getIo();
  if (!io || !userId) return;
  io.to(notificationRoomName(userId)).emit('notification:new', toRealtimeNotification(notification));
};

const createNotificationForUser = async ({ userId, type, title, message, link, priority = 'medium' }) => {
  const normalizedUserId = normalizeString(userId);
  if (!normalizedUserId) return null;

  const notification = await Notification.create({
    userId: normalizedUserId,
    type,
    title,
    message,
    link: link || '',
    priority,
  });
  emitNotification(normalizedUserId, notification);
  return notification;
};

const resolveStudentUserId = async (studentRegistrationNumber) => {
  const normalizedRegistration = normalizeString(studentRegistrationNumber);
  if (!normalizedRegistration) return '';

  const student = await Student.findOne({ registrationNumber: normalizedRegistration }).select('userId');
  if (!student?.userId) return '';
  return String(student.userId);
};

const notifyAdminsAboutNewComplaint = async (complaint) => {
  const adminUsers = await User.find({ role: 'Admin', isActive: true }).select('_id');
  if (!adminUsers.length) {
    await createNotificationForUser({
      userId: 'admin',
      type: 'complaint_created',
      title: 'New Support Ticket',
      message: `${complaint.studentName || complaint.studentId} submitted "${complaint.title}".`,
      link: '/admin',
      priority: complaint.priority === 'urgent' || complaint.priority === 'high' ? 'high' : 'medium',
    });
    return;
  }

  await Promise.all(
    adminUsers.map((adminUser) =>
      createNotificationForUser({
        userId: String(adminUser._id),
        type: 'complaint_created',
        title: 'New Support Ticket',
        message: `${complaint.studentName || complaint.studentId} submitted "${complaint.title}".`,
        link: '/admin',
        priority: complaint.priority === 'urgent' || complaint.priority === 'high' ? 'high' : 'medium',
      })
    )
  );
};

const notifyStudentAboutComplaintUpdate = async (complaint, updates = {}) => {
  const studentUserId = await resolveStudentUserId(complaint.studentId);
  if (!studentUserId) return;

  const changes = [];
  if (updates.status) changes.push(`status changed to ${toTitleCase(updates.status)}`);
  if (updates.priority) changes.push(`priority changed to ${toTitleCase(updates.priority)}`);
  if (updates.assignedTo !== undefined && normalizeString(updates.assignedTo)) changes.push(`assigned to ${normalizeString(updates.assignedTo)}`);
  if (updates.supportNotes !== undefined && normalizeString(updates.supportNotes)) changes.push('support note added');

  const message =
    changes.length > 0
      ? `Your ticket "${complaint.title}" was updated: ${changes.join(', ')}.`
      : `Your ticket "${complaint.title}" was updated by support.`;

  await createNotificationForUser({
    userId: studentUserId,
    type: 'complaint_updated',
    title: 'Ticket Updated',
    message,
    link: '/complaints/student/tickets',
    priority: updates.status === 'rejected' ? 'high' : 'medium',
  });
};

const notifyStudentAboutSupportMessage = async (complaint, supportMessage = {}) => {
  const studentUserId = await resolveStudentUserId(complaint.studentId);
  if (!studentUserId) return;

  await createNotificationForUser({
    userId: studentUserId,
    type: 'complaint_chat_message',
    title: 'New Support Message',
    message: `${supportMessage.senderName || 'Support Team'} sent a message on "${complaint.title}".`,
    link: '/complaints/student/tickets',
    priority: 'medium',
  });
};

module.exports = {
  createNotificationForUser,
  notifyAdminsAboutNewComplaint,
  notifyStudentAboutComplaintUpdate,
  notifyStudentAboutSupportMessage,
  notificationRoomName,
};
