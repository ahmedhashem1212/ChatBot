const AssistantV1 = require('ibm-watson/assistant/v1');

    
const express = require('express');
const router = express.Router();
const  session =[
{
  "Id": 0,
  "ListOfQA": [
      {
          "id": 1,
          "Question":{
            "id":0,
            "text":"How are you",
            "date":""
          },

          "Answer": {
            "id":0,
            "text":"Hi I am Lirten tell me how can I help you today?",
            "date":""
          }
      }
  ],
  "UserId": 1,
  "StartDate": "2019-8-27 14:26:53",
  "EndDate": null
}];

const QA=[{
  Id :0,
  Question:{
Id:0,
Text:"", 
Date :0

  },
  Answer:{
    
Id:0, 
Text:"",
Date:"" 

  }
}

]



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
Id = session.length+1
const today = new Date();
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
const StartDate = date+' '+time;
let flag = false 
const sessionFound = session.find(function(element) {
  console.log(element.UserId)
  console.log(element.EndDate)
  if(element.UserId===req.body.User.id&&element.EndDate===null){
    flag =true
    return
  }
});
console.log(flag)
if(flag===true){
  res.status(400).send({"StatusCode":1011});
    
}else{
const Session={
  Id:Id,
  ListOfQA:[],
  UserId:req.body.User.id,
  StartDate:StartDate,
  EndDate:null
}
//   res.send(req.body.text) 
// var tones=[];
// const text = req.body.text;
// const toneParams = {
//   tone_input: { 'text': text },
//   content_type: 'application/json',
// };

// await toneAnalyzer.tone(toneParams)
//   .then(toneAnalysis => {
    // console.log(toneAnalysis);
//     tones = toneAnalysis.document_tone.tones
//   })
//   .catch(err => {
//     console.log('error:', err);
//   });
// var codeInt=0;
// console.log(tones)

// tones.forEach(myFunction);

// function myFunction(item) {
//   if(item.tone_name === "Anger"){
//     codeInt=1;
//     console.log(item)
//   } 
//   else if(item.tone_name === "Fear"){
//   codeInt=2;
// }
// else if(item.tone_name === "Confident"){
//   codeInt=3;
// }
// else if(item.tone_name === "Sadness"){
//   codeInt=4;
// }
// else if(item.tone_name === "Joy"){
//   codeInt=5;
// }
// else if(item.tone_name === "Analytical"){
//   codeInt=6;
// }

// else if(item.tone_name === "Tentative"){
//   codeInt=7;
// }

//   }

// if(await tones.filter(x => (x.tone_name === "Anger"))){
//   codeInt=1;
//   console.log(x)
// }
// else if(await tones.filter(item => (item.tone_name === "Fear"))){
//   codeInt=2;
// }
// else if(await tones.filter(item => (item.tone_name === "Confident"))){
//   codeInt=3;
// }
// else if(await tones.filter(item => (item.tone_name === "Sadness"))){
//   codeInt=4;
// }
// else if(await tones.filter(item => (item.tone_name === "Joy"))){
//   codeInt=5;
// }
// else if(await tones.filter(item => (item.tone_name === "Analytical"))){
//   codeInt=6;
// }

// else if(await tones.filter(item => (item.tone_name === "Tentative"))){
//   codeInt=7;
// }


    await service.message({
      workspace_id: 'c80c83c6-9cf7-4e8d-b047-6d246281f167',
      input: {'text':req.body.Question.text },
  //     context:{ 
     //     'tones':codeInt,
    // 'tonesTypes':tones
  // }
      })
      
      .then(resp => {
       Session.ListOfQA.push({"id":Session.ListOfQA.length+1,
       "Question":{"id":Session.ListOfQA.length+1,"text":req.body.text,"date":dateNow},
     "Answer":{"id":Session.ListOfQA.length+1,"text":resp.output.text,"date":dateNow}})
     
     })
      .catch(err => {
        console.log(err);
    
        
      });
      
      res.send({"StatusCode":0,
        "Session":Session});
    }
  });



//  Inner messages Input: SessionId,Question 
router.post('/messages', async (req, res) => {
  const today = new Date();
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
const dateNow = date+' '+time;
const sessionId= req.body.Session.id
const find = session.filter(function(x) {
  if(x.Id===sessionId){
    return x
  }
});
if(find.length===0){
  res.status(404).send({"StatusCode":1022})
}
else{
  const Session = find[0]
  if(Session.EndDate!=null){
    res.status(404).send({"StatusCode":1022})

  }else{

await service.message({
  workspace_id: 'c80c83c6-9cf7-4e8d-b047-6d246281f167',
  input: {'text':req.body.Question.text },
//     context:{ 
 //     'tones':codeInt,
// 'tonesTypes':tones
// }
  })
  
  .then(resp => {
     Session.ListOfQA.push({"id":Session.ListOfQA.length+1,
    "Question":{"id":Session.ListOfQA.length+1,"text":req.body.Question.text,"date":dateNow},
  "Answer":{"id":Session.ListOfQA.length+1,"text":resp.output.text[0],"date":dateNow}})
    
  })
  .catch(err => {
    console.log(err);

    
  });
  
  res.send({"StatusCode":0,
    "Session":Session});
}}
});
//Close Session Innput :SessionId
router.post('/close', async (req, res) => {
  const today = new Date();
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
const EndDate = date+' '+time;

const sessionId= req.body.Session.id
const find = session.filter(function(x) {
  if(x.Id===sessionId){
    return x
  }
});
if(find.length===0){
  res.status(404).send({"StatusCode":1022})
}
else{
  const Session = find[0]
  if(Session.EndDate!=null){
    res.status(404).send({"StatusCode":1022})

  }else{
  Session.EndDate=EndDate
  res.send({"StatusCode":0,
    "Session":Session});
}}
});
//view Session
router.post('/view', async (req, res) => {
 const sessionId= req.body.Session.id
const find = session.filter(function(x) {
  if(x.Id===sessionId){
    return x
  }
});
if(find.length===0){
  res.status(404).send({"StatusCode":1022})
}
else{
  const Session = find[0]
  if(Session.EndDate!=null){
    res.status(404).send({"StatusCode":1022})

  }else{
  res.send({"StatusCode":0,
    "Session":Session});
}}
});

//  Inner messages Input: SessionId,Question 
router.post('/node', async (req, res) => {
  const text = req.body.text;
  
  const params = {
    workspace_id: 'c80c83c6-9cf7-4e8d-b047-6d246281f167',
    dialog_node: 'hamda',
    conditions:   "$tones==1",
    title: 'hamda'
  };
  
  service.createDialogNode(params)
    .then(res => {
      console.log(JSON.stringify(res, null, 2));
    })
    .catch(err => {
      console.log(err)
    });
  res.send();
  });
  //Close Session Innput :SessionId
  
  module.exports = router