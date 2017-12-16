var express = require('express');
var bodyParser = require('body-parser');

var md5 = require('md5');
const _ = require('lodash');
var {mongoose} = require('./db/mongoose');
var {Tarea} = require('./models/tarea');
var {Usuario} = require('./models/usuario');
var {authenticate}= require('./middleware/authenticate');
const {ObjectID} = require('mongodb'); // mongod --config /usr/local/etc/mongod.conf
var app = express();
const port = process.env.PORT || 3000;

//Manda un json a restAPI
app.use(bodyParser.json());

app.post('/login', (req, res) => {

var body= _.pick(req.body,['email','password']);
 Usuario.findByCredentials(body.email,body.password).then((usuario)=>{
  return usuario.generateAuthToken().then((token)=>{
   res.header('x-auth',token).send(usuario);
 });
 }).catch((e)=>{
  res.status(400).send();
 });

});

//Guarda un nuevo usuario en db mandada por servidor
app.post('/usuarios', (req, res) => {
  var usuario = new Usuario({
    username: req.body.username,
    name: req.body.name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: md5(req.body.password),
    fechaDeNacimiento:req.body.fechaDeNacimiento,
    intentos: 0,
    bloqueado: false
  });

  usuario.save().then(() => {
   return usuario;
 }).then((usuario)=>{
  res.status(200).send(usuario);
 }).catch((e)=>{
   res.status(400).send(e);
 })
});

app.get('/usuarios/me',authenticate,(req,res)=>{
 res.send(req.usuario);
});

app.delete('/usuarios/logout',authenticate,(req,res)=>{
  var token= req.header('x-auth');
  req.usuario.removeToken(token).then(()=>{
    res.status(200).send();
  },()=>{
    res.status(400).send();
  });
});

//Obtiene los usuarios del servidor

app.get('/usuarios',(req,res)=>{
  Usuario.find().then((usuarios) =>{
    res.send({usuarios});
  }, (e) => {
    res.status(400).send(e);
  })
});

//Obtiene un usuario por el username

app.get('/usuarios/:username', (req, res) => {
  var username = req.params.username;
  Usuario.findOne({
    username: username
  }).then((usuario) => { //Se realiza la busqueda del usuario por username
    if (!usuario) {
      return res.status(404).send(); // Si el usuario no existe devuelve una respuesta 404
    }
    res.send({usuario}); // Si todo estuvo bien, devuelve el usuario
  }).catch((e) => res.status(400).send()); // Si hubo un error lo atrapa y devuelve una respuesta 400
});


app.delete('/usuarios/:username', (req,res) => {
    var username = req.params.username;
    Usuario.findOneAndRemove({  //Similar al findOne, solamente que lo elimina de la db
      username: username
    }).then((usuario) => { //Se realiza la busqueda del usuario por username
      if (!usuario) {
        return res.status(404).send(); // Si el usuario no existe devuelve una respuesta 404
      }
      res.send({usuario}); // Si todo estuvo bien, devuelve el usuario
    }).catch((e) => res.status(400).send());
});

app.patch('/usuarios/:username',(req,res) =>{ // solo se puede modificar el nombre, apellido y la clave
  var username = req.params.username;
  var body = _.pick(req.body,['name','last_name','password']); // en una variable body se ingresan los valores que se van a modificar
  Usuario.findOneAndUpdate({username: username},{$set: body},{new: true}).then((usuario)=> { // Funcion que busca el usuario y le modifica los valores que se declararon en body
    if (!usuario) {
      return res.status(404).send(); // Si el usuario no existe devuelve una respuesta 404
    }
    res.send({usuario}); // Si todo estuvo bien, devuelve el usuario
  }).catch((e) => res.status(400).send());
});


//RELACIÓN DE USUARIOS Y TAREAS
app.post('/:username/tareas', (req, res) => {
  var username = req.params.username;
  var tarea = new Tarea ({
    descripcion: req.body.descripcion,
    username: username
  })
  tarea.save().then((doc) => {
    res.status(200).send(doc);
  }, (err) => {
    res.status(400).send(err);
  })
});

app.get('/:username/tareas', (req, res) => {
  var username = req.params.username;
  Tarea.find({ username: username }).then((tareas) => {
    res.send({tareas});
  }, (err) => {
    res.status(400).send(err);
  });
});

app.delete('/:username/tareas/:id', (req,res) => {
    var id = req.params.id; // el id lo pasamos como parametro para despues validarlo
    if (!ObjectID.isValid(id)) {
    return res.status(404).send(); // Si el ID no es valido devuelve una respuesta 404
    }
    Tarea.findByIdAndRemove(id).then((tarea) => { //Se realiza la busqueda del usuario por ID
    if (!tarea) {
      return res.status(404).send(); // Si el usuario no existe devuelve una respuesta 404
    }
    res.send({tarea}); // Si todo estuvo bien, devuelve el usuario
  }).catch((e) => res.status(400).send());
});

app.patch('/:username/tareas/:id',(req,res) =>{
  var id = req.params.id; // el id lo pasamos como parametro para despues validarlo
  var body = _.pick(req.body,['descripcion','completado']); // agarramos los parametros que se pueden modificar
  if (!ObjectID.isValid(id)) {
  return res.status(404).send(); // Si el ID no es valido devuelve una respuesta 404
  }
  if (_.isBoolean(body.completado) && body.completado){ //Comprobamos si el usuario coloco como verdadero el campo de completado
    body.horaCompletado = new Date (); //Asignamos la hora actual en que fue completado
  }else {
    body.completado = false; //Si no lo asignamos a falso por si acaso
    body.horaCompletado = null; // Y nulo la hora
  }
  Tarea.findByIdAndUpdate(id, {$set: body},{new: true}).then((tarea) => { //Se realiza la busqueda de la tarea por ID
  if (!tarea) {
    return res.status(404).send(); // Si tarea no existe devuelve una respuesta 404
  }
  res.send({tarea}); // Si todo estuvo bien, devuelve la tarea
  }).catch((e) => res.status(400).send());
});

app.listen(port, () => {
  console.log(`Servidor iniciado en port ${port}`);
});

module.exports = {app};
