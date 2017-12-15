var mongoose = require("mongoose");
const moment = require('moment');
moment().format();
const validator = require("validator");

const jwt = require('jsonwebtoken');
const _ =require('lodash');
var md5 = require('md5');
var UserSchema= new mongoose.Schema({

  username:{  //Campo del nombre de usuario, donde se valida que sea unico

    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique:true,
    maxlength:20
  },
  name: {
    type: String,

    //required (Validador): No crea la tarea a menos que tenga el campo de descripcion
    required: true,

    //minlength (Validador): Mínimo de caracteres o valores para poder crear el objeto
    minlength: 1,

    //trim (Validador): Elimina los espacios en blanco al pŕincipio y final de descripcion (quita que el nombre sea solo espacios en blanco)
    trim: true,

    maxlength:50
  },
  last_name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    maxlength:50
  },
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique:true,
    validate:{
    validator: (value)=>{
          return validator.isEmail(value);
    },
    message: '{VALUE} no es un email valido'
  }

  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    maxlength:50,
    validate:{
    validator: (value)=>{
          return validator.isAlphanumeric(value);
    },
    message: '{VALUE} la contraseña debe ser alfanumerica'
  }

  },
  fechaDeNacimiento :{
    type: Date,
    required :true,
    trim :true,
    validate:{
      validator:serMayorDeEdad,  //Llamo a la funcion que me permite verificar si es mayor de edad
      message: 'Tiene que ser mayor de edad para registrarse' //Si no es mayor de edad te devuelve un error con el msj
    }
  },

  intentos: {
    type: Number
  },

  bloqueado: {
    type: Boolean
  },
  tokens:[{
    access:{
      type: String,
      required:true
    },
    token:{
      type: String,
      required:true
    }
  }]
});

function serMayorDeEdad (value) {
  var hoy = new Date(); // Una variable para guardar la fecha actual
  var yearEdad = moment(value).fromNow().match(/\d+/g); //Una variable para guardar los años que tiene
  if ((yearEdad==18)&&(value.getMonth()== hoy.getMonth())){ // Se comprueba que aparte esta en el año "18" y esta en el mismo mes que la fecha actual
    if(value.getDate()>hoy.getDate()) return false; //Si esta un dia mas aparte de la fecha actual devuelve falso para que no pueda registrarse
  } else {
    if((yearEdad==18)&&(value.getMonth()>hoy.getMonth())) {return false;}  //Si esta en el año que es y ademas el mes de nacimiento esta despues del mes actual retorna falso
      else {
        if (yearEdad<18) return false; // Y por ultimo si es menor de 18 tampoco lo deja registrarse
      }
  }
return true;
};

UserSchema.methods.toJSON=function(){
  var usuario=this;
  var userObject = usuario.toObject();
  return _.pick(userObject,['_id','username','name','last_name','email','fechaDeNacimiento']);
};
UserSchema.methods.generateAuthToken= function(){
  var usuario=this;
  var access= 'auth';
  var token = jwt.sign({id: usuario._id.toHexString(),access},'trapsnote').toString();

  usuario.tokens.push({access,token});
  return usuario.save().then(()=>{
     return token;
  });
};
UserSchema.methods.removeToken = function(token){
  var usuario = this;
return  usuario.update({
    $pull:{
      tokens: {token}
  }
});
};
UserSchema.statics.findByCredentials= function (email,password){
  var Usuario =this;
  return Usuario.findOne({email}).then((usuario)=>{
    if(!usuario){
      return Promise.reject();
    }
    return new Promise((resolve,reject)=>{
      if(!usuario.bloqueado){
      if(md5(password)!=usuario.password){
        reject();
      }else{
        resolve(usuario);
      }
    }else{
      reject();
    }
    });
  });
};
UserSchema.statics.findByToken=function(token){
  var Usuario=this;
  var decoded;

  try{
    decoded = jwt.verify(token,'trapsnote');
  }catch(e){
   console.log('errortoken');
   return Promise.reject();
  }
  return Usuario.findOne({
    'tokens.token':token,
    'tokens.access':'auth'
  });
};
//Constructor de usuarios
var Usuario = mongoose.model('Usuario', UserSchema);

module.exports = {Usuario};
