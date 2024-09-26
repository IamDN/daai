
const geoLocationUrl = 'https://www.googleapis.com/geolocation/v1/geolocate';
const geoCodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
const key = import.meta.env.VITE_GOOGLE_KEY;
async function getLocationFromNavigator(): Promise<{long:number,lat:number}> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat =  position.coords.latitude;
                const long = position.coords.longitude;
                resolve( {long,lat}); 
            },
            async error => {
                // If there's an error, call getLocationFromGoogle
                const googleLocation = await getLocationFromGoogle();
                resolve(googleLocation); // Resolve with the result from Google
            }
        );
    });
}
async function getLocationFromGoogle (): Promise<{long:number,lat:number}>{
    const query = `key=${key}`;
    const geoResponse = await fetch(`${geoLocationUrl}?${query }`, 
        { method: 'POST'});
  
    if (!geoResponse.ok) {
        throw new Error('Failed to fetch geolocation data');
    }
    const geoData = await geoResponse.json();
    const lat =  geoData.location.lat;
    const long  = geoData.location.lng;
    return {long,lat} ;
  }

async function getLocation (): Promise<{long:number,lat:number}>{
    if (navigator.geolocation) {
        return await  getLocationFromNavigator();
    }
    {
        return  await getLocationFromGoogle();
    }
}

async function getAdressFromGoogle(long: number, lat: number): Promise<string> {

    const query = `latlng=${lat},${long}&sensor=true&key=${key}`;
    const geocodeResponse = await fetch(`${geoCodeUrl}?${query}`);
  
      if (!geocodeResponse.ok) {
        throw new Error('Failed to fetch geocoding data');
      }
  
      const geocodeData = await geocodeResponse.json();
      const address = geocodeData.results[0];
  
      console.log(address);
  
      // Assuming `lastAdress` and `setAdress` are defined elsewhere
      return address.address_components[2].short_name;  // 
}

export async function getAddress (): Promise<string>{

    const coords = await getLocation ();
    const adress = await getAdressFromGoogle (coords.long, coords.lat);
    return adress;
}


