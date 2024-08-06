import {  useCallback, useState } from 'react';
import { observer } from 'mobx-react';
import OpenAI from "openai";
import './Gui.css';
var lastVerb = "";
var lastNoun = "";
const Gui = observer(() => {

 
 //move this to separate file
 const openai = new OpenAI({ apiKey: import.meta.env.VITE_API_KEY ,dangerouslyAllowBrowser: true});

  async function main(action:string) {

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "Act as urban planner and try to be very location specific (idealy with specific district names). Give me a 5 recomendations how to " + action  }],
      model: "gpt-3.5-turbo",
    });
    // show description-panel and fill content with response
    const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
    descriptionPanel.innerHTML = "<h2>"+action +"</h2>"+" " + completion.choices[0].message.content;
    // console.log(completion.choices[0].message.content);
  }
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
async function getLocation () {
    if (navigator.geolocation) {
      await navigator.geolocation.getCurrentPosition(
        position => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          //get location input
          // const location = document.querySelector(".location-input") as HTMLInputElement;
          // location.value = position.coords.latitude + ", " + position.coords.longitude;
   
          displayLocation(position.coords.latitude , position.coords.longitude)
         
        },
        error => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  window.addEventListener("touchmove", (event) => {
    console.log(event);
    const footer = document.querySelector(".footer") as HTMLDivElement;
    footer.style.backgroundColor = "red";
  });
 
    window.addEventListener('scroll', (event) => {
      console.log(event);

      // get footer and change color
      const footer = document.querySelector(".footer") as HTMLDivElement;
      footer.style.backgroundColor = "red";
    });





  function displayLocation(latitude:number,longitude:number){
    var request = new XMLHttpRequest();
    var method = 'GET';
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+latitude+','+longitude+'&sensor=true&key='+import.meta.env.VITE_GOOGLE_KEY;
    var async = true;

    request.open(method, url, async);
    request.onreadystatechange = function(){
      if(request.readyState == 4 && request.status == 200){
        var data = JSON.parse(request.responseText);
        var address = data.results[0];
        console.log(address.address_components);
        const locationInput = document.querySelector(".location-input") as HTMLInputElement;
        locationInput.value = "in " + address.address_components[3].short_name;
        
      }
    };
    request.send();

  };
// create array with dummy 5 data
const verbs = [
  "Sense",
  "Describe",
  "Recognise",
  "Analyse",
  "Identify",
  "Evaluate",
  "Imagine",
  "Generate",
  "Evolve",
  "Craft",
  "Assemble",
  "Create",
  "Empower",
  "Inform",
  "Inspire"
] 

const nouns = [
  "lifeworlds",
  "needs",
  "aspirations",
  "data",
  "limits",
  "potentials",
  "scenarios",
  "ideas",
  "concepts",
  "materials",
  "projects",
  "formats",
  "participants",
  "stakeholders",
  "coalitions"

] 

const onCloseClicked = () => {
  const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
  descriptionPanel.classList.add("hide");
}
const [activeVerb, setActiveVerb] = useState('');
const [activeNoun, setActiveNoun] = useState('');

const handleVerbClick = (verb:string) => {
  lastVerb = verb;
  console.log(lastVerb   + " set");
  setActiveVerb((prev) => (prev === verb ? '' : verb));
};

const handleNounClick = (noun:string) => {

  lastNoun = noun;
  console.log(lastNoun  + " set");
  setActiveNoun((prev) => (prev === noun ? '' : noun));
};

  const onAIClicked = useCallback(() => {

    //get input box value
    // const input = document.querySelector(".input") as HTMLInputElement;
    // const value = input.value;
    // //update api key in openai
    // openai.apiKey = value;

    // get location from input
    const location = document.querySelector(".location-input") as HTMLInputElement;
    const locationValue = location.value;
 // get active verb and noun
 const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
 descriptionPanel.classList.remove("hide");
  descriptionPanel.innerHTML = "Loading AI answer, it might take couple of seconds, please stand by.. ";
    main(lastVerb + " "+lastNoun + " in  " + locationValue);
  }, [])

  const addVerbButton = (verb: string) => {
    
    return (
      <button className={activeVerb === verb ? 'layer-button active' : 'layer-button'} key={verb} onClick={() => handleVerbClick(verb)}>
        {verb.charAt(0).toUpperCase() + verb.slice(1)}
      </button>
    );
  };

  const addNounButton = (noun: string) => {
    return (
      <button className={activeNoun === noun ? 'layer-button active' : 'layer-button'} key={noun} onClick={() => handleNounClick(noun)}>
        {noun.charAt(0).toUpperCase() + noun.slice(1)}
      </button>
    );
  };

  const addAICountrol = () => {
    if (location.latitude === 0 || location.longitude === 0) {
      
    
    getLocation();

    }
    return (
      //Get current location of the device
      <div>
       <input className="location-input" placeholder="Place location" />
      {/* <input className="input" placeholder="Place your OpenAI key here" /> */}
      <button className={"ask-button " }  onClick={() => onAIClicked()}>
        {"Ask AI"}
      </button>
      </div>
    );
  };

  const drawGUI = () => {
    return (
      <div>
      <div  className="action-panel">
   
        <div className="verbs-panel">
    
          <div className="container" >
            { verbs.map((verb) => addVerbButton(verb) )}
          </div>
          <div className="nouns-panel" >

            <div className="container">
              { nouns.map((noun) => addNounButton(noun)) }
            </div>
          </div>
        </div>
        <div className="footer"> {addAICountrol()} </div>
      </div>
       <div className="description-panel hide"  onClick={() => onCloseClicked()}>

       </div>
       </div>
    );
  };

  return (
    <div>
      { drawGUI() }
    </div>
  );
});

export default Gui;
