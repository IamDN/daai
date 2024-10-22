import { useState } from 'react';
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: import.meta.env.VITE_API_KEY, dangerouslyAllowBrowser: true });
const [, setLocation] = useState({ latitude: 0, longitude: 0 });
const [, setAdress] = useState('');
var lastAdress = '';
var lastContent = "";
var lastlastContent = "";
export async function getAIAnswer(verb: string, noun: string, type: number) {
    const question = ` of good urban planning recommendation how ${verb} ${noun} in city of Bandung, only plain text 10 - 20 words max`;
    console.log(`AI question : ${question}`);
  
    let prefix = `give me one example`;
    for (let i = 0; i < 5; i++) {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prefix + question }],
        model: "gpt-4",
      });
      console.log(`AI answer: ${completion.choices[0].message.content}`);
      prefix = `give me another example`;
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

