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

.\ngrok.exe config add-authtoken 31icpQPSQHJpmZOUnbFraTGndI9_7dFER9USoAefi7G7BWhGQ

# Ejecutar el ngrok

.\ngrok.exe start --all --config "C:\Users\santi\.ngrok2\ngrok.yml"