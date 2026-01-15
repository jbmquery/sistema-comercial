# React and Flask

Find the corresponding instructions under:

- 'sistema_servicio' - For the frontend project.
- 'server-flask' - For the backend project

# Para subir nuevo cambio

- git add .
- git commit -m "mensaje"
- git push

# Para ver el registro de cambio

- git log --oneline

# Si quieres que tu rama apunte a ese commit (descartar cambios posteriores):

- git reset --hard [9ee75f4157a3e1cc3bf077ce9a93592c1e61f1b4]

# autentificador de NGROK

.\ngrok.exe config add-authtoken 38GwZTO3JSyzvG6tmUbDVLO9xF5_7Yo1VJwk6pMhqSXkd3xLL --FRONTEND
.\ngrok.exe config add-authtoken 38IZfR8PbmDnSJGtRjIK1F0sbLf_4GGF6nZB3THqKNcM6wiG8 --BACKEND

# Ejecutar el ngrok

.\ngrok.exe start --all --config "C:\Users\santi\.ngrok2\ngrok.yml" --FRONTEND
.\ngrok.exe start --all --config "C:\Users\santi\.ngrok2\ngrok2.yml" --BACKEND

# Lugares donde actualizar NGROK en el codigo------

- server-flask/src/main.py ----------   FRONTEND
- SISTEMA_SERVICIO/src/config.js ----   BACKEND
- SISTEMA_SERVICIO/src/api.js -------   backend
- Colocar los subdominios en vite.config.js ejemplo '.ngrok-free.dev' del FRONTEND