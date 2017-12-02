var mongoose = require("mongoose");


const validator = require("validator");
//Constructor de usuarios
var Usuario = mongoose.model('Usuario', {
  username: {
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
  }
});

module.exports = {Usuario};
