const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId; 
const mongodb = require('mongodb');

Binary = require('mongodb').Binary

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


let uri='mongodb+srv://rabbinath:'+ process.env.PW +'@cluster0.0zmv9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
mongoose.connect(uri,{useNewUrlParser: true,useUnifiedTopology: true});


let exerciseSchema=new mongoose.Schema(
  {
  username:{type:String},
  description:String,
  dusration:Number,
  date:Date
})

let userSchema=new mongoose.Schema(
{
  username: String
})

let logSchema=new mongoose.Schema(
{
  username: String,
  count: Number,
    log: [{
    description: String,
    duration: Number,
    date: Date
  }]
})

let Exercise=mongoose.model('Exercise',exerciseSchema)
let User=mongoose.model('User',userSchema)
let Log=mongoose.model('Log',logSchema)

app.post('/api/users',bodyParser.urlencoded({ extended: false }),function(req,res){
  let inputUsername=req.body['username'];
  let idUsername=0

  User.findOneAndUpdate(
    {username:inputUsername},
    {$set:{username:inputUsername}},
    {new:true,upsert:true},
    (err,saveUser)=>{
      if(!err){
      res.json(saveUser)
      }
    }
  )
})

app.get('/api/users',function(req,res){
  User.find({},(err,result)=>{
  if(!err){
    res.json(result)
    
  }}
)})

app.post('/api/users/:_id/exercises',bodyParser.urlencoded({ extended: false }),function(req,res){
  let inputUsername=''
  let inputId =req.body[':_id']
  var objId=new ObjectId(inputId).ObjectId
  //let inputId =new mongodb.ObjectId(req.body['_id'])
  //let inputId =new req.body['_id']
  let inputDescription=req.body['description'];
  let inputDuration=req.body['duration'];
  let inputDate=req.body['date'];
  if(!inputDate){
   inputDate=new Date().toISOString().slice(0, 10)
  }   
  User.findOne({_id:inputId}, function(errById,userFound){
   if(errById) return res.json({error: "Could not find user" });


const exerInpput={
  description:inputDescription,
  duration:inputDuration,
  date:inputDate
}


 if(userFound){
  userFound.push(exerInpput)
  Exercise.findOneAndUpdate(
    {_id : inputId},
    {$set:{_id : inputId,description:inputDescription,duration:inputDuration,date:inputDate}},
    {new:true,upsert:true},
    (err,saveExcercise)=>{

      if(!err){
        res.json(saveExcercise)
      }
    }
  )

}


  })
  
  
 }
 )
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
