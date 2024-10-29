
import Gui from './Gui';
import './App.css';
import {StaticSource,WordCombos} from './StaticSource';  // Adjust the import as needed
import  { useState, useEffect } from 'react';


function App() {
  const [data, setData] = useState<[WordCombos[], WordCombos[]] | null>(null);

  // Preload data from StaticSource
  useEffect(() => {
    const source = new StaticSource();
    source.getData()
      .then(([firstRow , secondRow]) => {
        console.log("Data preloaded:", firstRow, secondRow);
        setData([firstRow, secondRow]);
      })
      .catch(error => {
        console.error("Error preloading data:", error);
      });
  }, []); // Empty dependency array to run only once when the component mounts

  console.log("Hello FROM APP");
  return (
    <>
      {data ? (
        <Gui preloadedData={data} />  // Pass preloaded data as props to Gui
      ) : (
        <p>Loading...</p>  // Show a loading message while the data is being preloaded
      )}
    </>
  );
}

export default App;
