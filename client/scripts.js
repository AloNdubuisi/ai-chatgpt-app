import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container')

let loadInterval;

//CREATING Loader THAT LOADS OUR MESSAGES:
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

//FUNCTION THAT IMPLEMENTS THE TYPING FUNCTIONALITY OF THE AI"
//==========================================================//
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    }else{
      clearInterval(interval);
    }
  }, 20);
}

//FUNCTION THAT IMPLEMENTS UNIQUE IDs"
//===================================//
function genUniqueId() {
  const timestamp = Date.now();
  const randNum = Math.random();
  const hexToString = randNum.toString(16);

  return `id-${timestamp}-${hexToString}`;
}


//FUNCTION THAT IMPLEMENTS THE TEXT TYPED BY THE AI"
//================================================//
function aiChatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class = "chat">
          <div class = "profile">
            <img 
              src=${isAi ? bot : user}
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}


//CREATING THE ASYNC TO HANDLE THE SUBMIT FUNCTION:"
//================================================//
const handleSubmit = async(e)=>{
  e.preventDefault();
  const data = new FormData(form);

  //GETTING THE USER'S CHATSTRIPE
  chatContainer.innerHTML += aiChatStripe(false, data.get('prompt'));
  form.reset();

  //GETTING THE BOT'S CHATSTRIPE
  const uniqueId = genUniqueId();
  chatContainer.innerHTML += aiChatStripe(true, " ", uniqueId);
  
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);
  

  //Here we'll be fetching data from the server ===>from AI response
  const response = await fetch('https://ai-chatgpt-app.onrender.com', {
    method:'POST',
    headers:{
      'Content-Type': 'application/json'
    },
    body:JSON.stringify({
      prompt:data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json(); //this gives the actual response from the backend
    const parseData = data.bot.trim();

    // console.log({parseData});

    typeText(messageDiv, parseData);
  }else{
    const error = await response.text();
    messageDiv.innerHTML = 'error! unable to fetch request';
    alert(error);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e)=>{
  if (e.keyCode === 13) {
    handleSubmit(e);
    // console.log( handleSubmit(e));
  }
});