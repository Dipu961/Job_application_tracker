const form = document.getElementById('jobForm');
const jobList = document.getElementById('jobList');

let editingJobId = null;

async function loadJobs() {
  const res = await fetch('/api/jobs');
  const jobs = await res.json();
  jobList.innerHTML = '';
  jobs.forEach(job => {
    const li = document.createElement('li');
    // ...existing code...
li.innerHTML = `
<div class="job-info">
  <span class="job-company">${job.company}</span>
  <span class="job-position">${job.position}</span>
  <span class="job-status">${job.status}</span>
</div>
<div>
  <button class="edit-btn" data-id="${job.id}" data-tooltip="Edit this job">Edit</button>
  <button class="delete-btn" data-id="${job.id}" data-tooltip="Delete this job">Delete</button>
</div>
`;
// ...existing code...
    li.className = 'job-item';
    jobList.appendChild(li);
  });

  // Attach delete event
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async function() {
      const id = this.getAttribute('data-id');
      await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      loadJobs();
      if (editingJobId === id) {
        form.reset();
        editingJobId = null;
      }
    };
  });

  // Attach edit event
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = function() {
      const id = this.getAttribute('data-id');
      const job = jobs.find(j => j.id == id);
      document.getElementById('company').value = job.company;
      document.getElementById('position').value = job.position;
      document.getElementById('status').value = job.status;
      editingJobId = id;
    };
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const company = document.getElementById('company').value;
  const position = document.getElementById('position').value;
  const status = document.getElementById('status').value;

  if (editingJobId) {
    await fetch(`/api/jobs/${editingJobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, position, status })
    });
    editingJobId = null;
  } else {
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, position, status })
    });
  }

  form.reset();
  loadJobs();
});

loadJobs();