// first worried about User interaction part
// then talking to backend and validation part

const letters = document.querySelectorAll('.board-letter');
const loadingDiv = document.querySelector('.info-bar');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init(){
    let currentGuess = '';
    let currentRow = 0;
    let isloading = true;

    const res = await fetch("https://words.dev-apis.com/word-of-the-day")
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split("");
    let done = false;
    setLoading(false);
    isloading = false;

    function addLetter (letter){
        if(currentGuess.length < ANSWER_LENGTH){
            //add letter to the end
            currentGuess += letter;
        }
        else{
            //replace the last letter
            currentGuess = currentGuess.substring(0,currentGuess.length - 1) + letter; 
        }
        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit(){
        if(currentGuess.length != ANSWER_LENGTH){
            //do nothing
            return;
        }

        //TODO validate the word
        isloading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word",{
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;
        // const { validWord } = resObj; //same as above line

        isloading = false;
        setLoading(false);

        if(!validWord){
            markInvalidWord();
            return;
        }

        //do all the marking as "correct", "close" or "wrong"
        const guessPart = currentGuess.split("");
        const map=makeMap(wordParts);
        console.log(map);

        for(let i = 0; i < ANSWER_LENGTH; i++) {
            //mark as correct
            if(guessPart[i] === wordParts[i]){
                //as they are DOM nodes
                letters[ANSWER_LENGTH * currentRow + i].classList.add("correct");
                map[guessPart[i]]--;
            }
        }

        for(let i = 0; i < ANSWER_LENGTH; i++) {
            if(guessPart[i] === wordParts[i]){
                //DO NOTHING
            }
            // else if(wordParts.includes(guessPart[i]) /* TODO make it more accurate */){
            else if(wordParts.includes(guessPart[i]) && map[guessPart[i]]>0){
                //mark as close
                letters[ANSWER_LENGTH * currentRow + i].classList.add("close");
                map[guessPart]--;
            }
            else{
                letters[ANSWER_LENGTH * currentRow + i].classList.add("wrong");
            }
        }

        currentRow++;

        //did they win or lose?
        if(currentGuess === word){
            //you win
            alert("You Win!")
            document.querySelector('.brand').classList.add("winner");
            done = true;
            return;
        }else if(currentRow === ROUNDS){
            alert(`You Lose, the word was ${word}`)
            done = true;
        }

        currentGuess = '';
    }

    function backspace(){
        currentGuess = currentGuess.substring(0,currentGuess.length - 1);
        
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = '';
    }

    function markInvalidWord(){
        // alert("Not a valid word.");

        for(let i = 0; i < ANSWER_LENGTH; i++) {
            letters[ANSWER_LENGTH * currentRow + i].classList.remove("invalid");

            setTimeout(function (){
                letters[ANSWER_LENGTH * currentRow + i].classList.add("invalid");  
            },10); //10 milliseconds
        }
    }

    document.addEventListener('keydown', function handleKeyPress (event){
        
        // we are naming it because if there is an error, and you'll see like
        // stack space  that it prints out into your console, it will print the name
        // of whatever's here. It helps us debug the code later when stuff breaks
        
        if(done || isloading){
            //do nothing
            return;
        }

        const action = event.key;
        
        // console.log(action);
        if(action === "Enter"){
            commit(); //as it will now check it's guess is correct or not.
        }
        else if(action ==='Backspace'){
            backspace();
        }
        else if(isLetter(action)){
            addLetter(action.toUpperCase());
        }
        else{
            //when space bar aur any special character
            //do nothing
        }
    });
}

function isLetter(letter){
    return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isloading){
    loadingDiv.classList.toggle('show', isloading);
}

function makeMap(array){
    const obj={}
    for(let i = 0; i < ANSWER_LENGTH; i++){
        const letter=array[i];
        if(obj[letter]){
            obj[letter]++;
        }
        else{
            obj[letter]=1;
        }
    }
    return obj;
}

init();



































