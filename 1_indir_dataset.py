import pandas as pd

url = "https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv"


columns = [
    "glucose", "bloodPressure", "skinThickness", "insulin",
    "bmi", "diabetesPedigree", "age", "outcome"
]

df = pd.read_csv(url, header=None)
df = df.iloc[:, 1:]
df.columns = columns


df.to_csv("diabetes_cleaned.csv", index=False)
print("Veri başarıyla indirildi ve kaydedildi: diabetes_cleaned.csv")
