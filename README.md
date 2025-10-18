# RASTREADOR SUPER SIMPLES

Sem banco de dados complexo, sem painel avançado. Só:
- `POST /register` para criar dispositivo e token.
- `/agent` página para enviar pings.
- `/view?id=<deviceId>` para ver a última posição (mapinha Leaflet).

## Rodar
```bash
npm install
npm start
```
Abre em `http://localhost:3000`.

## Passos rápidos
1) Registrar:
```bash
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d '{"name":"MeuPC","email":"eu@exemplo.com"}'
```
Anote `deviceId` e `deviceToken`.

2) No computador a ser rastreado, abra:
```
http://SEU_SERVIDOR:3000/agent
```
Clique **Salvar** (URL do servidor + deviceToken) e **Enviar agora** (ou aguarde).

3) Para visualizar:
```
http://SEU_SERVIDOR:3000/view?id=<deviceId>
```
Se tiver coordenadas, aparece o mapa. Senão, mostra IP e data/hora.

> Use apenas em dispositivos próprios ou com consentimento.
