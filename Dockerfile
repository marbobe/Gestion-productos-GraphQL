# ==========================================
# Dockerfile - ENTORNO DE DESARROLLO
# ==========================================

# Usa la imagen base oficial de Node.js
FROM node:lts-alpine3.22

# Crea y establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente de la aplicación al contenedor
COPY . .

# Expone el puerto que usará Express (por defecto 4000)
EXPOSE 4000

# Comando para arrancar el servidor
CMD [ "npm", "run" , "dev" ]