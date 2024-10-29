
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: import.meta.env.VITE_API_KEY, dangerouslyAllowBrowser: true });


const questionBase = 'Give me one recommandation based on the book:';

const ruleString ='##Rules:'
      +'- give me some specific locations (lifewords scenarios, ideas, concepts, projects)'
      +'- give me some specific institutions and subjects (coalitions , stakeholders, data, limits, aspirations, needs)'
      +'- follow recomandation from the literature, by example'
      +'- be natural, use "go to", "make sure", "just do"'
      +'- make sure this examples can help me in better urban planning'
      +'- keep it short, just 40 words per example'
      +'- do not use any formatting or heading, just a plain text'
      +'- Act as you are are urban design academic '
      +'- Avoid recomanding following places from previous answers: '
      ;

export async function getAIAnswer(verb: string, noun: string, books:string[]) {
    var position = `${await getLocation()}`;  
    
    var previsousAnswer = "";
    
    for (let i = 0; i < books.length; i++) {
      const question = ` ${questionBase} ${books[i]} for how to ${verb} ${noun} 
      in ${position}. ${ruleString } ${previsousAnswer} `;  ;
      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: question }],
        model: "gpt-4",
      });
      var answer = completion.choices[0].message.content;
       previsousAnswer += "; /n " + answer;
      console.log(`AI answer: ${answer}`);
      updateDescriptionContent (`${answer}`, books[i], i===0, `${verb} ${noun} 
        in ${position}`);
    }
  
  }

  async function getLocation() : Promise< string > {
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async position => {

            try {
              const address = await displayLocation(position.coords.latitude, position.coords.longitude);

              resolve( `${address}` );
            } catch (error) {
              console.error("Error getting address:", error);
              reject(error);
            }
          },
          error => {
            console.error("Error getting location:", error);
            reject(error);
          }
        );
      });
    } else {
      alert("Geolocation is not supported by this browser.");
      return "Singapore";  // Return null or handle the case where geolocation is not supported.
    }
  }

  async function displayLocation(latitude: number, longitude: number): Promise<string> {
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      var method = 'GET';
      var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true&key=${import.meta.env.VITE_GOOGLE_KEY}`;
      var async = true;
  
      request.open(method, url, async);
      request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
          var data = JSON.parse(request.responseText);
          var address = data.results[0];
          const lastAddress = address.address_components[3].short_name; 
          console.log('Address:', lastAddress);
          resolve(lastAddress);  // Resolve the Promise with the address
        } else if (request.readyState == 4) {
          reject(new Error("Failed to retrieve address"));
        }
      };
      request.send();
    });
  }

  const updateDescriptionContent = (newContent: string, book: string, first:boolean, header: string) => {
    const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
 if(first)
 {
  descriptionPanel.innerHTML = "";
  const headerDiv = document.createElement("h3");
  headerDiv.className = "div-title";
  headerDiv.innerHTML =  header;
  descriptionPanel.appendChild(headerDiv);
 }
   
  
    // Create a new div for the content
    const contentDiv = document.createElement("div");
    contentDiv.className = "div-advice";
    contentDiv.innerHTML = newContent;
  
    // Create a smaller div for the book reference
    const bookReferenceDiv = document.createElement("div");
    bookReferenceDiv.className = "div-reference";
    bookReferenceDiv.innerText = "[ Inspired by " + book + " ]"; 

    // Clear the existing content
  
    // Append content and book reference to the description panel
    descriptionPanel.appendChild(contentDiv);
    descriptionPanel.appendChild(bookReferenceDiv);
  };



 
  

