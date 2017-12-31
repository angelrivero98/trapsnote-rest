var mongoose = require("mongoose");
var validator = require("validator");

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
    required: true,
    minlength: 1,
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
    type: Number,
    default: 0
  },

  fechaRegistro: {
    type: Date,
    default: new Date ()
  },

  formaRegistro:{
    type: String,
    required : true,
    validate:{
      validator: formaCorrecta,
      message: 'Ingrese una forma de registro correcta'
    }
  },

  bloqueado: {
    type: Boolean,
    default: false
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

function formaCorrecta (value){
  if ((value === "web") || (value === "rest") || (value === "movil")) {return true; }
  else
  {return false;}
}

function serMayorDeEdad (value) {
  var hoy = new Date(); // Una variable para guardar la fecha actual
  if (((hoy.getFullYear()-value.getFullYear()) == 18 )&&(value.getMonth()== hoy.getMonth())){ // Se comprueba que aparte esta en el año "18" y esta en el mismo mes que la fecha actual
    if(value.getDate()>hoy.getDate()) return false; //Si esta un dia mas aparte de la fecha actual devuelve falso para que no pueda registrarse
  } else {
    if(((hoy.getFullYear()-value.getFullYear()) == 18 )&&(value.getMonth()>hoy.getMonth())) {return false;}  //Si esta en el año que es y ademas el mes de nacimiento esta despues del mes actual retorna falso
      else {
        if (((hoy.getFullYear()-value.getFullYear())< 18 )) return false; // Y por ultimo si es menor de 18 tampoco lo deja registrarse
      }
  }
return true;
};

UserSchema.methods.toJSON=function(){
  var usuario=this;
  var userObject = usuario.toObject();
  return _.pick(userObject,['_id','username','name','last_name','email','fechaDeNacimiento','intentos','bloqueado','fechaRegistro','formaRegistro']);
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
  var errormsg;
  if(validator.isEmail(email)){
  return Usuario.findOne({email}).then((usuario)=>{
    if(!usuario){
      errormsg=JSON.parse('{"errormsg":"El usuario no existe"}');
      return Promise.reject(errormsg);
    }
    return new Promise((resolve,reject)=>{
      if(!usuario.bloqueado){
      if(md5(password)!=usuario.password){
        errormsg=JSON.parse('{"errormsg":"Contraseña incorrecta"}');
        usuario.intentos++;
        if (usuario.intentos==5)usuario.bloqueado=true;
        usuario.save();
        reject(errormsg);
      }else{
        resolve(usuario);
      }
    }else{
      errormsg=JSON.parse('{"errormsg":"Su usuario se encuentra bloqueado"}');
      reject(errormsg);
    }
    });
  });
}else{
  var username=email;
  return Usuario.findOne({username}).then((usuario)=>{
    if(!usuario){
      errormsg=JSON.parse('{"errormsg":"El usuario no existe"}');
      return Promise.reject(errormsg);
    }
    return new Promise((resolve,reject)=>{
      if(!usuario.bloqueado){
      if(md5(password)!=usuario.password){
        errormsg=JSON.parse('{"errormsg":"Contraseña incorrecta"}');
        usuario.intentos++;
        if (usuario.intentos==5)usuario.bloqueado=true;
        usuario.save();
        reject(errormsg);
      }else{
        resolve(usuario);
      }
    }else{
      errormsg=JSON.parse('{"errormsg":"Su usuario se encuentra bloqueado"}');
      reject(errormsg);
    }
    });
  });

};
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
