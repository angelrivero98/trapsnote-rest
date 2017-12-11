var mongoose = require("mongoose");

//Constructor de tareas
var Tarea = mongoose.model('Tarea', {
  descripcion: {
    type: String,

    //required (Validador): No crea la tarea a menos que tenga el campo de descripcion
    required: true,

    //minlength (Validador): Mínimo de caracteres o valores para poder crear el objeto
    minlength: 1,

    //trim (Validador): Elimina los espacios en blanco al pŕincipio y final de descripcion (quita que el nombre sea solo espacios en blanco)
    trim: true
  },
  username: {
    type: String,
  },
  completado: {
    type: Boolean,
    default: false
  },
  horaCompletado: {
    type: Number,
    default: null
  }
});

module.exports = {Tarea};
