var genClick = new Howl({src: ['audio/mfx_tic33.mp3']});
var sndCorrect = new Howl({src: ['audio/535840__evretro__8-bit-mini-win-sound-effect.mp3']});
var sndIncorrect = new Howl({src: ['audio/450616__breviceps__8-bit-error.mp3']});
var sndComplete = new Howl({src: ['audio/complete.mp3']});
// var bgLoop = new Howl({src: ['audio/bg_loop2.ogg'],loop: true,});

let Qcontainer = document.getElementById('q-text');
let Acontainer = document.getElementById('a-text');
let CBcontainer = document.getElementById('cont');
let STARTbutton = document.getElementById('start');
let STARTcontainer = document.getElementById('start-container');
let ANIMcontainer = document.getElementById('q-sheet');

let xml = '';
let numQuestions = 0;
let qNum = 0;
let multiClicked = false;

// init scorm

pipwerks.SCORM.init();

// loading the XML

document.addEventListener('DOMContentLoaded', ()=>{let url = 'question_content.xml';
  fetch(url)
  .then(response=>response.text())
  .then(data=>{
    let parser = new DOMParser();
    xml = parser.parseFromString(data, "application/xml");
    // buildQuestionElements(xml);
    startPage(xml);

    let qCount = xml.children[0].getElementsByTagName('question');
    numQuestions = qCount.length;
  });
})

// start page

function startPage(xml){
  let startBtn = document.createElement('button');
  startBtn.innerHTML = "Begin";
  startBtn.className = 'btn-global';
  startBtn.addEventListener('click', function (){
    beginQuiz(xml);
  });
  startBtn.setAttribute('onmouseover', 'btnBig(this)');
  startBtn.setAttribute('onmouseout', 'btnSm(this)');
  STARTbutton.appendChild(startBtn);
}

// load questions and begin the quiz

function beginQuiz(xml){
  genClick.play();
  buildQuestionElements(xml);
  // bgLoop.play();
  gsap.to(STARTcontainer, {opacity: 0, duration: 2, ease: "expo", onComplete: remStart});
}

// remove the start page

function remStart(){
  STARTcontainer.remove();
}

function buildQuestionElements(x){

  // extract question text and display

  let questionData = x.children[0].getElementsByTagName('question');
  let questionBlock = document.createElement('h1');
  questionBlock.setAttribute('id', 'question');
  questionBlock.className = 'balloon balloon-right';
  questionBlock.innerText = questionData[qNum].getAttribute('txt');
  Qcontainer.appendChild(questionBlock);
  gsap.from(Qcontainer, {opacity: 0, scale: 0.2, duration: 1, delay: 1, ease: "expo", onComplete: animQuestion});

  let qType = questionData[qNum].getAttribute('type');

  if(qType == 'multi'){
    let qPrompt = document.createElement('div');
    qPrompt.setAttribute('id', 'q-prompt');
    let qText = document.createTextNode("Select all that apply.");
    qPrompt.appendChild(qText);
    Acontainer.appendChild(qPrompt);
    gsap.from(qPrompt, {opacity: 0, duration: 0.8, delay: 2.5, ease: "expo"});
  }
  
  //extract answers text and display

  let answerData = x.children[0].children[qNum].getElementsByTagName('answer');

  for(let i=0; i<answerData.length; i++){
    let answerList = document.createElement('button');
    
    if(qType == 'single'){
      // console.log('SINGLE');
      answerList.className = 'answer btn-global';
      answerList.setAttribute('id', answerData[i].getAttribute('id'));
      answerList.setAttribute('onmouseover', 'btnBig(this)');
      answerList.setAttribute('onmouseout', 'btnSm(this)');
      answerList.addEventListener('click', checkIfCorrect, false);
    }else if(qType == 'multi'){
      // console.log('MULTI');
      answerList.className = 'answer multi-global btn-multi';
      answerList.setAttribute('id', answerData[i].getAttribute('id'));
      answerList.setAttribute('onmouseover', 'multiHover(this)');
      answerList.setAttribute('onmouseout', 'multiOut(this)');
      answerList.setAttribute('wasClicked', 'false');
      answerList.addEventListener('click', multiChoiceClicked, false);
    }else{
      // console.log('OTHER');
    }

    // answerList.addEventListener('click', checkIfCorrect, false);
    answerList.innerText = answerData[i].innerHTML;
    Acontainer.appendChild(answerList);
    gsap.from(answerList, {opacity: 0, scale: 0.8, duration: 0.8, delay: 3 + (i * 0.1), ease: "expo"});
  }
}

// =======================================================
// ==================== MULTI SELECT =====================
// =======================================================

function multiChoiceClicked(){
  if(multiClicked == false){
    showSubmitButton();
  }

  multiClicked = true;

  genClick.play();
  
  let cStatus = this.getAttribute('wasClicked');
  
  if(cStatus == 'false'){
    this.className = 'answer multi-global btn-multi-selected';
    this.setAttribute('wasClicked', 'true');
    this.removeAttribute('onmouseover');
    this.removeAttribute('onmouseout');
  }else{
    this.classList.remove('btn-multi-selected');
    this.className = 'answer multi-global btn-multi';
    this.setAttribute('wasClicked', 'false');
    this.setAttribute('onmouseover', 'multiHover(this)');
    this.setAttribute('onmouseout', 'multiOut(this)');
  }
}

function showSubmitButton(){
  let submitBtn = document.createElement('button');
  submitBtn.innerHTML = "Submit";
  submitBtn.setAttribute('id', 'continueButton');
  submitBtn.className = 'btn-util';
  submitBtn.addEventListener('click', checkMultiCorrect, false);
  submitBtn.setAttribute('onmouseover', 'btnBig(this)');
  submitBtn.setAttribute('onmouseout', 'btnSm(this)');
  CBcontainer.appendChild(submitBtn);
  gsap.from(submitBtn, {opacity: 0, scale: 0.6, duration: 0.6, ease: "expo"});
}

function checkMultiCorrect(){
  let submitBtn = document.getElementById('continueButton');
  gsap.to(submitBtn, {opacity: 0, scale: 0.6, duration: 0.6, ease: "expo", onComplete: removeSubmit});

  let remContainer = document.getElementById('a-text');
  let remCount = remContainer.children.length;

  let anyCorrect = true;

  for(let i=0; i<remCount; i++){
    if(remContainer.children[i].id == 'correct' && remContainer.children[i].getAttribute('wasClicked') == 'true'){
      remContainer.children[i].className = 'buttonCorrect multi-global btn-multi-selected_correct btn-kill-pointer';
    }else if(remContainer.children[i].id == 'null' && remContainer.children[i].getAttribute('wasClicked') == 'true'){
      anyCorrect = false;
      remContainer.children[i].className = 'buttonIncorrect multi-global btn-multi-selected_incorrect btn-kill-pointer';
    }else if(remContainer.children[i].id == 'correct' && remContainer.children[i].getAttribute('wasClicked') == 'false'){
      anyCorrect = false;
      remContainer.children[i].className = 'buttonIncorrect multi-global btn-multi-up_incorrect btn-kill-pointer';
    }
  }
  if(anyCorrect == true){
    sndCorrect.play();
    animSuccess();
  }else{
    sndIncorrect.play();
    animFail();
  }
}

function removeSubmit(){
  document.getElementById('continueButton').remove();
  showContButton();
  multiClicked = false;
}

function multiHover(btn){
  btn.className = 'answer multi-global btn-multi-hover';
}

function multiOut(btn){
  btn.className = 'answer multi-global btn-multi';
}

// =======================================================
// ==================== SINGLE SELECT ====================
// =======================================================

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
  isCorrect.className = 'buttonCorrect btn-global btn-success btn-kill-pointer';
  isCorrect.removeAttribute('onmouseover');
  isCorrect.removeAttribute('onmouseout');

  let remContainer = document.getElementById('a-text');
  let remCount = remContainer.children.length;

  for(let i=0; i<remCount; i++){
    remContainer.children[i].removeEventListener('click', checkIfCorrect);
    if(remContainer.children[i].id == 'null'){
      remContainer.children[i].className = 'buttonGrey btn-global btn-disabled';
      remContainer.children[i].removeAttribute('onmouseover');
      remContainer.children[i].removeAttribute('onmouseout');
    }
  }

  showContButton();
  animSuccess();
}

// if incorrect, do this

function incorrect(x){
  sndIncorrect.play();

  let isCorrect = document.getElementById('correct');
  isCorrect.className = 'buttonCorrect btn-global btn-success btn-kill-pointer';
  isCorrect.removeAttribute('onmouseover');
  isCorrect.removeAttribute('onmouseout');
  
  let remContainer = document.getElementById('a-text');
  let remCount = remContainer.children.length;

  for(let i=0; i<remCount; i++){
    remContainer.children[i].removeEventListener('click', checkIfCorrect);
    if(remContainer.children[i].id == 'null'){
      remContainer.children[i].className = 'buttonGrey btn-global btn-disabled';
      remContainer.children[i].removeAttribute('onmouseover');
      remContainer.children[i].removeAttribute('onmouseout');
    }
  }

  x.className = 'buttonIncorrect btn-global btn-fail btn-kill-pointer';

  showContButton();
  animFail();
}

// display continue button

function showContButton(){
  let contBtn = document.createElement('button');
  contBtn.innerHTML = "Continue";
  contBtn.setAttribute('id', 'continueButton');
  contBtn.className = 'btn-util';
  contBtn.addEventListener('click', animElementsOff, false);
  contBtn.setAttribute('onmouseover', 'btnBig(this)');
  contBtn.setAttribute('onmouseout', 'btnSm(this)');
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
    // pipwerks.SCORM.quit();

    // bgLoop.pause();

    animSuccess();

    sndComplete.play();

    let finalDiv = document.createElement('h1');
    finalDiv.className = 'balloon balloon-right';
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