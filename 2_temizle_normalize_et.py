import pandas as pd
from sklearn.preprocessing import MinMaxScaler

df = pd.read_csv("diabetes_cleaned.csv")

zero_invalid_cols = ["glucose", "bloodPressure", "skinThickness", "insulin", "bmi"]


for col in zero_invalid_cols:
    df[col] = df[col].replace(0, pd.NA)
    df[col] = df[col].fillna(df[col].mean())  


X = df.drop("outcome", axis=1)
y = df["outcome"]


scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)


df_scaled = pd.DataFrame(X_scaled, columns=X.columns)
df_scaled["outcome"] = y


df_scaled.to_csv("diabetes_final.csv", index=False)
print("Veri temizlendi ve normalize edildi: diabetes_final.csv")
