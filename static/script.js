// static/script.js

// ==== Phần 1: Auto-predict cho từng dòng ====

const inputs = document.querySelectorAll('#predictForm input, #predictForm select');
inputs.forEach(input => input.addEventListener('input', autoPredict));

let timeoutId;
function autoPredict() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    const data = {
      creditScore: parseInt(document.getElementById('creditScore').value) || 0,
      geography: document.getElementById('geography').value || 'France',
      gender: document.getElementById('gender').value,
      age: parseInt(document.getElementById('age').value) || 0,
      tenure: parseInt(document.getElementById('tenure').value) || 0,
      balance: parseFloat(document.getElementById('balance').value) || 0,
      numProducts: parseInt(document.getElementById('numProducts').value) || 0,
      creditCard: parseInt(document.getElementById('creditCard').value),
      isActive: parseInt(document.getElementById('isActive').value),
      salary: parseFloat(document.getElementById('salary').value) || 0
    };

    fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(result => {
        document.getElementById('probability').textContent =
          (result.probability * 100).toFixed(2) + '%';
        document.getElementById('conclusion').textContent =
          result.probability > 0.5
            ? 'Khách hàng có thể rời bỏ'
            : 'Khách hàng sẽ ở lại';
      })
      .catch(() => {
        document.getElementById('probability').textContent = '--';
        document.getElementById('conclusion').textContent = 'Không thể dự đoán';
      });
  }, 400);
}

// ==== Phần 2: Upload CSV hàng loạt + Xem kết quả ====

let csvResultText = ''; // Chứa nội dung CSV trả về từ server

const uploadBtn = document.getElementById('uploadBtn');
const viewBtn = document.getElementById('viewBtn');

// Hàm chung để upload file, nhận CSV text về, lưu vào biến, và (tùy chọn) download hoặc render bảng
function doUpload({ downloadFile = false, callbackAfterUpload = null } = {}) {
  const fileInput = document.getElementById('csvFileInput');
  if (!fileInput.files.length) {
    alert('Vui lòng chọn file CSV trước khi upload.');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
    .then(async response => {
      if (!response.ok) {
        let errMsg = `Lỗi ${response.status}`;
        try {
          const errObj = await response.json();
          if (errObj.error) errMsg += `: ${errObj.error}`;
        } catch (_) {}
        throw new Error(errMsg);
      }
      return response.text();
    })
    .then(csvText => {
      // Lưu kết quả vào biến toàn cục
      csvResultText = csvText;

      // Hiện nút "Xem kết quả" (nếu chưa hiện)
      viewBtn.style.display = 'inline-block';

      // Nếu có yêu cầu download, thực hiện download
      if (downloadFile) {
        const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'predictions_with_exited.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }

      // Nếu cần callback (ví dụ: hiển thị bảng), gọi callbackAfterUpload
      if (typeof callbackAfterUpload === 'function') {
        callbackAfterUpload();
      }
    })
    .catch(err => {
      alert('Có lỗi: ' + err.message);
      console.error(err);
    });
}

// Xử lý click nút "Upload & Tải về kết quả"
uploadBtn.addEventListener('click', () => {
  doUpload({ downloadFile: true });
});

// Xử lý click nút "Xem kết quả" (chỉ upload + hiển thị bảng)
viewBtn.addEventListener('click', () => {
  // Nếu chưa upload lần nào, upload rồi show bảng
  if (!csvResultText) {
    doUpload({
      downloadFile: false,
      callbackAfterUpload: () => {
        const container = document.getElementById('csvResultContainer');
        container.style.display = 'block';
        renderCsvTable(csvResultText);
      }
    });
  } else {
    // Nếu đã có dữ liệu, chỉ hiển thị lại bảng
    const container = document.getElementById('csvResultContainer');
    container.style.display = 'block';
    renderCsvTable(csvResultText);
  }
});

// Hàm parse CSV text thành bảng HTML
function renderCsvTable(csvText) {
  const container = document.getElementById('csvResultContainer');
  container.innerHTML = ''; // Xóa nội dung cũ (nếu có)

  // Tách từng dòng; ở đây giả định mỗi dòng dùng dấu phẩy đơn giản
  const rows = csvText.trim().split('\n').map(line => line.split(','));
  if (rows.length === 0) {
    container.textContent = 'Không có dữ liệu để hiển thị.';
    return;
  }

  const table = document.createElement('table');
  table.classList.add('result-table');

  // Tạo header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  rows[0].forEach(cellText => {
    const th = document.createElement('th');
    th.textContent = cellText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Tạo body
  const tbody = document.createElement('tbody');
  for (let i = 1; i < rows.length; i++) {
    const tr = document.createElement('tr');
    rows[i].forEach(cellText => {
      const td = document.createElement('td');
      td.textContent = cellText;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  container.appendChild(table);
}
