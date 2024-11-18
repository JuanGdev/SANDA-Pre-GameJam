<!-- filepath: /workspaces/SANDA-Pre-GameJam/CONTRIBUTING.md -->

# Contribuir al Proyecto

¡Gracias por tu interés en contribuir a este proyecto! Aquí tienes las instrucciones para contribuir de manera efectiva.

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

## Crear un Codespace

1. Ve a la página del repositorio en GitHub.
2. Haz clic en el botón `Code` y selecciona `Open with Codespaces`.
3. Si no tienes un Codespace existente, crea uno nuevo.

## Recursos

- [Documentación de GitHub Codespaces](https://docs.github.com/en/codespaces)
- [Documentación de Git y GitHub](https://docs.github.com/en/get-started)
- [Documentación de p5.js](https://p5js.org/reference/)

¡Esperamos tus contribuciones!
