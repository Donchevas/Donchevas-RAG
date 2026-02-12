# Usamos una imagen de Python ligera
FROM python:3.12-slim

# Directorio de trabajo en el contenedor
WORKDIR /app

# Instalamos las dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código fuente
COPY . .

# Puerto estándar para Cloud Run
EXPOSE 8080

# Comando para iniciar el microservicio
# Usamos el puerto 8080 que es el esperado por GCP
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]