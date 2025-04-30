# 📦 Temel kütüphaneler
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import time
from datetime import datetime

# 📊 Makine öğrenmesi araçları
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    confusion_matrix, classification_report,
    roc_auc_score, roc_curve, accuracy_score, precision_score, recall_score, f1_score
)
from sklearn.inspection import permutation_importance
from sklearn.ensemble import RandomForestClassifier

# 🔁 Veri dengeleme
from imblearn.over_sampling import SMOTE

# 🧠 Yapay sinir ağı bileşenleri
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization, LeakyReLU
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

# 🔍 Açıklanabilir yapay zeka (XAI)


# 1. Veriyi yükle
heart_df = pd.read_csv("heart.csv")
X = heart_df.drop("target", axis=1)
y = heart_df["target"]

# 2. Sınıf dağılımını göster
print("🔎 Sınıf Dağılımı:\n", y.value_counts())

# 3. SMOTE ile dengeleme
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X, y)
print("✅ SMOTE sonrası dağılım:\n", pd.Series(y_resampled).value_counts())

# 4. Normalize et
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_resampled)

# 5. Eğitim-test bölmesi
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_resampled, test_size=0.2, random_state=42
)

# 6. Gelişmiş model oluştur
model = Sequential()
model.add(Dense(128, input_dim=X.shape[1]))
model.add(LeakyReLU(alpha=0.1))
model.add(BatchNormalization())
model.add(Dropout(0.4))
model.add(Dense(64))
model.add(LeakyReLU(alpha=0.1))
model.add(BatchNormalization())
model.add(Dropout(0.3))
model.add(Dense(32))
model.add(LeakyReLU(alpha=0.1))
model.add(Dropout(0.2))
model.add(Dense(1, activation='sigmoid'))
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

print("\n📐 Model Özeti:")
model.summary()

# 7. Callbacks
model_name = f"heart_model_advanced_{datetime.now().strftime('%Y%m%d')}.h5"
early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
checkpoint = ModelCheckpoint(model_name, monitor='val_loss', save_best_only=True)

# 8. Eğitimi başlat
print("\n🚀 Eğitim başlıyor...")
start = time.time()
history = model.fit(
    X_train, y_train,
    validation_split=0.2,
    epochs=100,
    batch_size=16,
    callbacks=[early_stop, checkpoint],
    verbose=1
)
end = time.time()
print(f"\n⏱️ Eğitim süresi: {end - start:.2f} saniye")

# 9. Değerlendirme
loss, acc = model.evaluate(X_test, y_test)
print(f"\n✅ Test Doğruluğu: %{acc * 100:.2f}")

# 10. Tahminler
probs = model.predict(X_test).ravel()
y_pred = (probs >= 0.5).astype(int)

# 11. Ek Metrikler
print("\n🔍 Ek Metrikler:")
print("Accuracy:  ", round(accuracy_score(y_test, y_pred), 3))
print("Precision: ", round(precision_score(y_test, y_pred), 3))
print("Recall:    ", round(recall_score(y_test, y_pred), 3))
print("F1 Score:  ", round(f1_score(y_test, y_pred), 3))
print("ROC AUC:   ", round(roc_auc_score(y_test, probs), 3))

# 12. Classification Report
print("\n🧾 Classification Report:")
print(classification_report(y_test, y_pred))

# 13. Confusion Matrix
plt.figure(figsize=(6, 4))
sns.heatmap(confusion_matrix(y_test, y_pred), annot=True, fmt='d', cmap='Purples')
plt.title("Confusion Matrix")
plt.xlabel("Tahmin")
plt.ylabel("Gerçek")
plt.show()

# 14. Doğruluk grafiği
plt.plot(history.history['accuracy'], label='Eğitim')
plt.plot(history.history['val_accuracy'], label='Doğrulama')
plt.title('Model Doğruluk')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.grid()
plt.show()

# 15. Kayıp grafiği
plt.plot(history.history['loss'], label='Eğitim')
plt.plot(history.history['val_loss'], label='Doğrulama')
plt.title('Model Kayıp')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.grid()
plt.show()

# 16. ROC Eğrisi
fpr, tpr, _ = roc_curve(y_test, probs)
plt.plot(fpr, tpr, label=f"AUC = {roc_auc_score(y_test, probs):.2f}")
plt.plot([0, 1], [0, 1], linestyle='--', color='gray')
plt.title("ROC Curve")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.legend()
plt.grid()
plt.show()

# 17. Özellik Önemleri (Permutation Importance)
rf = RandomForestClassifier(random_state=42)
rf.fit(X_train, y_train)
perm = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=42)
importances = pd.Series(perm.importances_mean, index=X.columns)
importances.sort_values().plot(kind='barh', title='Özellik Önem Skorları')
plt.grid()
plt.show()

# 18. K-Fold Cross Validation
print("\n📊 K-Fold Cross Validation Başlıyor...")
kfold = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_accuracies = []
cv_aucs = []

for fold, (train_idx, val_idx) in enumerate(kfold.split(X_scaled, y_resampled)):
    print(f"\n🔁 Fold {fold+1}")
    X_tr, X_val = X_scaled[train_idx], X_scaled[val_idx]
    y_tr, y_val = y_resampled[train_idx], y_resampled[val_idx]

    fold_model = Sequential()
    fold_model.add(Dense(128, input_dim=X.shape[1]))
    fold_model.add(LeakyReLU(alpha=0.1))
    fold_model.add(BatchNormalization())
    fold_model.add(Dropout(0.4))
    fold_model.add(Dense(64))
    fold_model.add(LeakyReLU(alpha=0.1))
    fold_model.add(BatchNormalization())
    fold_model.add(Dropout(0.3))
    fold_model.add(Dense(32))
    fold_model.add(LeakyReLU(alpha=0.1))
    fold_model.add(Dropout(0.2))
    fold_model.add(Dense(1, activation='sigmoid'))
    fold_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    fold_model.fit(X_tr, y_tr, epochs=50, batch_size=16, verbose=0)
    val_probs = fold_model.predict(X_val).ravel()
    val_preds = (val_probs >= 0.5).astype(int)

    acc = accuracy_score(y_val, val_preds)
    auc = roc_auc_score(y_val, val_probs)

    print(f"✅ Fold {fold+1} Accuracy: {acc:.3f}, AUC: {auc:.3f}")
    cv_accuracies.append(acc)
    cv_aucs.append(auc)

print("\n📈 K-Fold Sonuçları:")
print("Ortalama Accuracy: ", round(np.mean(cv_accuracies), 3))
print("Ortalama ROC AUC: ", round(np.mean(cv_aucs), 3))

# 18. SHAP Değerlendirmesi
print("\n🔬 SHAP analizine başlanıyor...")

# Eğitim verisinden küçük bir örnek seç
background = X_train[np.random.choice(X_train.shape[0], 100, replace=False)]

# SHAP için DeepExplainer kullan (Keras model)
explainer = shap.DeepExplainer(model, background)
shap_values = explainer.shap_values(X_test[:100])  # İlk 100 örnek için

# Özellik isimlerini kullanmak için DataFrame'e dönüştür
X_test_df = pd.DataFrame(X_test[:100], columns=X.columns)

# SHAP özet grafiği
shap.summary_plot(shap_values[0], X_test_df, plot_type="bar", show=True)

# 19. Kaydet
model.save(model_name)
print(f"\n💾 Gelişmiş model kaydedildi: {model_name}")
# 20. Modelin ilk katmanına giriş için bir örnek verisi seç (ilk 100 örnek alınabilir)
X_explain = X_test[:100]

# 21. SHAP için explainer oluştur (DeepExplainer yerine GradientExplainer da denenebilir)
explainer = shap.Explainer(model, X_train)

# 22. SHAP değerlerini hesapla
print("\n🔍 SHAP açıklamaları hesaplanıyor...")
shap_values = explainer(X_explain)

# 23. SHAP özet grafiği
shap.summary_plot(shap_values, X_explain, feature_names=X.columns)