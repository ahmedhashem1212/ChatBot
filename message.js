const AssistantV1 = require('ibm-watson/assistant/v1');

    
const express = require('express');
const router = express.Router();
const  Session =require('./models/SessionModel')
const  Question =require('./models/QuestionModel')
const  Answer =require('./models/AnswerModel')
const  QA =require('./models/QAModel')

const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi);
 


const service = new AssistantV1({ 
  version: '2019-02-28',
  iam_apikey: 'w-nGLKKXnfGr-WWGmvWO30iCOxl7jom3yYHTsLAKvGax',
  url: 'https://gateway-lon.watsonplatform.net/assistant/api'
});

const ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3');

const toneAnalyzer = new ToneAnalyzerV3({
  version: '2017-09-21',
  iam_apikey: 'jkVy6-x9DPTcGDhNYZdxHNx3qbOXA0TCeKZZHp2DeHlJ',
  url: 'https://gateway-lon.watsonplatform.net/tone-analyzer/api'
});
//start session Input:UserId, FirstQuestion 
router.post('/start', async (req, res) => {
  const schema = {
		User:{id:Joi.number().required()} ,
		Question:{text: Joi.required()}
	}

  const result = Joi.validate(req.body, schema);
 if (result.error) return res.status(400).send({ 'StatusCode': 1044 });

const StartDate = new Date();
const sessionFound = await Session.findOne({ userId: req.body.User.id, endDate: null })
console.log(sessionFound)
if(sessionFound){
  res.status(400).send({'StatusCode':1011});
    
}else{



//   res.send(req.body.text) 
// var tones=[];
// const text = req.body.text;
// const toneParams = {
//   tone_input: { 'text': text },
//   content_type: 'application/json',
// };

// await toneAnalyzer.tone(toneParams)
//   .then(toneAnalysis => {
    //  (toneAnalysis);
//     tones = toneAnalysis.document_tone.tones
//   })
//   .catch(err => {
//      ('error:', err);
//   });
// var codeInt=0;
//  (tones)

// tones.forEach(myFunction);

// function myFunction(item) {
//   if(item.tone_name === 'Anger'){
//     codeInt=1;
//      (item)
//   } 
//   else if(item.tone_name === 'Fear'){
//   codeInt=2;
// }
// else if(item.tone_name === 'Confident'){
//   codeInt=3;
// }
// else if(item.tone_name === 'Sadness'){
//   codeInt=4;
// }
// else if(item.tone_name === 'Joy'){
//   codeInt=5;
// }
// else if(item.tone_name === 'Analytical'){
//   codeInt=6;
// }

// else if(item.tone_name === 'Tentative'){
//   codeInt=7;
// }

//   }

// if(await tones.filter(x => (x.tone_name === 'Anger'))){
//   codeInt=1;
//    (x)
// }
// else if(await tones.filter(item => (item.tone_name === 'Fear'))){
//   codeInt=2;
// }
// else if(await tones.filter(item => (item.tone_name === 'Confident'))){
//   codeInt=3;
// }
// else if(await tones.filter(item => (item.tone_name === 'Sadness'))){
//   codeInt=4;
// }
// else if(await tones.filter(item => (item.tone_name === 'Joy'))){
//   codeInt=5;
// }
// else if(await tones.filter(item => (item.tone_name === 'Analytical'))){
//   codeInt=6;
// }

// else if(await tones.filter(item => (item.tone_name === 'Tentative'))){
//   codeInt=7;
// }

var  session
    await service.message({
    workspace_id: 'c80c83c6-9cf7-4e8d-b047-6d246281f167',
    input: {'text':req.body.Question.text },
  //     context:{ 
     //     'tones':codeInt,
    // 'tonesTypes':tones
  // }
      })
      
      .then(async resp => {
      const question =await Question.create({'text':req.body.Question.text,'date':StartDate})
      const answer =await Answer.create({'text':resp.output.text[0],'date':StartDate})
      const qa =await QA.create({
      'Question':question,
      'Answer':answer}
      )
     
    
     session =await Session.create({
      'listOfQA':[qa],
      'userId':req.body.User.id,
      'startDate':StartDate,
      'endDate':null,
      'duration': null,
      'numberOfQuestionAndAnswer': 1
    })
   
     await res.send({'StatusCode':0,
     'Session':session});
     })
      .catch(err => {
        console.log(err);
    
        
      });
    
    
    }
  });



//  Inner messages Input: SessionId,Question 
router.post('/messages', async (req, res) => {
  const sessionId= req.body.Session.id
  
  const schema = {
		Session:{id:Joi.objectId().required()} ,
		Question:{text: Joi.required()}
	}

  const result = Joi.validate(req.body, schema);
 if (result.error) return res.status(400).send({ 'StatusCode': 1044 });

  const dateNow = new Date();
const sessionFound = await Session.findOne({ '_id': sessionId})
if(!sessionFound){
  res.status(400).send({'StatusCode':1011});
    
}else{
  const sessionFound2 = await Session.findOne({ '_id': sessionId, 'endDate': null })
  if(!sessionFound2){
    res.status(404).send({'StatusCode':1022})
  }else{
  await service.message({
  workspace_id: 'c80c83c6-9cf7-4e8d-b047-6d246281f167',
  input: {'text':req.body.Question.text },
//     context:{ 
 //     'tones':codeInt,
// 'tonesTypes':tones
// }
  })
  
  .then(async resp => {
    const question =await Question.create({'text':req.body.Question.text,'date':dateNow})
    const answer =await Answer.create({'text':resp.output.text[0],'date':dateNow})
    const qa =await QA.create({
    'Question':question,
    'Answer':answer}
    )
   const SessionUpdating = await Session.findOne({'_id':sessionId})
   const numberOfQuestionAndAnswer = SessionUpdating.numberOfQuestionAndAnswer
  await Session.updateOne({'_id':sessionId},{
    'numberOfQuestionAndAnswer':numberOfQuestionAndAnswer+1,
    $push :{
      'listOfQA':qa
    }
  })
  const session = await Session.findOne({ '_id': sessionId})
  res.send({'StatusCode':0,
  'Session':session});
  })
  .catch(err => {
    console.log(err);

    
  });
  

}}
});
//Close Session Innput :SessionId
router.post('/close', async (req, res) => {
    try{
  const schema = {
		Session:{id:Joi.objectId().required()} ,
	}

  const result = Joi.validate(req.body, schema);
 if (result.error) return res.status(400).send({ 'StatusCode': 1044 });

  const EndDate = new Date();

const sessionId = req.body.Session.id
const sessionFound = await Session.findOne({ '_id': sessionId})
if(!sessionFound){
  res.status(400).send({'StatusCode':1066});
    
}else{
  const sessionFound2 = await Session.findOne({ '_id': sessionId, 'endDate': null })
  if(!sessionFound2){
    res.status(404).send({'StatusCode':1022})
  }else{
 const session=  await Session.findOne({'_id':sessionId})
 
//  var mindiff = EndDate.getMinutes() - session.startDate.getMinutes();
//  var hourdiff = session.startDate.getHours() ;
//  if(mindiff < 0)
//  {
//   hourdiff = hourdiff - 1 ;
//   mindiff += 60 ;
//  }
//  else{
//  hourdiff = EndDate.getHours() - session.startDate.getHours();
//  }
var diff = Date.now() - session.startDate.getTime();
var seconds = diff/1000<1?0:diff/1000;
var minutes = diff/60000<1?0:diff/60000;
var hours = diff/3600000<1?0:diff/3600000;
let diffSeconds = Math.floor(seconds)/60
seconds = seconds%60
minutes = minutes+diffSeconds
let diffMinutes = Math.floor(minutes)/60
minutes = minutes%60
hours = hours +diffMinutes
 var duration = {
   'hours':hours,
   'minutes':minutes,
   'seconds':seconds
  //  if(endDate.getDate() < startDate.getDay())
  //  {
  //   new Date(new Date().getTime() - 2*24*(60*diff)*1000).toLocaleDateString()
  //  }
   
 }
console.log(duration)
await Session.updateOne({'_id':sessionId}, {'endDate':EndDate
,'duration':duration})
res.send({'StatusCode':0})

  }
}}catch(err){
  res.status(400).send(err.message)
}
});


//view Session
router.post('/view', async (req, res) => {
try{
  const schema = {
		Session:{id:Joi.objectId().required()} ,
	}

  const result = Joi.validate(req.body, schema);
  if (result.error) return res.status(400).send({ 'StatusCode': 1044 });

 const sessionId = req.body.Session.id
 const sessionFound = await Session.findOne({ '_id': sessionId})
 if(!sessionFound){
   res.status(400).send({'StatusCode':1066});
     
 }else{
   
    res.send({'StatusCode':0,
    'Session':sessionFound});
}}catch(err){
  res.status(400).send({'StatusCode':1055})

}
});

// //  Inner messages Input: SessionId,Question 
// router.post('/node', async (req, res) => {
//   const text = req.body.text;
  
//   const params = {
//     workspace_id: 'c80c83c6-9cf7-4e8d-b047-6d246281f167',
//     dialog_node: 'hamda',
//     conditions:   '$tones==1',
//     title: 'hamda'
//   };
  
//   service.createDialogNode(params)
//     .then(res => {
//       console.log(JSON.stringify(res, null, 2));
//     })
//     .catch(err => {
//       console.log(err)
//     });
//   res.send();
//   });
  //Close Session Innput :SessionId
  router.post('/viewAll', async (req, res) => {
  res.json(await Session.find())
  })
  module.exports = router