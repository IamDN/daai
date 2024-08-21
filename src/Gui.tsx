import { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import OpenAI from "openai";
import lockImage from './gui/lock.png';
import unlockImage from './gui/unlock.png';
import  dummyImage  from './gui/img1.jpg';
import './Gui.css';



const dummyText = "<br> <br> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."; 

const initVerbs: string[] = [
  "Evolve", "Craft", "Assemble", "Create", "Empower", "Inform", "Inspire","Sense", "Describe", "Recognise", "Analyse", "Identify", "Evaluate", "Imagine",
  "Generate"
];

const initNouns: string[] = [
  "Concepts", "Materials", "Projects", "Formats", "Participants", "Stakeholders", "Coalitions","Lifeworlds", "Needs", "Aspirations", "Data", "Limits", "Potentials", "Scenarios",
  "ideas"
];
const colors = [
  '#D4A5A5', // Pastel Cool Red
  '#C2D9A1', // Pastel Yellow-Green
  '#4A6A8C', // Dark Cool Blue
  '#D8A3B6', // Pastel Cool Pink
  '#6F8F7B', // Pastel Cool Green
  '#C2D9C2', // Pastel Yellowish Green
  '#9A6E6C', // Dark Cool Red
  '#7D8D92', // Pastel Cool Grayish Blue
  '#F5CBA7', // Pastel Warm Yellow
  '#4C8C7B'  // Dark Cool Moss Green
];
var lastVerb = initVerbs[7];
var lastNoun = initNouns[7];
var lastAdress = '';
var lastContent = "";
var lastlastContent = "";


const Gui = observer(() => {

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
  const verbButtonRefs = useRef<HTMLButtonElement[]>([]);
  const nounButtonRefs = useRef<HTMLButtonElement[]>([]);
  const openai = new OpenAI({ apiKey: import.meta.env.VITE_API_KEY, dangerouslyAllowBrowser: true });
  const [verbs, setVerbs] = useState<string[]>(initVerbs);
  const [nouns, setNouns] = useState<string[]>(initNouns);
  const [isLocked, setIsLocked] = useState(true);
  const [lastRan, setLastRan] = useState(0);
  const [boxColors, ] = useState([getRandomColor()]);
  const [, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [, setAdress] = useState('');
  const [touchStart, setTouchStart] = useState<number>(0);
  const [, setTouchEnd] = useState(0);

  
  const updateDescriptionContent = (newContent: string) => {
    const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
    lastContent = descriptionPanel.innerHTML;
    descriptionPanel.innerHTML = newContent;
  }

  const getHeader = (verb: string, noun: string, location : string) => {
    return (
      ` <div class = "desc-header"> 
          <button class = "desc-button" id="verb-desc-button" >
             <u> ${verb}</u>
          </button>  
          <button class = "desc-button" id="noun-desc-button">
             <u> ${noun}</u>
          </button> 
          ${location}
       </div>`
    );
  }

  const updateListeners = (verb: string, noun: string) => {
    // Attach event listeners after content is injected
    const verbButton = document.getElementById("verb-desc-button");
    const nounButton = document.getElementById("noun-desc-button");
    const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement; ;
    const closeButton= document.querySelector(".back-button") as HTMLDivElement; ;
    if (verbButton) {
      verbButton.addEventListener("click", () => {

       lastContent = descriptionPanel.innerHTML;
       descriptionPanel.innerHTML = "<br>"   +verb + dummyText+
       "<br><br><img src="+ dummyImage+" class =image />";
      descriptionPanel.style.backgroundColor = "white";
      descriptionPanel.style.color = "black";
      closeButton.innerHTML = "Back";
      });
    }
  
    if (nounButton) {
      nounButton.addEventListener("click", () => {

        lastContent = descriptionPanel.innerHTML;
        descriptionPanel.innerHTML = "<br>"   +noun + dummyText+
        "<br><br><img src="+ dummyImage+" class =image />";
       descriptionPanel.style.backgroundColor = "white";
       descriptionPanel.style.color = "black";
       closeButton.innerHTML = "Back";
      });
    }
  }

  const updateListenersAI = () => {

    // Attach event listeners after content is injected
    const bookButtons = document.getElementsByClassName("book-button");
    console.log("Update Listeners AI " + bookButtons.length);
    for (let i = 0; i < bookButtons.length; i++) {
      console.log(bookButtons[i].id);
      bookButtons[i].addEventListener("click", () => {
        const text = bookButtons[i].id;
        const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
        descriptionPanel.classList.remove("hide");
        const backButton = document.querySelector(".back-button") as HTMLButtonElement;
        backButton.innerHTML = "Back";
        descriptionPanel.innerHTML = '<br> <br> Loading AI answer for '
        + bookButtons[i].id + ', it might take a couple of' +
        ' seconds, please stand by...';
             getAIAnswer(text, "", 2);
       });
    }
  }

  async function getAIAnswer(verb: string, noun: string, type: number) {
    if (type === 0)
       await getLocation();
  
    var question = "";
    if (type === 0)
    {
      question = `Give me 5 examples of how ${verb} ${noun} in ${lastAdress}`
      + '##Rules'
      +'- give me some specific locations or institutions'
      +'- be natural, use "go to", "make sure", "just do"'
      +'- make sure this examples can help me in better urban planning'
      +'- keep it short, just 20 words per example'
      +'- do not use any formatting or heading, just a plain text'
      +'- Act as you are are urban design academic '
    } else if (type ===1)
    {
      question = `Give me academic literature relevant to ${verb} ${noun}`
      + ' ##Rules'
      +'- keep it short, max 3 books and 3 papers per example'
      +'- make it relevant in terms of urban designing'
      +'- use html for formatting and makes gaps beatwen books and papers'
      +'- make sure each item is sparated div'
      +'- add to formation for div in the value as name of book or paper'
      +'- add to formation for div id as name of the book or paper'
      +'- add to formation for div classname = "book-button"'
      +'- make sure each name is in bold'
      +'- skip context, just the list of books and papers'
      +'- prefer literature from Futute cities laboratory or ETH Zurich'

    } else if (type ===2)
    {

      question = `Give me summary 200 words of the publication ${verb}`

    }else if (type ===4)
      {
  
        question = `Give me academic literature relevant to ${verb} ${noun}`
        + ' ##Rules'
        +'- keep it short, max 3 books and 3 papers per example'
        +'- make it relevant in terms of urban designing'
        +'- use html for formatting and makes gaps beatwen books and papers'
        +'- make sure each item is sparated div'
        +'- add to formation for div in the value as name of book or paper'
        +'- add to formation for div id as name of the book or paper'
        +'- add to formation for div classname = "book-button"'
        +'- make sure each name is in bold'
        +'- skip context, just the list of books and papers'
        +'- prefer literature from Futute cities laboratory or ETH Zurich'
  
      }
    console.log(question);
    // wait for one second
    if (type === 0)
       await new Promise(resolve => setTimeout(resolve, 1000));
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: question }],
      model: "gpt-4",
    });
    
    var header = getHeader(verb, noun, lastAdress);
    var content = `${ header} ${completion.choices[0].message.content}`;
    if (type === 0) lastlastContent = content;
    updateDescriptionContent (content);
    if (type === 1)
      updateListenersAI();
    else if (type ===0)
    {
      updateListeners(verb, noun);
      getAIAnswer(verb, noun,4);
    }

    if (type === 4)
    {
      console.log("....:4 " +lastlastContent );
      const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
      lastContent = descriptionPanel.innerHTML;
      descriptionPanel.innerHTML =  lastlastContent + "<br><br>" + completion.choices[0].message.content;
      updateListenersAI();
    }

  }


  async function getLocation() {

    if (navigator.geolocation) {
      await navigator.geolocation.getCurrentPosition(
        position => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          displayLocation(position.coords.latitude, position.coords.longitude)
        },
        error => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
    
  }

  async function displayLocation(latitude: number, longitude: number) {
    var request = new XMLHttpRequest();
    var method = 'GET';
    var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true&key=${import.meta.env.VITE_GOOGLE_KEY}`;
    var async = true;

    request.open(method, url, async);
    request.onreadystatechange = function () {
      if (request.readyState == 4 && request.status == 200) {
        var data = JSON.parse(request.responseText);
        var address = data.results[0];
        lastAdress = address.address_components[3].short_name; 
        setAdress(address);
      }
    };
    request.send();
  }

  function onBackClick(): void {

    const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
    const backButton = document.querySelector(".back-button") as HTMLButtonElement;
    if (lastContent==="" || lastContent.includes("Loading AI answer")) {
      descriptionPanel.classList.add("hide");

      backButton.classList.add("hide");
    } else
    {
      descriptionPanel.style.backgroundColor = boxColors[0];
      descriptionPanel.style.color = "white";
       descriptionPanel.innerHTML = lastContent;
       backButton.innerHTML = "Close";
       lastContent="";
       updateListeners(lastVerb, lastNoun);
    }
  }

  const handleClick = (noun: string) => {
  
    const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
    descriptionPanel.classList.remove("hide");
    descriptionPanel.innerHTML = "<br>"   +noun + dummyText+
     "<br><br><img src="+ dummyImage+" class =image />";
    descriptionPanel.style.backgroundColor = "white";
    descriptionPanel.style.color = "black";
    const backButton = document.querySelector(".back-button") as HTMLButtonElement;
    backButton.innerHTML = "back";
  };

  

  const onAIClicked = useCallback((here:number) => {
    // const location = document.querySelector(".location-input") as HTMLInputElement;
    // const locationValue = location.value;
    const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
    descriptionPanel.classList.remove("hide");
    const backButton = document.querySelector(".back-button") as HTMLButtonElement;
    backButton.classList.remove("hide");
    const type = here === 0 ? " here and now advice" : "  literature review";
    descriptionPanel.innerHTML = '<br> <br> Loading AI answer for '
    + lastVerb + ' ' + lastNoun + type+ ', it might take a couple of' +
    ' seconds, please stand by...';
    descriptionPanel.style.backgroundColor = boxColors[0];

    getAIAnswer(lastVerb, lastNoun, here);
  }, []);

  const addVerbButton = (verb: string) => {
    let i = verbs.indexOf(verb);
    let isMiddle = verbs.indexOf(verb) === Math.floor(verbs.length / 2);
    //let endOfGroup =Math.abs(i-verbs.indexOf(initVerbs[0]))%4 ===3;
    //console.log("EOG " + (i-verbs.indexOf(initVerbs[0]))%4);
    return (
      <button
        className={isMiddle ? 'layer-button l active' : 'layer-button l nonactive'}
        key={verb}
        ref={el => verbButtonRefs.current[i] = el as HTMLButtonElement}
        id = {verb + "-button"}
        onClick={() => handleClick(verb)}
        style={{ backgroundColor: isMiddle ? boxColors[0] : 'transparent'}}>
        {verb.toUpperCase() }
      </button>
    );
  };

  const addNounButton = (noun: string) => {
    let isMiddle = nouns.indexOf(noun) === Math.floor(nouns.length / 2);
    let i = nouns.indexOf(noun);
    return (
      <button
        className={isMiddle ? 'layer-button r active' : 'layer-button r nonactive'}
        key={noun}
        ref={el => nounButtonRefs.current[i] = el as HTMLButtonElement}
        id ={noun + "-button"}
        onClick={() => handleClick(noun)}
        style={{  backgroundColor: isMiddle ? boxColors[0] : 'transparent'  }}>
        {noun.toUpperCase()}
      </button>
    );
  };

  const updateScale = (btn: HTMLButtonElement) => {
    const rect = btn.getBoundingClientRect();
    const screenHeight = window.innerHeight;

    // Calculate the vertical distance from the center of the viewport
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = screenHeight / 2;
    const distanceFromCenter = Math.abs(viewportCenter - elementCenter);

    // Normalize the distance as a fraction of half the viewport height
    const maxDistance = screenHeight / 2;
    const threshold = 100; // You can adjust this value to increase or decrease the range

    let scale;
    if (distanceFromCenter < threshold) {
        // Buttons within the threshold from the center have no scaling
        scale = 1;
    } else {
        // Buttons outside the threshold scale according to their distance from the center
        scale = 1 - ((distanceFromCenter - threshold) / (maxDistance - threshold)) * 1;
        scale = Math.max(0.5, scale); // Ensure scale doesn't go below 0.5
    }
    // Apply the scale transformation
    //btn.style.transform = `scale(${scale})`;
    btn.style.transform = `scale(1,${scale})`;
  };

  const onScroll = (deltyY :number, isLeft: boolean) => {
    if (lastRan > (Date.now() - 200)) { return; }
    setLastRan(Date.now());
  
    if (deltyY < 0) {
      if (isLeft|| isLocked) { verbs.unshift(verbs.pop() as string);}
      if (!isLeft|| isLocked) { nouns.unshift(nouns.pop() as string);}
    } else if (deltyY > 0) {
      if (isLeft || isLocked) { verbs.push(verbs.shift() as string);}
      if (!isLeft|| isLocked) { nouns.push(nouns.shift() as string);}
    }
    if (isLeft|| isLocked) setVerbs([...verbs]);
    if (!isLeft || isLocked) setNouns([...nouns]);
    if (isLeft|| isLocked)
    
      lastVerb = verbs[7];
      lastNoun = nouns[7];

      // nounButtonRefs.current.forEach((btn) => { updateScale(btn); });
      // verbButtonRefs.current.forEach((btn) => {updateScale(btn);});

  };

  useEffect(() => {
    nounButtonRefs.current.forEach((btn) => { updateScale(btn); });
    verbButtonRefs.current.forEach((btn) => { updateScale(btn); });
}, [verbs, nouns]); // Only run when `verbs` or `nouns` changes

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY as number);
   // setIsScrolling(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchCurrent = e.touches[0].clientY;
    if (touchStart !== null) {
      const distance = touchCurrent - touchStart ;
      if (Math.abs(distance) > 10) { // Threshold to determine scrolling
        onScroll( distance*3, e.touches[0].clientX < window.innerWidth / 2);
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(0);
    setTouchEnd(0);
  };


  const addAICountrol = () => {
    const lockName: string = isLocked ? "Unlock free mode" : "Lock to beginer";
    const lockSrc = isLocked ? lockImage : unlockImage;;
    const onLockClicked = () => {
      setIsLocked(!isLocked);
    }
    return (
      <div>
        <button className={"lock-button"} 
          onClick={() => onLockClicked()}>
            <img src={lockSrc} className="lock-icon" 
              alt="lock/unlock icon" />
            <span className="lock-spam">{lockName}</span>
        </button>
        <button className={"ask-button"} 
          style={{ backgroundColor: boxColors[0] }} 
          onClick={() => onAIClicked(0)}>
          {"Here Now"}
        </button>
        <button className={"review-button"} 
          style={{ backgroundColor: boxColors[0] }} 
          onClick={() => onAIClicked(1)}>
          {"Literature Review"}
        </button>
      </div>
    );
  };

  const drawGUI = () => {
    return (
      <div>
        <div className="header"> {"Design Actions"} </div>
        <div className="action-panel">
          <div className="verbs-panel" 
              onWheel={(e) => onScroll(e.deltaY, true)} 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}>
            <div className="container left">
              {verbs.map((verb) => addVerbButton(verb))}
            </div>
          </div>
          <div className="nouns-panel" 
            onWheel={(e) => onScroll(e.deltaY, false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}>
          
            <div className="container right">
              {nouns.map((noun) => addNounButton(noun))}
            </div>
          </div>  
        </div>
        <div className="footer"> {addAICountrol()} </div>
        <div className="description-panel hide" > </div>
        <button className="back-button hide" id = "back-button" onClick = {
          () => onBackClick()}>{"Close"}
          </button>
      </div>
    );
  };

  return (
    <div>
      {drawGUI()}
    </div>
  );
});

export default Gui;
