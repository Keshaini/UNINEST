const nav = document.querySelectorAll('.nav-link');
const current = document.body.dataset.page;

nav.forEach((link) => {
  if (link.dataset.page === current) {
    link.classList.add('active');
  }
});

const allocationForm = document.getElementById('allocation-form');
if (allocationForm) {
  allocationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(allocationForm);

    const record = {
      studentId: formData.get('studentId'),
      studentName: formData.get('studentName'),
      roomNumber: formData.get('roomNumber'),
      bed: formData.get('bed'),
      reason: formData.get('reason'),
      allocatedOn: new Date().toISOString(),
    };

    const records = JSON.parse(localStorage.getItem('room-allocations') || '[]');
    records.unshift(record);
    localStorage.setItem('room-allocations', JSON.stringify(records.slice(0, 20)));

    const message = document.getElementById('form-message');
    message.textContent = `Allocation saved for ${record.studentName} in room ${record.roomNumber}.`;
    allocationForm.reset();
  });
}

const activityBody = document.getElementById('recent-allocations');
if (activityBody) {
  const records = JSON.parse(localStorage.getItem('room-allocations') || '[]');

  if (records.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4">No allocations yet. Add one from the Allocation page.</td>';
    activityBody.appendChild(row);
  } else {
    records.slice(0, 8).forEach((record) => {
      const row = document.createElement('tr');
      const date = new Date(record.allocatedOn).toLocaleDateString();
      row.innerHTML = `
        <td>${record.studentName}</td>
        <td>${record.roomNumber} / ${record.bed}</td>
        <td>${record.reason || 'N/A'}</td>
        <td>${date}</td>
      `;
      activityBody.appendChild(row);
    });
  }
}
