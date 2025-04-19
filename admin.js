const ADMIN_CREDENTIALS = {
    admin1: "admin1_Webnest",
    admin2: "adminwebnest"
  };
  
  const API_URL = 'https://registraion-site-backend.onrender.com/api/registrations/all';
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const requestUrl = proxyUrl + API_URL;
  
  let isAuthenticated = false;
  let currentAdmin = null;
  
  // Login functionality
  document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const adminId = document.getElementById('adminSelect').value;
    const password = document.getElementById('password').value;
    
    if (ADMIN_CREDENTIALS[adminId] === password) {
      isAuthenticated = true;
      currentAdmin = adminId;
      bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
      fetchData();
    } else {
      alert('Invalid credentials');
    }
  });
  
  // Settings functionality
  document.getElementById('settingsLink').addEventListener('click', (event) => {
    event.preventDefault();
    if (!isAuthenticated) return;
    new bootstrap.Modal(document.getElementById('settingsModal')).show();
  });
  
  // Logout functionality
  document.getElementById('logoutLink').addEventListener('click', (event) => {
    event.preventDefault();
    isAuthenticated = false;
    currentAdmin = null;
    window.location.reload();
  });
  
  // Password change functionality
  document.getElementById('passwordForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const oldPass = document.getElementById('oldPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
  
    if (ADMIN_CREDENTIALS[currentAdmin] !== oldPass) {
      alert('Old password is incorrect!');
      return;
    }
    
    if (newPass !== confirmPass) {
      alert('New passwords do not match!');
      return;
    }
    
    ADMIN_CREDENTIALS[currentAdmin] = newPass;
    alert('Password changed successfully!');
    document.getElementById('passwordForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
  });
  
  // PDF Export functionality
  document.getElementById('exportPdfBtn').addEventListener('click', () => {
    if (!isAuthenticated) return alert('Please login first');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const headers = [
      '#', 'Name', 'Email', 'Phone', 
      'Gender', 'Age', 'Status', 'Registered At', 'Payment'
    ];
    
    const rows = [];
    document.querySelectorAll('#registrationsBody tr').forEach(tr => {
      const row = [];
      tr.querySelectorAll('td').forEach(td => {
        row.push(td.innerText.replace('View', 'Screenshot Available'));
      });
      rows.push(row);
    });
  
    doc.autoTable({
      head: [headers],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save('registrations.pdf');
  });
  
  // Data handling functions
  function updateCounts(data) {
    document.getElementById('totalCount').textContent = data.length;
    document.getElementById('completedCount').textContent = 
      data.filter(item => item.status === 'Completed').length;
    document.getElementById('pendingCount').textContent = 
      data.filter(item => item.status === 'Pending').length;
  }
  
  function renderTable(data) {
    const tbody = document.getElementById('registrationsBody');
    tbody.innerHTML = '';
    
    data.forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = ` 
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.email}</td>
        <td>${item.phone}</td>
        <td>${item.gender}</td>
        <td>${item.age}</td>
        <td><span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span></td>
        <td>${new Date(item.registeredAt).toLocaleString()}</td>
        <td>
          ${item.paymentScreenshot ? 
            `<span class="screenshot-link" onclick="viewScreenshot('https://registraion-site-backend.onrender.com${item.paymentScreenshot}')">
              View
            </span>` : 'N/A'}
        </td>
      `;
      tbody.appendChild(row);
    });
  }
  
  function viewScreenshot(url) {
    const modal = new bootstrap.Modal(document.getElementById('screenshotModal'));
    const screenshotImage = document.getElementById('screenshotImage');
    const downloadLink = document.getElementById('downloadLink');
    
    screenshotImage.src = url;
    downloadLink.href = url;
    modal.show();
  }
  
  // Search functionality
  document.getElementById('searchBtn').addEventListener('click', () => {
    if (!isAuthenticated) return alert('Please login first');
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    fetch(requestUrl)
      .then(response => response.json())
      .then(data => {
        if (data?.success) {
          const filteredData = data.data.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.email.toLowerCase().includes(searchTerm) ||
            item.phone.includes(searchTerm)
          );
          renderTable(filteredData);
        }
      })
      .catch(error => console.error('Error:', error));
  });
  
  // Refresh Button
  document.getElementById('refreshBtn').addEventListener('click', () => {
    if (!isAuthenticated) return alert('Please login first');
    fetchData();
  });
  
  // Fetch Data
  function fetchData() {
    if (!isAuthenticated) return;
    
    fetch(requestUrl)
      .then(response => response.json())
      .then(data => {
        if (data?.success) {
          updateCounts(data.data);
          renderTable(data.data);
        } else {
          throw new Error('Invalid data format');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('registrationsBody').innerHTML = ` 
          <tr><td colspan="9" class="text-center text-danger">Error loading data: ${error.message}</td></tr>
        `;
      });
  }
  
  // Initial setup
  window.onload = () => {
    new bootstrap.Modal(document.getElementById('loginModal')).show();
  };