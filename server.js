const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

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
  User.findOne({})
      .sort({username:1})
      .exec((errUser,resultUser) => 
      {
       // typeof resultUser!=='undefined' || resultUser!==null)
        if(!errUser &&  !resultUser)
        {
          inputUsername=resultUser.username
          idUsername=resultUser._id
        }
          if(!errUser)
          {
            User.findOneAndUpdate(
              {username:inputUsername},
              {new:true,upsert:true},
              (err,saveUser)=>{
                if(!err){
                 res.json(saveUser)
                }
              }
            )
          }
      }
      
        )
    


})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
