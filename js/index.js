let Qcontainer = document.getElementById('q-text');
let Acontainer = document.getElementById('a-text');

let xml = '';
let numQuestions = 0;
let qNum = 0;

// loading the XML

document.addEventListener('DOMContentLoaded', ()=>{
  let url = 'question_content.xml';
  fetch(url)
  .then(response=>response.text())
  .then(data=>{
    let parser = new DOMParser();
    xml = parser.parseFromString(data, "application/xml");
    buildQuestionElements(xml);

    let qCount = xml.children[0].getElementsByTagName('question');
    numQuestions = qCount.length;
  });
})

function buildQuestionElements(x){

  // extract question text and display

  let questionData = x.children[0].getElementsByTagName('question');
  let questionBlock = document.createElement('h1');
  questionBlock.setAttribute('id', 'question');
  questionBlock.innerText = questionData[qNum].getAttribute('txt');
  Qcontainer.appendChild(questionBlock);
  gsap.from(Qcontainer, {opacity: 0, scale: 0.2, duration: 2, delay: 1, ease: "elastic.out(1, 0.4)"});
  
  //extract answers text and display

  let answerData = x.children[0].children[qNum].getElementsByTagName('answer');

  for(let i=0; i<answerData.length; i++){
    let answerList = document.createElement('button');
    answerList.className = 'answer';
    answerList.setAttribute('id', answerData[i].getAttribute('id'));
    answerList.setAttribute('onmouseover', 'btnBig(this)');
    answerList.setAttribute('onmouseout', 'btnSm(this)');
    answerList.addEventListener('click', checkIfCorrect, false);
    answerList.innerText = answerData[i].innerHTML;
    Acontainer.appendChild(answerList);
    gsap.from(answerList, {opacity: 0, scale: 0.8, duration: 0.8, delay: 3 + (i * 0.1), ease: "elastic"});
  }
}

// check if the correct answer selected

function checkIfCorrect(){
  let isCorrect = this.getAttribute('id');
  //**** remove eventlistener ****
  if(isCorrect == 'correct'){
    correct();
  }else{
    incorrect();
  }
}

// if correct, do this

function correct(){
  //**** add check to correct ****
  //**** change id of other choices to grey them out ****
  //**** scale down incorrect choices by 0.98 ****
  //**** play correct sound ****
  //**** add continue button ****
  removeOldQuestion();
}

// if incorrect, do this

function incorrect(){
  //**** add check to correct ****
  //**** add X to incorrect ****
  //**** change id of other choices to grey them out ****
  //**** scale down incorrect choices by 0.98 ****
  //**** play incorrect sound ****
  //**** add continue button ****
  removeOldQuestion();  
}

// remove the question and answers and load 
// next question or final screen

function removeOldQuestion(){
  document.getElementById('question').remove();
  
  let remContainer = document.getElementById('a-text');
  let remCount = remContainer.children.length;

  for(let i=0; i<remCount; i++){
    remContainer.firstChild.remove();
  }
  
  if(qNum == numQuestions - 1){
    let finalDiv = document.createElement('h1');
    finalDiv.innerText = 'Congrats! You are done!';
    Qcontainer.appendChild(finalDiv);
  }else{
    qNum = qNum + 1;
    buildQuestionElements(xml);
  }
} 

function btnBig(btn){
  gsap.to(btn, {scale: 0.98, duration: 0.5, ease: "expo"});
}

function btnSm(btn){
  gsap.to(btn, {scale: 1.0, duration: 0.5, ease: "expo"});
}