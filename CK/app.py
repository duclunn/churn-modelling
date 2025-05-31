from flask import Flask, request, jsonify, send_from_directory, send_file
import pickle
import pandas as pd
from flask_cors import CORS
import io

app = Flask(__name__, static_url_path='', static_folder='static')
CORS(app)

# Load model pipeline
with open('/Users/duclun/Desktop/Hệ hỗ trợ quyết định/CK/model_pipeline.pkl', 'rb') as f:
    model_pipeline = pickle.load(f)

@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    input_df = pd.DataFrame([{
        'CreditScore': data['creditScore'],
        'Geography': data['geography'],
        'Gender': data['gender'],
        'Age': data['age'],
        'Tenure': data['tenure'],
        'Balance': data['balance'],
        'NumOfProducts': data['numProducts'],
        'HasCrCard': data['creditCard'],
        'IsActiveMember': data['isActive'],
        'EstimatedSalary': data['salary']
    }])
    proba = model_pipeline.predict_proba(input_df)[0][1]
    return jsonify({'probability': float(proba)})

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'Không tìm thấy file upload'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Tên file không hợp lệ'}), 400

    try:
        df = pd.read_csv(file)
        # Danh sách cột bắt buộc
        required_cols = [
            'RowNumber', 'CustomerId', 'Surname',
            'CreditScore', 'Geography', 'Gender', 'Age', 'Tenure',
            'Balance', 'NumOfProducts', 'HasCrCard', 'IsActiveMember',
            'EstimatedSalary'
        ]
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            return jsonify({'error': f'Thieu cot: {missing}'}), 400

        # Lấy 10 cột feature để predict
        feature_cols = [
            'CreditScore', 'Geography', 'Gender', 'Age', 'Tenure',
            'Balance', 'NumOfProducts', 'HasCrCard', 'IsActiveMember',
            'EstimatedSalary'
        ]
        X = df[feature_cols]

        # Dự đoán nhãn Exited (0 hoặc 1)
        preds = model_pipeline.predict(X)
        df['Exited'] = preds.astype(int)

        # Xuất CSV kết quả
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)

        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name='predictions_with_exited.csv'
        )
    except Exception as e:
        return jsonify({'error': f'Xử lý file thất bại: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
