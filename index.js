import express from 'express'
import * as dotenv from 'dotenv'
dotenv.config()
import fileUpload from "express-fileupload"
import{uploadObject,listObjects,deleteObject} from "./up.js"
import cookieParser from 'cookie-parser'
import './models/database.js'
import files from './models/files.js'
const app = express();


app.use(fileUpload());
app.use(express.json());
app.use(cookieParser()); 
app.set('view engine','ejs');

import {OAuth2Client}  from 'google-auth-library';
let CLIENT_ID="99374051558-r1kkeqccgt3d59fk7qofe23kf8cn58oa.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

app.get('/',(req,res)=>{
res.render('login')
})
  
// app.get('/files',async (req,res)=>{
  
//    let links = await listObjects();
   
//    res.json(links)
// })


app.post('/upload',async (req,res)=>{
    let token = req.cookies['session-token'];
    // console.log(token)
    
      
      
    async function verify() {
        const ticket = await client.verifyIdToken({  
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        // const userid = payload['sub'];
        if(payload.email_verified){
            let result=await files.find({email:payload.email})
                    
                let newfile = new files({
                    name:payload.name,
                    email:payload.email,
                    password: payload.at_hash,
                    data:req.files.file.name
                })
                newfile.save();
                console.log("newfile",newfile)
        }
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        // console.log(payload)
      }
      verify()
      .catch(console.error);
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        // console.log(payload)
    uploadObject(req.files.file.name,req.files.file.data);
   res.redirect('/dashboard');
 })

app.get('/login',(req,res)=>{
    res.render('login');

})
app.post('/login',async (req,res)=>{
  
    let token=req.body.token;
    console.log(req.body)
    
      
      
    async function verify() {
        const ticket = await client.verifyIdToken({  
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        // const userid = payload['sub'];
        if(payload.email_verified){
            let result=await files.find({email:payload.email})
                    if(result.length<1){
                let newfile = new files({
                    name:payload.name,
                    email:payload.email,
                    password: payload.at_hash,
                    data:""
                })
                newfile.save();
                console.log("newfile",newfile)
            }
        }
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        // console.log(payload)
      }
      verify().then(()=>{

        res.cookie('session-token',token);
        res.send('success');
      })
      .catch(console.error);
     
})

app.get('/dashboard',checkAuthenticated,async (req,res)=>{
    let user=req.user;
    let links=[];
    let ress=await files.find({email:user.email})
        ress.forEach((ele)=>{ 
            if(ele.data.length>0){
            links.push("https://aws-bucketnode.s3.amazonaws.com/" + ele.data);}
    })
    res.render('dashboard',{user,links});
})

function checkAuthenticated(req, res, next){

    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
        user.email_verified=payload.email;
         
      }
     
verify().then(()=>{

          req.user = user;
          next();
      })
      .catch(err=>{
          res.redirect('/login')
      })

}

// app.get('/protectedroute',checkAuthenticated,async (req,res)=>{

// let token = req.cookies['session-token'];

// async function verify() {
//     const ticket = await client.verifyIdToken({
//         idToken: token,
//         audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
//     });
//     const payload = ticket.getPayload();
//     return payload;
//   }
//  let x= await verify();
 
// if(x.email_verified){
// let result=await files.find({email:x.email})
//         if(result.length<1){
//     files.insertMany({
//         name:x.name,
//         email:x.email,
//         password: x.at_hash,
//     })
//     let r = await files.find({
//         email:x.email
//     })
//     let tkn=jwt.sign({id:r._id},secret);
//         res.send({
//             auth:true,
//             token:tkn
//         })
  
//         }else{
//             let tokn=jwt.sign({id:result._id},secret);
//             res.send({
//                 auth:true,
//                 token:tokn
//             })
//         }

   
// }
// })
app.get('/logout',(req,res)=>{
    res.clearCookie('session-token');
    res.redirect('/login');
})
app.listen(3000,()=>{ 
    console.log("app running");
});


