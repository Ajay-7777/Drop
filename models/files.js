import mongoose from 'mongoose'

 const filesdata = new mongoose.Schema({
  name: {
    type: String,
  },
  email:{
    type:String,
  },
  password:{
    type:String
  },
  data:{
    type:String
  }
});
const  files =mongoose.model('Filesdata',filesdata);
export  default  files;

