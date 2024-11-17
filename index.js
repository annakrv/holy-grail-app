var express = require("express");
var redis = require("redis");
var app = express();

//TODO: create a redis client
var client = redis.createClient({
  url: 'redis://localhost:6379'  
});
client.connect().catch(console.error);
// serve static files from public directory
app.use(express.static("public"));

// TODO: initialize values for: header, left, right, article and footer using the redis client
client.mSet({
  header: 0,
  left: 0,
  article: 0,
  right: 0,
  footer: 0
}).then(() => {
  console.log("Valores inicializados en Redis");
}).catch((err) => {
  console.error("Error inicializando los valores:", err);
});

// Get values for holy grail layout
async function data() {
  // TODO: uses Promise to get the values for header, left, right, article and footer from Redis
  const keys = ['header', 'left', 'article', 'right', 'footer'];
  try {
    const values = await Promise.all(keys.map((key) => client.get(key)));
    return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
  } catch (error) {
    console.error("Error obteniendo datos de Redis:", error);
    return {};
  }
}

// plus
app.get("/update/:key/:value", async function (req, res) {
  const key = req.params.key;
  let value = Number(req.params.value);

  //TODO: use the redis client to update the value associated with the given key
  if (!['header', 'left', 'article', 'right', 'footer'].includes(key)) {
    return res.status(400).send('Clave no válida');
  }

  try {
    // Actualizar el valor en Redis
    await client.set(key, value);
    res.send(`Valor de ${key} actualizado a ${value}`);
  } catch (error) {
    console.error("Error actualizando el valor:", error);
    res.status(500).send('Error al actualizar el valor');
  }
});

// get key data
app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  });
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
