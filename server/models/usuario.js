var mongoose = require("mongoose");


const validator = require("validator");
const jwt = require('jsonwebtoken');
const _ =require('lodash');
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
    minlength: 1,
    trim: true,
    maxlength:50,
    validate:{
    validator: (value)=>{
          return validator.isAlphanumeric(value);
    },
    message: '{VALUE} la contraseña debe ser alfanumerica'
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
UserSchema.methods.toJSON=function(){
  var usuario=this;
  var userObject = usuario.toObject();
  return _.pick(userObject,['_id','username','name','last_name','email']);
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
//Constructor de usuarios
var Usuario = mongoose.model('Usuario', UserSchema);

module.exports = {Usuario};
