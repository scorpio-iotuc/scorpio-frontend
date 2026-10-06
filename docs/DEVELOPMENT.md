
### Desarrollo con Docker

- Levanta Vite en `http://localhost:5173`.
- Usa `Dockerfile.dev`.
- Apunta al backend en `http://localhost:3000/api`.
Para levantar el entorno de desarrollo con Docker, ejecuta:
```bash
docker compose -f docker-compose.dev.yml up --build
```

Para detener:

```bash
docker compose -f docker-compose.dev.yml down
```


### Producción con Docker

El `docker-compose.yml` normal construye el frontend y lo sirve con Nginx:
```bash
docker compose up --build -d
```
