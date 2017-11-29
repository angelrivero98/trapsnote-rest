var express = require('express');
var bodyParser = require('body-parser');

var md5 = require('md5');


var {mongoose} = require('./db/mongoose');
var {Tarea} = require('./models/tarea');
var {Usuario} = require('./models/usuario');
const {ObjectID} = require('mongodb');

var app = express();

const port = process.env.PORT || 3000;

//Manda un json a restAPI
app.use(bodyParser.json());

//Guarda una nueva tarea en db mandada por servidor
app.post('/tareas', (req, res) => {
  var tarea = new Tarea({
    descripcion: req.body.descripcion
  });

  tarea.save().then((doc) => {
    res.status(200).send(doc);
  }, (err) => {
    res.status(400).send(err);
  })
});

//Guarda un nuevo usuario en db mandada por servidor
app.post('/usuarios', (req, res) => {
  var usuario = new Usuario({
    name: req.body.name,
    last_name: req.body.last_name,
    email: req.body.email,

    password: md5(req.body.password)

  });

  usuario.save().then((doc) => {
    res.status(200).send(doc);
  }, (err) => {
    res.status(400).send(err);
  })
});



//Obtiene un usuario del servidor

app.get('/usuarios',(req,res)=>{
  Usuario.find().then((usuarios) =>{
    res.send({usuarios});
  }, (e) => {
    res.status(400).send(e);
  })
});

//Obtiene una nueva tarea del servidor
app.get('/tareas', (req,res) => {
  Tarea.find().then((tareas) => {
    res.send({tareas});
  }, (err) => {
    res.status(400).send(err);
  });
});


//Obtiene una usuario según su id
app.get('/usuarios/:id', (req, res) => {
  var id = req.params.id; // el id lo pasamos como parametro para despues validarlo
  if (!ObjectID.isValid(id)) {
    return res.status(404).send(); // Si el ID no es valido devuelve una respuesta 404
  }
  Usuario.findById(id).then((usuario) => { //Se realiza la busqueda del usuario por ID
    if (!usuario) {
      return res.status(404).send(); // Si el usuario no existe devuelve una respuesta 404
    }
    res.send({usuario}); // Si todo estuvo bien, devuelve el usuario
  }).catch((e) => res.status(400).send()); // Si hubo un error lo atrapa y devuelve una respuesta 400
});


//Obtiene una tarea según su id

app.get('/tareas/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Tarea.findById(id).then((tarea) => {
    if (!tarea) {
      return res.status(400).send();
    }
    res.send({tarea});

  }).catch((e) => res.status(400).send());
});



//Crea el Servidor

app.listen(port, () => {
  console.log(`Servidor iniciado en port ${port}`);
});

module.exports = {app};
