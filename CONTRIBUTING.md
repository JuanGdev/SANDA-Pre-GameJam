<!-- filepath: /workspaces/SANDA-Pre-GameJam/CONTRIBUTING.md -->

# Contribuir al Proyecto

¡Gracias por tu interés en contribuir a este proyecto! Aquí tienes las instrucciones para contribuir de manera efectiva.

## Crear un Codespace o  clona el repositorio en tu computadora

1. Ve a la página del repositorio en GitHub.
2. Haz clic en el botón `Code` y selecciona `Open with Codespaces`.
3. Si no tienes un Codespace existente, crea uno nuevo.

## Agregar Datos en `contributors.json`

1. Abre el archivo `contributors.json`.
2. Agrega tu nombre y URL de tu avatar en el siguiente formato:
    ```json
    {
        "name": "TuNombre",
        "avatar_url": "URL de tu avatar"
    }
    ```

## Agregar Palabras en `words.json`

1. Abre el archivo `words.json`.
2. Agrega un nuevo objeto en la lista `specialMessages` con el siguiente formato:
    ```json
    {
        "text": "Tu mensaje",
        "fontSize": 32,
        "duration": 2000,
        "color": "#D8BFD8",
        "style": "bold",
        "x": 500,
        "y": 500
    }
    ```

## Actualizar la Leaderboard

1. Juega el juego y obtén tu puntaje.
2. Copia el código JSON que aparece en la sección "Updated Leaderboard JSON" al final de la página web.
3. Abre el archivo `leaderboard.json`.
4. Pega el código copiado en el archivo `leaderboard.json`.

## Envía tu Pull Request

1. Crea una nueva rama para tus cambios:
    ```bash
    git checkout -b nombre-de-tu-rama
    ```

2. Realiza tus cambios y haz commit de los mismos:
    ```bash
    git add .
    git commit -m "Descripción de los cambios"
    ```

3. Sube tus cambios a tu repositorio en GitHub:
    ```bash
    git push origin nombre-de-tu-rama
    ```

4. Ve a la página del repositorio en GitHub y haz clic en el botón `Compare & pull request`.

5. Completa el formulario de pull request, proporcionando una descripción detallada de los cambios que has realizado.

6. Haz clic en `Create pull request` para enviar tu pull request a revisión.

¡Esperamos tu Pull Request!
