import joblib

model = joblib.load("ml_files/model_30d.pkl")
print(type(model))