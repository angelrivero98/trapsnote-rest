const {mongoose} = require ('./../server/db/mongoose');
const {Usuario} = require ('./../server/models/usuario');

var username = "cagua"; // prueba de consulta para buscar un usuario en la db, con manejo de los errores

Usuario.findOne({
  username:username
}).then((usuario) => {
  if (!usuario) {
    console.log('Usuario no encontrado');
  }
  console.log(JSON.stringify(usuario,undefined,2));
}).catch((e) => console.log('Error encontrado con el username suministrado'));
