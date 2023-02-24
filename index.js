import express from 'express'
import * as dotenv from 'dotenv'
dotenv.config()
import fileUpload from "express-fileupload"

import { uploadObject,DownloadObjects } from "./up.js"
import cookieParser from 'cookie-parser'
import './models/database.js'
import files from './models/files.js'
const app = express();


app.use(fileUpload());
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

import { OAuth2Client } from 'google-auth-library';
let CLIENT_ID = "99374051558-r1kkeqccgt3d59fk7qofe23kf8cn58oa.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

app.get('/', (req, res) => {
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate')
    .set('Pragma', 'no-cache')
    .set('Expires', '0')
    .render('login')
})


app.post('/dashboard', async (req, res) => {
    let token = req.cookies['session-token'];
    // console.log(token)
let user={};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        // const userid = payload['sub'];
        if (payload.email_verified) {
            let result = await files.find({ email: payload.email })
            let d = await files.find({ 
                email:payload.email,
                data:req.files.file.name });
                if(d.length<1){
            let newfile = new files({
                name: payload.name,
                email: payload.email,
                password: payload.at_hash,
                data: req.files.file.name
            })
            newfile.save();}
           user.email=payload.email;
        }
    }
    try {
        await verify();
        let links=await uploadObject(req.files.file.name, req.files.file.data,user.email);        
        return res.status(200)
        .set('Cache-Control', 'no-cache, no-store, must-revalidate')
        .set('Pragma', 'no-cache')
        .set('Expires', '0')
       .render("dashboard",{links});
    } catch (error) {
        console.error(error);
        
        res.status(500).send('An error occurred');
    }
})

app.get('/login', (req, res) => {
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate')
    .set('Pragma', 'no-cache')
    .set('Expires', '0')
    .render('login');

})
app.get('/dashboard/:filename',checkAuthenticated, (req, res) => {
  console.log(req.params.filename)
  DownloadObjects(req.params.filename,res);
  return;   
})
app.post('/login', async (req, res) => {

    let token = req.body.token;
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        // const userid = payload['sub'];
        if (payload.email_verified) {
            let result = await files.find({ email: payload.email })
            if (result.length < 1) {
                let newfile = new files({ 
                    name: payload.name,
                    email: payload.email,
                    password: payload.at_hash,
                    data: ""
                })
                newfile.save();
                console.log("newfile", newfile)
            }
        }

    }
    verify().then(() => {

        res.cookie('session-token', token);
        res.send('success');
    })
        .catch(console.error);

})

app.get('/dashboard', checkAuthenticated, async (req, res) => {
    let user = req.user;
    let links = [];
    let ress = await files.find({ email: user.email });
    ress.forEach ((ele) => {

        if (ele.data.length > 0) {
          
            links.push(ele.data);
        }
    })
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate')
    .set('Pragma', 'no-cache')
    .set('Expires', '0')
    .render('dashboard', { user,links });
})


function checkAuthenticated(req, res, next) {

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
        user.email_verified = payload.email;

    }

    verify().then(() => {

        req.user = user;
        next();
    })
        .catch(err => {
            res.render('login')
        })

}

// app.get('/logout', (req, res) => { 
//     try{
//     res.clearCookie('session-token')  
//     res.status(200).render('login');
//     statuscode=200;
// }
// catch{
//     res.status(500);
//     }
// })
app.get('/logout', (req, res) => { 
    try {
      res.clearCookie('session-token');  
      res.status(200)
         .set('Cache-Control', 'no-cache, no-store, must-revalidate')
         .set('Pragma', 'no-cache')
         .set('Expires', '0')
         .render('login');
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  });
  
  
app.listen(3000, () => {
    console.log("app running");
});
 


