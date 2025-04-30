import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix, roc_auc_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import matplotlib.pyplot as plt

# Veri setini yükle
heart_df = pd.read_csv("heart.csv")

X = heart_df.drop("target", axis=1)
y = heart_df["target"]

# Normalize et
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Eğitim-test bölmesi
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Geliştirilmiş model
model = Sequential([
    Dense(64, input_dim=X.shape[1], activation='relu'),
    BatchNormalization(),
    Dropout(0.3),
    Dense(32, activation='relu'),
    BatchNormalization(),
    Dropout(0.3),
    Dense(16, activation='relu'),
    Dropout(0.2),
    Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Erken durdurma ve en iyi modeli kaydetme
early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
checkpoint = ModelCheckpoint("best_heart_model.h5", monitor='val_loss', save_best_only=True)

# Modeli eğit
history = model.fit(
    X_train, y_train,
    validation_split=0.2,
    epochs=100,
    batch_size=16,
    callbacks=[early_stop, checkpoint]
)

# Modeli test et
loss, acc = model.evaluate(X_test, y_test)
print(f"\n✅ Test Doğruluğu: %{acc * 100:.2f}")

# AUC ve Confusion Matrix
pred_probs = model.predict(X_test)
y_pred = (pred_probs > 0.5).astype(int)
print("ROC AUC:", roc_auc_score(y_test, pred_probs))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

# Eğitim sürecini çiz
plt.plot(history.history['accuracy'], label='Eğitim Doğruluğu')
plt.plot(history.history['val_accuracy'], label='Doğrulama Doğruluğu')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.title('Model Doğruluk Değişimi')
plt.grid()
plt.show()

# Modeli kaydet
model.save("heart_model_gelistirilmis.h5")
print("✅ Geliştirilmiş model kaydedildi: heart_model_gelistirilmis.h5")
