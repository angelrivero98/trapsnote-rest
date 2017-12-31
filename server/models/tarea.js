var mongoose = require("mongoose");
const validator = require("validator");
//Constructor de tareas
var Tarea = mongoose.model('Tarea', {
  nombre: {
    type: String,
    required: true,
    minlength:1,
    maxlength:255,
    trim: true,
    validate:{
    validator: (value)=>{
          return validator.isAlphanumeric(value);
    },
    message: '{VALUE} El nombre debe ser alfanumerica'
    }
  },
  descripcion: {
    type: String,
    required: true,
    minlength: 1,
    maxlength:255,
    trim: true,
    validate:{
    validator: (value)=>{
          return validator.isAlphanumeric(value);
    },
    message: '{VALUE} La descripcion debe ser alfanumerica'
    }
  },
  categoria: {
    type:String,
    trim: true,
    required: true,
    minlength: 1
  },
  username: {
    type: String
  },
  completado: {
    type: Boolean,
    default: false
  },
  fechaLimite: {
    type: Date,
    default: null,
    validate:{
      validator: fechaInvalida,  //Llamo a la funcion que me permite verificar si es mayor de edad
      message: '{VALUE} La fecha limite tiene que ser despues de la fecha actual' //Si no es mayor de edad te devuelve un error con el msj
    }
  },
  fechaRegistro: {
    type: Date
  }
});

function fechaInvalida (value) {
  if (value < new Date ()) return false;
}
module.exports = {Tarea};
