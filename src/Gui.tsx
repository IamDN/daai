import { useCallback, useEffect, useRef, useState } from 'react';
import lockImage from './gui/lock.png';
import unlockImage from './gui/unlock.png';
import React from 'react';
import images from './imageLoader';
import { getAIAnswer } from './Ai';
import './Gui.css';
import { StaticSource,WordCombos } from './StaticSource.ts';

// src/webpack.d.ts
const source = new StaticSource();

interface WordData {
  description: string;
  literature: string[];
  imageLinks: string[];
}


const colors = [
  '#1B65A6', 
  '#1D4B73', 
  '#9CBCD9', 
  '#417FA6', 
  '#083040', 
];


var lastContent = "";


const Gui = ({ preloadedData }: { preloadedData: [WordCombos[], WordCombos[]] }) => {
  const [firstRow, secondRow] = preloadedData;
  // lastVerb = firstRow[firstRow.length -1];
  // lastNoun =secondRow[secondRow.length -1];
  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
  const verbButtonRefs = useRef<HTMLButtonElement[]>([]);
  const nounButtonRefs = useRef<HTMLButtonElement[]>([]);
  const [verbs, setVerbs] = useState<WordCombos[]>(firstRow);
  const [nouns, setNouns] = useState<WordCombos[]>(secondRow);
  const [lastVerb, setLastVerb] = useState(firstRow[firstRow.length - 1]);
const [lastNoun, setLastNoun] = useState(secondRow[secondRow.length - 1]);
  const [isLocked, setIsLocked] = useState(true);
  const [lastRan, setLastRan] = useState(0);
  const [boxColors, ] = useState([getRandomColor()]);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [, setTouchEnd] = useState(0);


  const onWordClicked = function (word: WordCombos, isVerb:boolean)  {

    source.getWordData(word.name).then((data : WordData) => {
      const lock = document.querySelector(".lock-button") as HTMLButtonElement;
    lock.classList.add("hide");
    const lockicon = document.querySelector(".lock-icon") as HTMLButtonElement;
    lockicon.classList.add("hide");
      const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement; ;
      descriptionPanel.classList.remove("hide");
      const closeButton= document.querySelector(".back-button") as HTMLDivElement; 
      closeButton.classList.remove("hide");
      closeButton.addEventListener("click", () => {
        descriptionPanel.classList.add("hide");
        closeButton.classList.add("hide");
        lock.classList.remove("hide");
        lockicon.classList.remove("hide");
      })
      lastContent = descriptionPanel.innerHTML;

      // Clear the existing content of descriptionPanel
      descriptionPanel.innerHTML = "";
      
      // Add the title as a heading
      const titleElement = document.createElement("h2");
      titleElement.textContent = word.name;
      descriptionPanel.appendChild(titleElement);
      
      // Add the description as a paragraph
      const descriptionElement = document.createElement("p");
      descriptionElement.textContent = data.description;
      descriptionPanel.appendChild(descriptionElement);
      
      // Add all images
      data.imageLinks.forEach(imageSrc => {
          const imgElement = document.createElement("img");
          imgElement.src = imageSrc;
          descriptionPanel.appendChild(imgElement);
      });
      
      // Add all literatures as a list
      const literatureList = document.createElement("ul");
      data.literature.forEach(literature => {
          const literatureItem = document.createElement("li");
          literatureItem.textContent = literature;
          literatureList.appendChild(literatureItem);
      });
      descriptionPanel.appendChild(literatureList);

          const oriIdx = isVerb ? firstRow.indexOf(word) : secondRow.indexOf(word);
          const colorIndex = oriIdx !== -1 ? Math.floor(oriIdx / 3) : 0;
          descriptionPanel.style.backgroundColor = colors[colorIndex];
          descriptionPanel.style.color = "white";
        //  closeButton.innerHTML = "Back";
    
    })
    .catch(error => {
      console.error("Error preloading data:", error);
    });
  }



  const updateListeners = (verb: WordCombos, noun: WordCombos) => {
    // Attach event listeners after content is injected
    const verbButton = document.getElementById("verb-desc-button");
    const nounButton = document.getElementById("noun-desc-button");
    if (verbButton) {
      verbButton.addEventListener("click",() => onWordClicked (verb, true));
    }
    if (nounButton) {
      nounButton.addEventListener("click", () => onWordClicked(noun, false) );
    }
  }

  function onBackClick(): void {
    // make lock visible
    const lock = document.querySelector(".lock-button") as HTMLButtonElement;
    lock.classList.remove("hide");
    const lockicon = document.querySelector(".lock-icon") as HTMLButtonElement;
    lockicon.classList.remove("hide");
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
      //backButton.innerHTML = "Close";
      lastContent="";
      updateListeners(lastVerb, lastNoun);
    }
  }

  const onAIClicked = useCallback((here:number) => {
    // const location = document.querySelector(".location-input") as HTMLInputElement;
    // const locationValue = location.value;
    const lock = document.querySelector(".lock-button") as HTMLButtonElement;
    //add to classname hide
    lock.classList.add("hide");
    const lockicon = document.querySelector(".lock-icon") as HTMLButtonElement;
    lockicon.classList.add("hide");
    const descriptionPanel = document.querySelector(".description-panel") as HTMLDivElement;
    descriptionPanel.classList.remove("hide");
    const backButton = document.querySelector(".back-button") as HTMLButtonElement;
    backButton.classList.remove("hide");
    const type = here === 0 ? " here and now advice" : "  literature review";
    descriptionPanel.innerHTML = '<br> <br> Loading AI answer for '
    + lastVerb.name + ' ' + lastNoun.name + type+ ', it might take a couple of' +
    ' seconds, please stand by...';
    descriptionPanel.style.backgroundColor = boxColors[0];
    source.getLiteratureFromWords(lastVerb.name, lastNoun.name).then((lit : string[]) => {
  
      getAIAnswer(lastVerb.name, lastNoun.name, lit);
    
    })
    .catch(error => {
      console.error("Error preloading data:", error);
    });


  
  }, [lastVerb, lastNoun]);

  const addButton = (word: WordCombos, isVerb: boolean, test:number) => {

    var list = isVerb ? verbs : nouns;
    let isLast = list.indexOf(word) === verbs.length -1;
    let i = list.indexOf(word);
     const [firstRow, secondRow] = preloadedData;

    const oriIdx = isVerb ? firstRow.indexOf(word) : secondRow.indexOf(word);
    const side = isVerb ? ' left' : ' right';
    const active = isLast ? ' active' : ' nonactive';
    const hide = list.indexOf(word)  < verbs.length -3? ' hide' : ''; //remove this to see full list (+ some height adjustme in css)
   
    const name =  'layer-button' + side + active +  hide;
    const colorIndex = oriIdx !== -1 ? Math.floor(oriIdx / 3) : 0;
    return (
      <button
          className={name}
          key={word.name}
          ref={el => verbButtonRefs.current[i] = el as HTMLButtonElement}
          id = {word + "-button"}
          onClick={() => onWordClicked (word, isVerb)}
          value = {test}
          style={{
            //backgroundColor: isLast ? colors[colorIndex ] : 'transparent', 
            backgroundColor: colors[colorIndex], 
            //borderColor: colors[colorIndex]
          }}
        >
        {word.name.toLowerCase() } 
        <img 
          src={images[isVerb ? oriIdx : (oriIdx + 15)]}
          className={isLast ? 'thumb' : 'thumb hide'}
        />
        <div className={isLast ? 'snippet' : 'snippet hide'}>
          {word.snippets}
        </div>
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
    //btn.style.transform = `scale(1,${scale})`;
  };

  const onScroll = (deltaY: number, isLeft: boolean) => {
    if (lastRan > Date.now() - 200) return;
    setLastRan(Date.now());
  
    // Copy current state without mutation
    const newVerbs = [...verbs];
    const newNouns = [...nouns];
  
    if (deltaY < 0) {
      if (isLeft || isLocked) newVerbs.unshift(newVerbs.pop() as WordCombos);
      if (!isLeft || isLocked) newNouns.unshift(newNouns.pop() as WordCombos);
    } else if (deltaY > 0) {
      if (isLeft || isLocked) newVerbs.push(newVerbs.shift() as WordCombos);
      if (!isLeft || isLocked) newNouns.push(newNouns.shift() as WordCombos);
    }
  
    // Update state with new arrays
    if (isLeft || isLocked) setVerbs(newVerbs);
    if (!isLeft || isLocked) setNouns(newNouns);
  

    // Update last items for listeners
    setLastVerb(newVerbs[newVerbs.length - 1]);
    setLastNoun(newNouns[newNouns.length - 1]);
    console.log(newVerbs.toString() + " " + lastVerb);
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


  const addLock = () => {
    const lockName: string = isLocked ? "" : "";
    const lockSrc = isLocked ? lockImage : unlockImage;;
    const onLockClicked = () => {
      setIsLocked(!isLocked);
    }
    return (
    <button className={"lock-button"} 
    onClick={() => onLockClicked()}>
      <img src={lockSrc} className="lock-icon" 
        alt="lock/unlock icon" />
      <span className="lock-spam">{lockName}</span>
  </button>
   );
  }
  const addAICountrol = () => {

    const oriIdx = firstRow.indexOf(verbs[verbs.length - 1]) ;
    const colorIndex = oriIdx !== -1 ? Math.floor(oriIdx / 3) : 0;
    const color = colors[colorIndex];
    return (
      <div>
        <button className={"ask-button"} 
          style={{ color: color  }} 
          onClick={() => onAIClicked(0)}>
          {"Here Now"}
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
              {verbs.map((verb, i) => addButton(verb, true,i))}
            </div>
          </div>
          <div className="nouns-panel" 
            onWheel={(e) => onScroll(e.deltaY, false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}>
          
            <div className="container right">
              {nouns.map((noun,i ) => addButton(noun, false,i))}
            </div>
          </div>  
        </div>
        <div className="footer"> {addAICountrol()} </div>
        <div className="description-panel hide" > </div>
        <button className="back-button hide" id="back-button" onClick={() => onBackClick()}>
           <i className="fas fa-times"></i>
        </button>
        <div> {addLock()} </div>
      </div>
      
    );
  };

  return (
    <div>
      {drawGUI()}
    </div>
  );
};

export default Gui;
