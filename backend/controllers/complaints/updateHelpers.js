const { VALID_PRIORITIES, VALID_STATUSES } = require('./constants');
const { normalizeEnum, normalizeString } = require('./utils');

const buildUpdatePayload = (body) => {
  const updates = {};

  if (body.status !== undefined) {
    const status = normalizeEnum(body.status, VALID_STATUSES);
    if (!status) return { error: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}` };
    updates.status = status;
  }

  if (body.priority !== undefined) {
    const priority = normalizeEnum(body.priority, VALID_PRIORITIES);
    if (!priority) return { error: `Invalid priority. Allowed values: ${VALID_PRIORITIES.join(', ')}` };
    updates.priority = priority;
  }

  if (body.supportNotes !== undefined) updates.supportNotes = normalizeString(body.supportNotes);
  if (body.assignedTo !== undefined) updates.assignedTo = normalizeString(body.assignedTo);

  if (!Object.keys(updates).length) return { error: 'No valid fields provided for update.' };
  return { updates };
};

const applyComplaintUpdates = (complaint, updates) => {
  if (updates.status) {
    complaint.status = updates.status;
    complaint.resolvedAt = updates.status === 'resolved' ? new Date() : null;
  }

  if (updates.priority) complaint.priority = updates.priority;

  if (updates.supportNotes !== undefined) {
    const previousNotes = normalizeString(complaint.supportNotes);
    complaint.supportNotes = updates.supportNotes;
    if (updates.supportNotes && updates.supportNotes !== previousNotes) {
      complaint.chatMessages.push({
        senderRole: 'support',
        senderName: updates.assignedTo || complaint.assignedTo || 'Support Team',
        message: updates.supportNotes,
        sentAt: new Date(),
      });
    }
  }

  if (updates.assignedTo !== undefined) complaint.assignedTo = updates.assignedTo;
};

module.exports = { buildUpdatePayload, applyComplaintUpdates };
