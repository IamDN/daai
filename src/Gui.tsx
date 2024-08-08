import { useCallback, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import OpenAI from "openai";
import './Gui.css';

const dummyText = "<br> <br> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. <br><br><img src='gui/img1.jpg' class='image' />"; 

const initVerbs: string[] = [
  "Sense", "Describe", "Recognise", "Analyse", "Identify", "Evaluate", "Imagine",
  "Generate", "Evolve", "Craft", "Assemble", "Create", "Empower", "Inform", "Inspire"
];

const initNouns: string[] = [
  "lifeworlds", "needs", "aspirations", "data", "limits", "potentials", "scenarios",
  "ideas", "concepts", "materials", "projects", "formats", "participants", "stakeholders", "coalitions"
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
  //const [isScrolling, setIsScrolling] = useState(false);
  // const containerRef = useRef(null);
  // const [activeVerb, setActiveVerb] = useState('x');
  // const [activeNoun, setActiveNoun] = useState('y');
  
 
  async function getAIAnswer(action: string) {

    await getLocation();

    // wait for one second
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("LAST ADRESS when asking for AI answer: " +lastAdress);
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", 
        content: `Act as urban planner and try to be very location specific 
        (ideally with specific district names). Give me 5 recommendations on how 
        to ${action} in  ${lastAdress}` }],
      model: "gpt-3.5-turbo",
    });

    const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
    descriptionPanel.innerHTML = `<h2>${action + " in " + lastAdress} </h2> ${completion.choices[0].message.content}`;
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
        console.log(address.address_components[3].short_name);
        lastAdress = address.address_components[3].short_name; 
        setAdress(address);
      }
    };
    request.send();
  }

  const onCloseClicked = () => {
    const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
    descriptionPanel.classList.add("hide");
  };

  const handleClick = (noun: string) => {
  
    const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
    descriptionPanel.classList.remove("hide");
    descriptionPanel.innerHTML = "<br>"   +noun + dummyText+ dummyText;
    descriptionPanel.style.backgroundColor = "white";
    descriptionPanel.style.color = "black";
  };

  

  const onAIClicked = useCallback(() => {
    // const location = document.querySelector(".location-input") as HTMLInputElement;
    // const locationValue = location.value;
    const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
    descriptionPanel.classList.remove("hide");
    descriptionPanel.innerHTML = '<br> <br> Loading AI answer, it might take a couple of'+
    ' seconds for '+ lastVerb + ' ' + lastNoun + ', please stand by...';
    descriptionPanel.style.backgroundColor = boxColors[0];

    getAIAnswer(`${lastVerb} ${lastNoun}`);
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
        style={{ color: isMiddle ? boxColors[0] : 'white'}}>
        {verb.charAt(0).toUpperCase() + verb.slice(1)}
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
        style={{   color: isMiddle ? boxColors[0] : 'white'  }}>
        {noun.charAt(0).toUpperCase() + noun.slice(1)}
      </button>
    );
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

      //HACK to fix not changing color in this direction
      if (isLeft|| isLocked) {
         verbButtonRefs.current.forEach((btn, index) => {
            let isMiddle = index-1 ===  Math.floor(verbs.length / 2);
           btn.style.color = isMiddle ? boxColors[0] : 'white';
         });
      }
      if (!isLeft || isLocked)
      {
      nounButtonRefs.current.forEach((btn, index) => {
        let isMiddle =  index-1 === Math.floor(nouns.length / 2);
        btn.style.color = isMiddle ? boxColors[0] : 'white';
      });
    }
    }
    if (isLeft|| isLocked) setVerbs([...verbs]);
    if (!isLeft || isLocked) setNouns([...nouns]);
    if (isLeft|| isLocked)
    
      lastVerb = verbs[7];
      lastNoun = nouns[7];
    
  };

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
    const lockName: string = isLocked ? "Unlock berserk mode" : "Lock to basic mode";
    const lockSrc = isLocked ? "./src/gui/lock.png" : "./src/gui/unlock.png";
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
          onClick={() => onAIClicked()}>
          {"How to act here?"}
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
        <div className="description-panel hide" onClick={() => onCloseClicked()}></div>
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
