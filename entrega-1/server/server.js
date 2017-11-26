const _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Tarea} = require('./models/tarea');
var {Usuario} = require('./models/usuario');
const {ObjectID} = require('mongodb');

var app = express();

const port = process.env.PORT || 3000;

//Manda un json a restAPI
app.use(bodyParser.json());
app.use(express.urlencoded());

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
  var body= _.pick(req.body,['username','nombre','apellido','email','password']);
  var usuario = new Usuario(body);

  usuario.save().then((usuario) => {
    res.status(200).send(usuario);
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


app.get('/tareas',(req,res)=>{
  Tarea.find().then((tareas) =>{
    res.send({tareas});
  }, (e) => {
    res.status(400).send(e);
  })
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
  }).catch((err) => res.status(400).send());
});


//Crea el Servidor

app.listen(port, () => {
  console.log(`Servidor iniciado en port ${port}`);
});

module.exports = {app};
