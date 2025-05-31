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
      document.getElementById('probability').textContent = (result.probability * 100).toFixed(2) + '%';
      document.getElementById('conclusion').textContent =
        result.probability > 0.5 ? 'Khách hàng có thể rời bỏ' : 'Khách hàng sẽ ở lại';
    })
    .catch(() => {
      document.getElementById('probability').textContent = '--';
      document.getElementById('conclusion').textContent = 'Không thể dự đoán';
    });
  }, 400);
}

// ==== Phần 2: Upload CSV hàng loạt ====

document.getElementById('uploadBtn').addEventListener('click', uploadCsv);

function uploadCsv() {
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
    return response.blob();
  })
  .then(blob => {
    // Tạo link tạm để download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'predictions_with_exited.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  })
  .catch(err => {
    alert('Có lỗi: ' + err.message);
    console.error(err);
  });
}
