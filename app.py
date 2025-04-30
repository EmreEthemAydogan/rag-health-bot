import matplotlib.pyplot as plt
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow.keras.models import load_model
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import secrets
from reportlab.pdfgen import canvas
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from flask import Response
import csv
from io import StringIO
import logging

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///predictions.db'
app.config['SQLALCHEMY_BINDS'] = {
    'users': 'sqlite:///users.db'
}
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS", "mustafaresat69@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "lcur ywdi xmfc kitd")

db = SQLAlchemy(app)
reset_tokens = {}

class User(db.Model):
    __bind_key__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    surname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    email_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), nullable=True)  

class PredictionHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    mode = db.Column(db.String(50), nullable=False)
    input_data = db.Column(db.JSON, nullable=False)
    result = db.Column(db.String(100), nullable=False)
    probability = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

if not os.path.exists('users.db') or not os.path.exists('predictions.db'):
    with app.app_context():
        db.create_all()

def generate_graph_image(graph_data):
    try:
        fig, ax = plt.subplots()
        ax.plot(graph_data['dates'], graph_data['risks'], marker='o')
        ax.set_title("Kalp Riski Zaman Grafiği")
        ax.set_ylabel("Risk (%)")
        ax.set_xlabel("Tarih")
        ax.tick_params(axis='x', labelrotation=45)
        plt.tight_layout()

        img_buffer = BytesIO()
        plt.savefig(img_buffer, format='PNG')
        plt.close()
        img_buffer.seek(0)
        return img_buffer
    except Exception as e:
        logging.error("Grafik oluşturulurken hata oluştu: %s", e)
        return None

def create_prediction_pdf(prediction_type, result, probability, graph_data=None):
    buffer = BytesIO()
    pdfmetrics.registerFont(TTFont("DejaVu", "fonts/DejaVuSans.ttf"))
    c = canvas.Canvas(buffer, pagesize=A4)
    c.setFont("DejaVu", 12)

    c.drawString(100, 750, f"{prediction_type} Tahmin Raporu")
    c.drawString(100, 720, f"Sonuç: {result}")
    c.drawString(100, 700, f"Olasılık: %{round(probability * 100, 1)}")

    if graph_data:
        img_buffer = generate_graph_image(graph_data)
        if img_buffer:
            try:
                c.drawImage(ImageReader(img_buffer), 100, 450, width=400, height=200)
            except Exception as e:
                logging.error("PDF'e grafik eklenemedi: %s", e)

    c.drawString(100, 420, "Bu sadece bir tahmindir.")
    c.drawString(100, 400, "Lütfen sağlık uzmanına danışınız.")
    c.save()
    buffer.seek(0)
    return buffer

def send_prediction_email(to_email, prediction_type, result, probability, graph_data=None):
    subject = f"{prediction_type} Tahmin Sonucunuz"
    body = f"""
Merhaba,

{prediction_type} tahmininiz başarıyla tamamlandı.
Sonuç: {result}
Olasılık: %{round(probability * 100, 1)}

PDF raporu ekte yer almaktadır.

Sağlıklı günler!
"""

    msg = MIMEMultipart()
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    pdf_buffer = create_prediction_pdf(prediction_type, result, probability)
    part = MIMEApplication(pdf_buffer.read(), _subtype="pdf")
    part.add_header('Content-Disposition', 'attachment', filename=f"{prediction_type}_tahmin_raporu.pdf")
    msg.attach(part)
    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print("Tahmin e-postası gönderilemedi:", e)

def send_verification_email(to_email, token):
    EMAIL_ADDRESS = "mustafaresat69@gmail.com"
    EMAIL_PASSWORD = "lcur ywdi xmfc kitd"
    link = f"http://localhost:3000/verify-email/{token}"
    subject = "E-posta Doğrulama"
    body = f"Merhaba, e-posta adresinizi doğrulamak için şu bağlantıya tıklayın: {link}"
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email
    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.sendmail(EMAIL_ADDRESS, to_email, msg.as_string())
        server.quit()
    except Exception as e:
        print("Doğrulama e-postası gönderilemedi:", e)

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name", "").strip()
    surname = data.get("surname", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not surname or not email or not password:
        return jsonify({'message': 'Tüm alanlar zorunludur'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Bu e-posta zaten kayıtlı'}), 400

    token = secrets.token_urlsafe(32)
    hashed_pw = generate_password_hash(password)

    new_user = User(
        name=name,
        surname=surname,
        email=email,
        password=hashed_pw,
        email_verified=False,
        verification_token=token
    )

    db.session.add(new_user)
    db.session.commit()
    send_verification_email(email, token)

    return jsonify({'message': 'Kayıt başarılı, lütfen e-postanızı doğrulayın.'}), 200

@app.route("/verify-email/<token>")
def verify_email(token):
    user = User.query.filter_by(verification_token=token).first()

    if user:
        if user.email_verified:
            return "E-postanız zaten doğrulanmıştı.", 200
        user.email_verified = True
        user.verification_token = None
        db.session.commit()
        return "E-postanız başarıyla doğrulandı. Artık giriş yapabilirsiniz.", 200

    user_verified = User.query.filter_by(email_verified=True).all()
    for u in user_verified:
        if u.verification_token is None:
            return "E-postanız zaten doğrulanmıştı.", 200

    return "Geçersiz veya süresi dolmuş bağlantı!", 400



@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        if not user.email_verified:
            return jsonify({'message': 'Lütfen önce e-posta adresinizi doğrulayın.'}), 403
        return jsonify({'message': 'Giriş başarılı', 'user': {
            'id': user.id,
            'name': user.name,
            'surname': user.surname,
            'email': user.email,
            'email_verified': user.email_verified
        }}), 200
    return jsonify({'message': 'Geçersiz e-posta veya şifre'}), 401

@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Eğer bu e-posta kayıtlıysa, bağlantı gönderildi."}), 200
    reset_token = secrets.token_urlsafe(32)
    reset_tokens[reset_token] = email
    link = f"http://localhost:3000/#/reset-password/{reset_token}"
    subject = "Şifre Sıfırlama Bağlantısı"
    body = f"Merhaba, şifrenizi sıfırlamak için şu bağlantıyı kullanın: {link}"
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = "mustafaresat69@gmail.com"
    msg["To"] = email
    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login("mustafaresat69@gmail.com", "lcur ywdi xmfc kitd")
        server.sendmail("mustafaresat69@gmail.com", email, msg.as_string())
        server.quit()
        return jsonify({"message": "Şifre sıfırlama bağlantısı gönderildi."}), 200
    except:
        return jsonify({"message": "E-posta gönderilemedi."}), 500

@app.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):
    data = request.get_json()
    new_password = data.get("newPassword")
    email = reset_tokens.get(token)
    if not email:
        return jsonify({"message": "Geçersiz veya süresi dolmuş bağlantı!"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Kullanıcı bulunamadı!"}), 404
    user.password = generate_password_hash(new_password)
    db.session.commit()
    del reset_tokens[token]
    return jsonify({"message": "Şifreniz başarıyla güncellendi."}), 200

@app.route("/history/<int:user_id>", methods=["GET"])
def get_history(user_id):
    records = PredictionHistory.query.filter_by(user_id=user_id).order_by(PredictionHistory.timestamp.desc()).limit(10).all()
    return jsonify({
        "history": [
            {
                "timestamp": record.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "mod": record.mode,
                "input_data": record.input_data,
                "result": record.result,
                "oran": round(record.probability * 100, 1)
            } for record in records
        ]
    })

@app.route("/predict", methods=["POST"])
def predict_diabetes():
    data = request.get_json()
    try:
        user_id = data.get("user_id")
        features = np.array([[ 
            data["input_data"]["glucose"],
            data["input_data"]["bloodPressure"],
            data["input_data"]["skinThickness"],
            data["input_data"]["insulin"],
            data["input_data"]["bmi"],
            data["input_data"]["diabetesPedigree"],
            data["input_data"]["age"]
        ]])
        prediction = diabetes_model.predict(features)[0][0]
        tahmin = "Yüksek Diyabet Riski" if prediction >= 0.5 else "Düşük Diyabet Riski"
        new_entry = PredictionHistory(
            user_id=user_id,
            mode="diabetes",
            input_data=data["input_data"],
            result=tahmin,
            probability=float(prediction)
        )
        db.session.add(new_entry)
        db.session.commit()
        user = User.query.filter_by(id=user_id).first()
        if user:
            send_prediction_email(user.email, "Diyabet", tahmin, prediction)
        return jsonify({
            "tahmin": tahmin,
            "oran": round(float(prediction), 3)
        })
    except Exception as e:
        return jsonify({"hata": str(e)}), 400

# Kalp Tahmini – Klasik
@app.route("/predict-heart", methods=["POST"])
def predict_heart():
    data = request.get_json()
    try:
        user_id = data.get("user_id")
        features = np.array([[ 
            data["input_data"]["age"], data["input_data"]["sex"],
            data["input_data"]["cp"], data["input_data"]["trestbps"],
            data["input_data"]["chol"], data["input_data"]["fbs"],
            data["input_data"]["restecg"], data["input_data"]["thalach"],
            data["input_data"]["exang"], data["input_data"]["oldpeak"],
            data["input_data"]["slope"], data["input_data"]["ca"],
            data["input_data"]["thal"]
        ]])
        prediction = heart_model.predict(features)[0][0]
        tahmin = "Yüksek Kalp Hastalığı Riski" if prediction >= 0.5 else "Düşük Risk"
        
        new_entry = PredictionHistory(
            user_id=user_id, mode="heart", input_data=data["input_data"],
            result=tahmin, probability=float(prediction)
        )
        db.session.add(new_entry)
        db.session.commit()

        user = User.query.filter_by(id=user_id).first()
        if user:
            send_prediction_email(user.email, "Kalp Hastalığı", tahmin, prediction)

        return jsonify({"tahmin": tahmin, "oran": round(float(prediction), 3)})
    except Exception as e:
        return jsonify({"hata": str(e)}), 400

# Kalp Tahmini – Gelişmiş
@app.route("/predict-heart-advanced", methods=["POST"])
def predict_heart_advanced():
    data = request.get_json()
    try:
        user_id = data.get("user_id")
        features = np.array([[ 
            data["input_data"]["age"], data["input_data"]["sex"],
            data["input_data"]["cp"], data["input_data"]["trestbps"],
            data["input_data"]["chol"], data["input_data"]["fbs"],
            data["input_data"]["restecg"], data["input_data"]["thalach"],
            data["input_data"]["exang"], data["input_data"]["oldpeak"],
            data["input_data"]["slope"], data["input_data"]["ca"],
            data["input_data"]["thal"]
        ]])
        prediction = heart_model_advanced.predict(features)[0][0]
        tahmin = "Yüksek Kalp Hastalığı Riski (Gelişmiş)" if prediction >= 0.5 else "Düşük Risk (Gelişmiş)"
        
        new_entry = PredictionHistory(
            user_id=user_id, mode="heart-pro", input_data=data["input_data"],
            result=tahmin, probability=float(prediction)
        )
        db.session.add(new_entry)
        db.session.commit()

        user = User.query.filter_by(id=user_id).first()
        if user:
            send_prediction_email(user.email, "Gelişmiş Kalp Modeli", tahmin, prediction)

        return jsonify({"tahmin": tahmin, "oran": round(float(prediction), 3)})
    except Exception as e:
        return jsonify({"hata": str(e)}), 400

# Kalp Tahmini Geçmiş Analizi
@app.route("/heart-history-analytics/<int:user_id>", methods=["GET"])
def heart_history_analytics(user_id):
    records = PredictionHistory.query.filter(
        PredictionHistory.user_id == user_id,
        PredictionHistory.mode.in_(["heart", "heart-pro"])
    ).order_by(PredictionHistory.timestamp.desc()).limit(10).all()

    dates, risks, ages, modes = [], [], [], []
    for r in records:
        dates.append(r.timestamp.strftime("%Y-%m-%d %H:%M:%S"))
        risks.append(round(r.probability * 100, 1))
        ages.append(r.input_data.get("age", 0))
        modes.append(r.mode)

    return jsonify({
        "dates": dates[::-1], "risks": risks[::-1],
        "ages": ages[::-1], "modes": modes[::-1],
        "average_risk": round(np.mean(risks), 1) if risks else 0
    })



@app.route("/download-history/<int:user_id>", methods=["GET"])
def download_history(user_id):
    records = PredictionHistory.query.filter_by(user_id=user_id).order_by(PredictionHistory.timestamp.desc()).all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Tarih", "Mod", "Sonuç", "Olasılık (%)", "Girdi Verisi"])

    for r in records:
        writer.writerow([
            r.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            r.mode,
            r.result,
            round(r.probability * 100, 1),
            str(r.input_data)
        ])

    response = Response(output.getvalue(), mimetype="text/csv")
    response.headers.set("Content-Disposition", f"attachment; filename=gecmis_kayitlar_kullanici_{user_id}.csv")
    return response
# ✅ Eğitimli modelleri yükle
diabetes_model = load_model("diabetes_model.h5")
heart_model = load_model("heart_model.h5")
heart_model_advanced = load_model("heart_model_gelistirilmis.h5")


if __name__ == "__main__":
    app.run(debug=True)
