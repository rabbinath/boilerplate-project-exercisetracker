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
 userid:{type:String},
  username:{type:String, required:true, unique:false},
  description:{type:String,required:true},
  duration:{type:Number,required:true},
  date:{type:String, required:false}
})

let userSchema=new mongoose.Schema(
{
  username: { type: String, required: true, unique: false }
})

let logSchema=new mongoose.Schema(
{
  username: String,
  count: Number,
    log: [{
    description: String,
    duration: Number,
    date:{type:String}
  }]
})

let Exercise=mongoose.model('Exercise',exerciseSchema)
let User=mongoose.model('User',userSchema)
let Log=mongoose.model('Log',logSchema)

app.post('/api/users',bodyParser.urlencoded({ extended: false }),function(req,res){
  let inputUsername=req.body['username'];
  

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

 app.post('/api/users/:_id/exercises',bodyParser.urlencoded({ extended: false }),  function(req,res)
{
  var countNo=0
  let UserDataObj=new Object()
  var UserData=[]
  let inputUsername=''
  //req.params.userId || req.body.userId;
  let inputId =req.body[':_id'] 
  if (inputId.length==12 || inputId.length==24)
    {    
    }
    else{return}

  if(ObjectId(inputId).ObjectId){
    return
      }
  //let inputId =new mongodb.ObjectId(req.body['_id'])
  //let inputId =new req.body['_id']
  let inputDescription=req.body['description'];
  let inputDuration=req.body['duration'];
  let inputDate=req.body['date'];

  if(inputDescription == null || inputDescription.length == 0)
  {return};
  if (isNaN(inputDuration))
  {
return
  }
  // if(typeof inputDuration === 'number'){
  //   return  };
  if(inputDuration == null || inputDuration.length == 0)
  { return};

  //let testDate=new Date(inputDate).toLocaleDateString('en-US', {weekday: "short" , month:"short", day:"numeric",year:"numeric"})
  if(!inputDate){
   //inputDate=new Date().toISOString().slice(0, 10)
   inputDate=new Date().toDateString();
  }
  else
  {
    inputDate=new Date(inputDate).toDateString();
    if(inputDate=='Invalid Date'){
      return
    //  inputDate=new Date().toDateString();
    }
  }

  
  let userFoundArray=0   
  User.findOne({_id:inputId}, async function(errById,userFound)

  {
  //  userFoundArray=userFound.length
   if(errById) return res.json({error: "Could not find user" });


var exerInput={
    description:inputDescription,
  duration:inputDuration,
  date:inputDate,
  userid:inputId
};


 if(userFound)
 {


//-------------

  Exercise.create({userid:inputId,
    username:userFound.username,
    description:exerInput.description,
    duration:exerInput.duration,
    date:exerInput.date
    
    })

    UserData.push(userFound)
    UserData.push(exerInput)
  
    
 

    countNo =   await Exercise.countDocuments({userid:inputId}, function(err,resCount){
      if (err)
      {
        return
      }
      else
      {
        countNo=resCount
      }
     });
      // Exercise.countDocuments({userid:inputId},  function(err,resCount){
      // if (err)  return res.json({error: "count error" });
      // else
      // {
      //  // countNo=res.count+1
      //   countNo= resCount;
//------------log start
await Log.findById({_id:inputId},function(errId,resFind){
  if(errId) return res.json({error: "Log findById error" });
  if(!resFind || resFind === undefined || resFind === null ){
// // //---
      Log.findOneAndUpdate(
        {_id:inputId},
        {$set:{username:userFound.username,count:countNo,_id:inputId,
       log:{description: exerInput.description,duration: exerInput.duration,date: exerInput.date},
        }},
        {new:true,upsert:true},
        (errlog,saveLog)=>{
          if(errlog) return res.json({error: "Log insert error" });
        }

      )
      // // //--
  }
  else
  {
 Log.updateMany(
  {_id: inputId },{$set:{count:countNo}},
  {$push: {log:{description: exerInput.description,duration:exerInput.duration,date:exerInput.date}
}},
  
  (errId,res)=>{
    
  }
);
  }

  
});

//------------log end





    //   }
    // })


 

    res.json({
      username: userFound.username,
      _id: userFound._id,
      description:exerInput.description,
      duration: exerInput.duration,
      date:exerInput.date})


//-----------
}
  }

);
});


app.get('/api/users/:_id/logs',function(req,res){
  let getId=req.params._id;
Log.find({_id:getId},(err,result)=>{
  if(!err){
    res.json(result)  
  }
}
)})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
