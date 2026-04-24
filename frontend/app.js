import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use('/styles', express.static(path.join(__dirname, 'src/styles')));
app.use('/controllers', express.static(path.join(__dirname, 'src/controllers')));
app.use('/services', express.static(path.join(__dirname, 'src/services')));
app.use('/components', express.static(path.join(__dirname, 'src/components')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/views/htmls.html'));
});

app.get('/inventario', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/views/inventario.html'));
});

app.get('/nuevo-pedido', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/views/nuevo-pedido.html'));
});

app.get('/producto', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/views/producto.html'));
});

app.get('/reportes', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/views/reportes.html'));
});

app.listen(3000, () => {
  console.log("Frontend en puerto 3000");
});
