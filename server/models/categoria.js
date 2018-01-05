var mongoose = require("mongoose");
var Categoria = mongoose.model('Categoria',{
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  activa:{
    type: Boolean,
    required:true,
    default : false
  },
  cont : {
    type : Number,
    default : 0
  }
});

module.exports= {Categoria};
