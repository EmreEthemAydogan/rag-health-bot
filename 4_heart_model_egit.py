import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.callbacks import EarlyStopping
import numpy as np


df = pd.read_csv("heart.csv")




X = df.drop("target", axis=1)
y = df["target"]


scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)


X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)


model = Sequential([
    Dense(32, input_dim=X.shape[1], activation='relu'),
    Dense(16, activation='relu'),
    Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])


early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

model.fit(X_train, y_train, validation_split=0.2, epochs=100, batch_size=16, callbacks=[early_stop])


loss, acc = model.evaluate(X_test, y_test)
print(f"\n✅ Kalp Modeli Test Doğruluğu: %{acc * 100:.2f}")


model.save("heart_model.h5")
print("✅ Kalp modeli başarıyla kaydedildi: heart_model.h5")
