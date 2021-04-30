let genClick = new Audio('audio/mfx_tic33.mp3');
let sndCorrect = new Audio('audio/535840__evretro__8-bit-mini-win-sound-effect.mp3');
let sndIncorrect = new Audio('audio/450616__breviceps__8-bit-error.mp3');

let Qcontainer = document.getElementById('q-text');
let Acontainer = document.getElementById('a-text');
let CBcontainer = document.getElementById('cont');
let ANIMcontainer = document.getElementById('q-sheet');

let xml = '';
let numQuestions = 0;
let qNum = 0;

// init scorm

pipwerks.SCORM.init();

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
  questionBlock.className = 'nes-balloon from-right';
  questionBlock.innerText = questionData[qNum].getAttribute('txt');
  Qcontainer.appendChild(questionBlock);
  gsap.from(Qcontainer, {opacity: 0, scale: 0.2, duration: 1, delay: 1, ease: "expo", onComplete: animQuestion});
  
  //extract answers text and display

  let answerData = x.children[0].children[qNum].getElementsByTagName('answer');

  for(let i=0; i<answerData.length; i++){
    let answerList = document.createElement('button');
    answerList.className = 'answer nes-btn is-primary';
    answerList.setAttribute('id', answerData[i].getAttribute('id'));
    answerList.setAttribute('onmouseover', 'btnBig(this)');
    answerList.setAttribute('onmouseout', 'btnSm(this)');
    answerList.addEventListener('click', checkIfCorrect, false);
    answerList.innerText = answerData[i].innerHTML;
    Acontainer.appendChild(answerList);
    gsap.from(answerList, {opacity: 0, scale: 0.8, duration: 0.8, delay: 3 + (i * 0.1), ease: "expo"});
  }
}

// check if the correct answer selected

function checkIfCorrect(){
  genClick.play();

  let isCorrect = this.getAttribute('id');
  let clicked = this;

  if(isCorrect == 'correct'){
    correct();
  }else{
    incorrect(clicked);
  }
}

// if correct, do this

function correct(){
  sndCorrect.play();

  let isCorrect = document.getElementById('correct');
  isCorrect.className = 'buttonCorrect nes-btn is-success';

  let remContainer = document.getElementById('a-text');
  let remCount = remContainer.children.length;

  for(let i=0; i<remCount; i++){
    remContainer.children[i].removeEventListener('click', checkIfCorrect);
    if(remContainer.children[i].id == 'null'){
      remContainer.children[i].className = 'buttonGrey nes-btn is-disabled';
    }
  }

  showContButton();
  animSuccess();
}

// if incorrect, do this

function incorrect(x){
  sndIncorrect.play();

  let isCorrect = document.getElementById('correct');
  isCorrect.className = 'buttonCorrect nes-btn is-success';
  
  let remContainer = document.getElementById('a-text');
  let remCount = remContainer.children.length;

  for(let i=0; i<remCount; i++){
    remContainer.children[i].removeEventListener('click', checkIfCorrect);
    if(remContainer.children[i].id == 'null'){
      remContainer.children[i].className = 'buttonGrey nes-btn is-disabled';
    }
  }

  x.className = 'buttonIncorrect nes-btn is-error';

  showContButton();
  animFail();
}

// display continue button

function showContButton(){
  let contBtn = document.createElement('button');
  contBtn.innerHTML = "Continue";
  contBtn.setAttribute('id', 'continueButton');
  contBtn.className = 'nes-btn is-primary';
  contBtn.addEventListener('click', animElementsOff, false);
  CBcontainer.appendChild(contBtn);
  gsap.from(contBtn, {opacity: 0, scale: 0.6, duration: 0.6, delay: 1.5, ease: "expo"});
}

// animate all elements off screen

function animElementsOff(){
  animIdle();
  genClick.play();

  let animOff = document.getElementById('question');
  gsap.to(animOff, {opacity: 0, scale: 0.4, duration: 0.5, ease: "back.in"});

  let remContainer = document.getElementById('a-text');
  let remCount = remContainer.children.length;

  for(let i=0; i<remCount; i++){
    gsap.to(remContainer.children[i], {opacity: 0, scale: 0.4, duration: 0.5, delay: 0.5 + (i * 0.1), ease: "back.in"});
  }

  let animContOff = document.getElementById('continueButton');
  gsap.to(animContOff, {opacity: 0, scale: 0.4, duration: 0.5, delay: 1.5, ease: "back.in", onComplete: removeOldQuestion});
}

// remove the question and answers and load 
// next question or final screen

function removeOldQuestion(){
  document.getElementById('question').remove();
  document.getElementById('continueButton').remove();
  
  let remContainer = document.getElementById('a-text');
  let remCount = remContainer.children.length;

  for(let i=0; i<remCount; i++){
    remContainer.firstChild.remove();
  }
  
  if(qNum == numQuestions - 1){

    
    pipwerks.SCORM.status("set", "completed");
    pipwerks.SCORM.quit();


    animSuccess();
    let finalDiv = document.createElement('h1');
    finalDiv.className = 'nes-balloon from-right';
    finalDiv.innerText = 'Way to go champ! You finished!!';
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

// =======================================================
// =============== ANIMATION TRIGGERS ====================
// =======================================================

function animIdle(){
  ANIMcontainer.className = 'a-idle';
}

function animQuestion(){
  ANIMcontainer.className = 'a-question';
}

function animSuccess(){
  ANIMcontainer.className = 'a-success';
}

function animFail(){
  ANIMcontainer.className = 'a-fail';
}