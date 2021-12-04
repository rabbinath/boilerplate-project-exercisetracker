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
  description:{type:String,required:true},
  duration:{type:Number,required:true},
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
  let UserDataObj=new Object()
  var UserData=[]
  let inputUsername=''
  let inputId =req.body[':_id']
  var objId=new ObjectId(inputId).ObjectId
  //let inputId =new mongodb.ObjectId(req.body['_id'])
  //let inputId =new req.body['_id']
  let inputDescription=req.body['description'];
  let inputDuration=req.body['duration'];
  let inputDate=req.body['date'];

  if(inputDescription == null || inputDescription.length == 0)
  {return};
  if(inputDuration == null || inputDuration.length == 0)
  { return};

  if(!inputDate){
   //inputDate=new Date().toISOString().slice(0, 10)
   inputDate=new Date().toDateString();
  }
  else
  {
    inputDate=new Date(inputDate).toDateString();
    if(inputDate=='Invalid Date'){
      return
      inputDate=new Date().toDateString();
    }
  }

  
  let userFoundArray=0   
  User.findOne({_id:inputId}, function(errById,userFound)
  {
  //  userFoundArray=userFound.length
   if(errById) return res.json({error: "Could not find user" });


var exerInput={
  _id:inputId,
  description:inputDescription,
  duration:inputDuration,
  date:inputDate
};


 if(userFound)
 {


//---Exercise.insertOne({_id:inputId,description:inputDescription,duration:inputDuration,date:inputDate},
Exercise.findOneAndUpdate(
  {_id:inputId},
  {$set:{
  username:userFound.username,
  description:exerInput.description,
  duration:exerInput.duration,
  date:exerInput.date,
  _id:inputId 
  }},
  {new:true,upsert:true},
  (errEx,svExcercise)=>{
    if(!errEx)
    {
      UserData.push(userFound)
      UserData.push(exerInput)
     // UserData.push(svExcercise)
      
    Log.findOne({})
    .sort({count:-1})
    .exec((err,countFound)=>
    {
      if(err) return res.json({error: "Could not counts" });
      var countNo=0
      if(!countFound || countFound.count === undefined || countFound.count === null )
      {
        countNo=1
      } else {  
        countNo=countFound.count+1
      }
///---------
Log.findById({_id:inputId},function(errId,resFind){
  if(errId) return res.json({error: "Log findById error" });
  if(!resFind || resFind === undefined || resFind === null ){
// // //---
      Log.findOneAndUpdate(
        {_id:inputId},
        {$set:{username:userFound.username,count:countNo,_id:inputId,
       log:{description: svExcercise.description,duration: svExcercise.duration,date: svExcercise.date},
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
  {_id: inputId },
  {$push: {log:{description:inputDescription,duration:inputDuration,date:inputDate}
}},
  // {$push: {"log": {"description":inputDescription,"duration":inputDuration,"date":inputDate}}},
  (errId,res)=>{
   // if(errId) return res.json({error: "Log findById error" });
    
  }
);
  }

  
})




// Log.updateMany(
//   {_id: new ObjectId(inputId) },
//   {$push: {log:{description:inputDescription,duration:inputDuration,date:inputDate}
// }},
//   // {$push: {"log": {"description":inputDescription,"duration":inputDuration,"date":inputDate}}},
//   (errId,res)=>{
//    // if(errId) return res.json({error: "Log findById error" });
    
//   }
// );
///---------

      // // //---
      // Log.findOneAndUpdate(
      //   {_id:inputId},
      //   {$set:{
      //   username:userFound.username,
      //   count:countNo,
      //   _id:inputId,
      //  log:{description: svExcercise.description,duration: svExcercise.duration,date: svExcercise.date},
      //   }},
      //   {new:true,upsert:true},
      //   (errlog,saveLog)=>{
      //     if(errlog) return res.json({error: "Log insert error" });
      //   }

      // )
      // // //--
    }
    
    
    )
    
 

    res.json({
      username: userFound.username,
      _id: userFound._id,
      description: svExcercise.description,
      duration: svExcercise.duration,
      date: svExcercise.date
      
    }
  

    )
///--

//  // userFound.push(exerInpput)
//   Exercise.findOneAndUpdate(
//     {_id : inputId},
//     {$set:{_id : inputId,description:inputDescription,duration:inputDuration,date:inputDate}},
//     {new:true,upsert:true},
//     (err,saveExcercise)=>{
//     if(!err){
//      UserData.push(userFound)
//      UserData.push(saveExcercise)

//     Log.findOne({})
//     .sort({count:-1})
//     .exec((err,countFound)=>
//     {
//       if(err) return res.json({error: "Could not counts" });
//       var countNo=0
//       if(!countFound || countFound.count === undefined || countFound.count === null ){
//         countNo=1
//       }
//       else
//       {
    
//         countNo=countFound.count+1
//       }
//       //---
//       Log.findOneAndUpdate(
//         {_id:inputId},
//         {$set:{
//         username:userFound.username,
//         count:countNo,
//         _id:inputId,
//        log:{description: saveExcercise.description,duration: saveExcercise.duration,date: saveExcercise.date},
//         }},
//         {new:true,upsert:true},
//         (errlog,saveLog)=>{
//           if(errlog) return res.json({error: "Log insert error" });
//         }

//       )
//       //--
//     })
    
 

//     // res.json({
//     //   _id: userFound._id,
//     //   username: userFound.username,
//     //   description: saveExcercise.description,
//     //   duration: saveExcercise.duration,
//     //   date: saveExcercise.date
//     // })

     
//     //  res.json({
//     //   _id: UserData['_id'],
//     //   username: UserData['username'],
//     //   description: UserData['description'],
//     //   duration: UserData['duration'],
//     //   date: UserData['date']
//     // })

//     // res.json(UserData)
     
     
//     //  var myJsonString = JSON.stringify(UserData);
//        //  var jsonArray = JSON.parse(JSON.stringify(UserData))
//       //   res.json(jsonArray)

//      //  res.json(userFound)
//        //userFound.push(saveExcercise)
//       // res.send(userFound.concat(saveExcercise))
//       }
//     }
//   )

}


  }

  )

  
 }

  })
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
