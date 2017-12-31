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
  var campos = ['username','name','last_name','email','password','fechaDeNacimiento','formaRegistro'];
  var body = _.pick(req.body,campos);
  var usuario = new Usuario(body);

  usuario.save().then(() => {
   return usuario;
 }).then((usuario)=>{
   usuario.password=md5(usuario.password);
   usuario.save();
  res.status(200).send(usuario);
}).catch((err)=>{
   res.status(400).send(err);
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
    usuario.password=md5(usuario.password);
    usuario.save();
    res.send({usuario}); // Si todo estuvo bien, devuelve el usuario
  }).catch((e) => res.status(400).send());
});


//RELACIÓN DE USUARIOS Y TAREAS
app.post('/:username/tareas', (req, res) => { //Registrar tareas
  var username = req.params.username;
  var tarea = new Tarea ({
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    categoria : req.body.categoria,
    username: username,
    fechaRegistro: new Date (),
    fechaLimite : req.body.fechaLimite
  })
  tarea.save().then((doc) => {
    res.status(200).send(doc);
  }, (err) => {
    res.status(400).send(err);
  })
});

app.get('/:username/tareas', (req, res) => { //Listar tareas sin ordenar
  var username = req.params.username;
  Tarea.find({ username: username }).then((tareas) => {
    res.send({tareas});
  }, (err) => {
    res.status(400).send(err);
  });
});

app.delete('/:username/tareas/:id', (req,res) => { //Eliminar tarea
    var id = req.params.id; // el id lo pasamos como parametro para despues validarlo
    var errormsg;
    if (!ObjectID.isValid(id)) {
    return res.status(404).send(); // Si el ID no es valido devuelve una respuesta 404
    }
    Tarea.findByIdAndRemove(id).then((tarea) => { //Se realiza la busqueda de la tarea por ID
    if (!tarea) {
      errormsg=JSON.parse('{"errormsg":"La tarea no existe"}');
      return res.status(404).send(errormsg); // Si la tarea no existe devuelve una respuesta 404
    }
    res.send({tarea}); // Si todo estuvo bien, devuelve el usuario
  }).catch((e) => res.status(400).send());
});

app.patch('/:username/tareas/:id',(req,res) =>{ // Actualizar tarea por hacer
  var id = req.params.id; // el id lo pasamos como parametro para despues validarlo
  var errormsg;
  var body = _.pick(req.body,['nombre','descripcion','categoria','fechaLimite']); // agarramos los parametros que se pueden modificar
  if (!ObjectID.isValid(id)) {
  return res.status(404).send(); // Si el ID no es valido devuelve una respuesta 404
  }
  Tarea.findById(id).then((tarea) =>{
    if (!tarea) {
      errormsg=JSON.parse('{"errormsg":"La tarea no existe"}');
      return res.status(404).send(errormsg); // Si la tarea no existe devuelve una respuesta 404
    }
    if (!tarea.completado){
      Tarea.findByIdAndUpdate(id, {$set: body},{new: true}).then((tarea) => { //Se realiza la busqueda de la tarea por ID
        res.send({tarea}); // Si todo estuvo bien, devuelve la tarea
      }).catch((e) => res.status(400).send());
    } else {
     errormsg=JSON.parse('{"errormsg":"La tarea ya ha sido completada"}');
      return res.status(400).send(errormsg); // Si la tarea esta completada no puedes modificarla, lanzando una respuesta no aceptable
    }
  });
});

app.put('/:username/tareas/:id',(req,res) =>{ //Marcar tarea como completada
  var id = req.params.id;
  var errormsg;
  var body = _.pick(req.body,['completado']);
  if (!ObjectID.isValid(id)) {
  return res.status(404).send(); // Si el ID no es valido devuelve una respuesta 404
  }
  Tarea.findById(id).then((tarea) =>{
    if (!tarea) {
      errormsg=JSON.parse('{"errormsg":"La tarea no existe"}');
      return res.status(404).send(errormsg); // Si la tarea no existe devuelve una respuesta 404
    }
    if (!tarea.completado){ // Si la tarea no esta completada entonces puedes marcarla como completada
      Tarea.findByIdAndUpdate(id, {$set: body},{new: true}).then((tarea) => { //Se realiza la busqueda de la tarea por ID
        res.send({tarea}); // Si todo estuvo bien, devuelve la tarea
      }).catch((e) => res.status(400).send());
    } else {
       errormsg=JSON.parse('{"errormsg":"La tarea ya ha sido completada"}');
      return res.status(400).send(errormsg); // Si ya fue completada no te permite actualizarla, lanzando una respuesta no aceptable
    }
  });
});

app.get('/:username/tareas/:id',(req,res) =>{ //Consultar tarea por hacer
  var id = req.params.id;
  var errormsg;
  if (!ObjectID.isValid(id)) {
  return res.status(404).send(); // Si el ID no es valido devuelve una respuesta 404
  }
  Tarea.findById(id).then((tarea) => {
    if (!tarea) {
      errormsg=JSON.parse('{"errormsg":"La tarea no existe"}');
      return res.status(404).send(errormsg); // Si la tarea no existe devuelve una respuesta 404
    }
    res.send({tarea}); // Si todo estuvo bien, devuelve la tarea
  }).catch((e) => res.status(400).send());
});

app.listen(port, () => {
  console.log(`Servidor iniciado en port ${port}`);
});

module.exports = {app};
