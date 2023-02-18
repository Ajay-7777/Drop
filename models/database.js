import mongoose from 'mongoose'
import './files.js'
import * as dotenv from 'dotenv'
dotenv.config()
const MONGODB_URI=process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  console.log('Connected')
});
