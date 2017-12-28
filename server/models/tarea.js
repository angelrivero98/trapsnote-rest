var mongoose = require("mongoose");
const validator = require("validator");
//Constructor de tareas
var Tarea = mongoose.model('Tarea', {
  nombre: {
    type: String,
    required: true,
    minlength:1,
    maxlength:255,
    trim: true
  },
  descripcion: {
    type: String,
    //required (Validador): No crea la tarea a menos que tenga el campo de descripcion
    required: true,
    //minlength (Validador): Mínimo de caracteres o valores para poder crear el objeto
    minlength: 1,
    maxlength:255,
    //trim (Validador): Elimina los espacios en blanco al pŕincipio y final de descripcion (quita que el nombre sea solo espacios en blanco)
    trim: true
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
      message: 'La fecha limite tiene que ser despues de la fecha actual' //Si no es mayor de edad te devuelve un error con el msj
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
