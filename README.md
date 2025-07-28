# churn-modelling
Website dự đoán khách hàng có nguy cơ ngừng sử dụng dịch vụ - Ứng dụng mô hình Random Forest

### **Mô tả bài toán** ###
- Sử dụng mô hình Random Forest để dự đoán khả năng khách hàng ngừng sử dụng dịch vụ, giúp doanh nghiệp tối ưu chi phí marketing
- Bộ dữ liệu huấn luyện mô hình: https://www.kaggle.com/code/artemsolomko/customer-churn-prediction/input

### Bộ dữ liệu churn gồm 14 cột: ###
- RowNumber
- CustomerId
- Surname
- CreditScore 
- Geography
- Gender
- Age
- Tenure 
- Balance
- NumberOfProducts 
- HasCrCard
- isActiveMember
- EstimatedSalary
- Exited (Biến cần dự đoán)

### **Hướng dẫn sử dụng** ###
- Chạy file OnMinhDuc_20227190_CodeModel.ipynb với model mong muốn để tạo ra file model_pipeline.pkl
- Thêm file model_pipeline.pkl vào folder code trên là mô hình ML/DL có thể chạy trên website, xử lý real-time theo input của người dùng

### **Ngôn ngữ sử dụng** ###
- Python 
- HTML
- CSS
- JavaScript
