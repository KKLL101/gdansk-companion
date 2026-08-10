import React, { useEffect, useMemo, useState } from 'react';

const STORAGE = {
  favorites: 'gdansk_family_favorites',
  expenses: 'gdansk_family_expenses',
  tripInfo: 'gdansk_family_trip_info'
};

const HOTEL = {
  name: 'Jess Krolewski Gdansk Old Town',
  mapQuery: 'Jess Krolewski Gdansk Old Town'
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage kan være slået fra i visse browserindstillinger.
  }
}

const PLACES = [
  // Seværdigheder, museer og unikke oplevelser
  { id: 'royal-way', name: 'Royal Way, Długa og Długi Targ', type: 'Seværdighed', category: 'Byvandring', lat: 54.3488, lng: 18.6532, rating: 'Klassiker', price: 'Gratis', notes: 'Den oplagte første gåtur gennem hovedbyen med Długa, Długi Targ, rådhuset og Neptunfontænen.', mapQuery: 'Royal Way Gdansk Dluga Długi Targ' },
  { id: 'st-marys', name: 'Mariakirken', type: 'Seværdighed', category: 'Historie', lat: 54.3499, lng: 18.6533, rating: 'Must see', price: 'Lav', notes: 'Stor gotisk murstenskirke tæt på Mariacka Street. God som ankerpunkt for en tur i centrum.', mapQuery: 'St Mary Church Gdansk' },
  { id: 'mariacka', name: 'Mariacka Street', type: 'Seværdighed', category: 'Rav og stemning', lat: 54.3495, lng: 18.6562, rating: 'Fotostop', price: 'Gratis', notes: 'Charmerende brostensgade med ravbutikker, fine facader og god stemning.', mapQuery: 'Mariacka Street Gdansk' },
  { id: 'motlawa', name: 'Motława Waterfront og Granary Island', type: 'Seværdighed', category: 'Aftenstemning', lat: 54.3507, lng: 18.6586, rating: 'Nem favorit', price: 'Gratis', notes: 'Perfekt til aftengåtur, kaffe, udsigt og middag i området.', mapQuery: 'Motlawa Waterfront Granary Island Gdansk' },
  { id: 'neptune', name: 'Neptunfontænen', type: 'Seværdighed', category: 'Bymidte', lat: 54.3486, lng: 18.6530, rating: 'Klassiker', price: 'Gratis', notes: 'Et hurtigt og klassisk stop midt på Długi Targ. Godt mødested i centrum.', mapQuery: 'Neptune Fountain Gdansk' },
  { id: 'crane', name: 'Den gamle kran Żuraw', type: 'Seværdighed', category: 'Havnefront', lat: 54.3507, lng: 18.6576, rating: 'Klassiker', price: 'Gratis/lav', notes: 'Et af Gdańsks mest kendte vartegn ved Motława-floden.', mapQuery: 'The Crane Zuraw Gdansk' },
  { id: 'golden-gate', name: 'Golden Gate', type: 'Seværdighed', category: 'Byvandring', lat: 54.3490, lng: 18.6486, rating: 'Hurtigt stop', price: 'Gratis', notes: 'Fin start eller afslutning på Royal Way.', mapQuery: 'Golden Gate Gdansk' },
  { id: 'green-gate', name: 'Green Gate', type: 'Seværdighed', category: 'Byvandring', lat: 54.3483, lng: 18.6554, rating: 'Hurtigt stop', price: 'Gratis', notes: 'Flot port ved overgangen mellem Long Market og havnefronten.', mapQuery: 'Green Gate Gdansk' },
  { id: 'amber-museum', name: 'Amber Museum', type: 'Museum', category: 'Rav', lat: 54.3524, lng: 18.6510, rating: 'God backup', price: 'Medium', notes: 'Oplagt hvis I vil forstå ravets betydning for Gdańsk.', mapQuery: 'Amber Museum Gdansk' },
  { id: 'solidarity', name: 'European Solidarity Centre', type: 'Museum', category: 'Historie', lat: 54.3611, lng: 18.6492, rating: 'Stærk oplevelse', price: 'Medium', notes: 'Museum om Solidaritet, skibsværftet og nyere europæisk historie.', mapQuery: 'European Solidarity Centre Gdansk' },
  { id: 'ww2', name: 'Museum of the Second World War', type: 'Museum', category: 'Historie', lat: 54.3564, lng: 18.6600, rating: 'Must see', price: 'Medium', notes: 'Et større museum, der er bedst når I har god tid eller hvis vejret ikke er til lange gåture.', mapQuery: 'Museum of the Second World War Gdansk' },
  { id: 'upghagen', name: 'Uphagen House', type: 'Museum', category: 'Historisk hus', lat: 54.3491, lng: 18.6499, rating: 'Kort museum', price: 'Medium', notes: 'Et mindre museum i centrum, som passer godt ind i en gåtur på Długa.', mapQuery: 'Uphagen House Gdansk' },
  { id: 'great-mill', name: 'Great Mill', type: 'Seværdighed', category: 'Historisk bygning', lat: 54.3535, lng: 18.6495, rating: 'Kort stop', price: 'Gratis', notes: 'Fin afstikker nær den ældre del af byen.', mapQuery: 'Great Mill Gdansk' },
  { id: 'olivia', name: 'Oliwa Park og Katedral', type: 'Udflugt', category: 'Grønt område', lat: 54.4103, lng: 18.5609, rating: 'Rolig pause', price: 'Gratis/lav', notes: 'Roligere udflugt nord for centrum. Kan kombineres med kaffe eller en tur mod Sopot.', mapQuery: 'Oliwa Park Cathedral Gdansk' },
  { id: 'westerplatte', name: 'Westerplatte', type: 'Udflugt', category: 'Historie', lat: 54.4067, lng: 18.6728, rating: 'Historisk', price: 'Gratis/lav', notes: 'Historisk område uden for centrum. Bedst hvis I vil lidt længere væk fra Old Town.', mapQuery: 'Westerplatte Gdansk' },
  { id: 'sopot-pier', name: 'Sopot Pier', type: 'Udflugt', category: 'Kysttur', lat: 54.4479, lng: 18.5686, rating: 'Populær udflugt', price: 'Lav/medium', notes: 'Klassisk udflugt fra Gdańsk med strand, mole og ferieby-stemning.', mapQuery: 'Sopot Pier' },
  { id: 'sopot-beach', name: 'Sopot Beach', type: 'Udflugt', category: 'Strand', lat: 54.4445, lng: 18.5700, rating: 'Sommerstemning', price: 'Gratis', notes: 'God hvis vejret er fint, og I vil have luft og strand.', mapQuery: 'Sopot Beach' },
  { id: 'brzezno', name: 'Brzeźno Strand', type: 'Udflugt', category: 'Strand', lat: 54.4137, lng: 18.6274, rating: 'Lokal strand', price: 'Gratis', notes: 'Et mere afslappet strandvalg tættere på Gdańsk end Sopot.', mapQuery: 'Brzezno Beach Gdansk' },
  { id: '100cznia', name: '100cznia', type: 'Oplevelse', category: 'Food hall / kreativt område', lat: 54.3636, lng: 18.6468, rating: 'Unikt sted', price: 'Mellem', notes: 'Et mere råt og kreativt område ved skibsværftet med mad, drikke og byliv.', mapQuery: '100cznia Gdansk' },
  { id: 'elektrykow', name: 'Ulica Elektryków', type: 'Oplevelse', category: 'Kultur / aften', lat: 54.3631, lng: 18.6475, rating: 'Unikt sted', price: 'Mellem', notes: 'Skibsværftsstemning, uformelt natteliv og et anderledes Gdańsk end Old Town.', mapQuery: 'Ulica Elektrykow Gdansk' },
  { id: 'shipyard', name: 'Gdańsk Shipyard-området', type: 'Oplevelse', category: 'Industrihistorie', lat: 54.3640, lng: 18.6490, rating: 'Unikt område', price: 'Gratis', notes: 'Godt at kombinere med European Solidarity Centre og 100cznia.', mapQuery: 'Gdansk Shipyard' },
  { id: 'market-hall', name: 'Hala Targowa', type: 'Oplevelse', category: 'Marked', lat: 54.3530, lng: 18.6506, rating: 'Lokalt stop', price: 'Gratis', notes: 'Markedshal tæt på centrum. God til et kort lokalt stop.', mapQuery: 'Hala Targowa Gdansk' },

  // Restauranter, caféer, barer og madoplevelser
  { id: 'pierogarnia', name: 'Pierogarnia Stary Młyn', type: 'Restaurant', category: 'Polsk / pierogi', lat: 54.3515, lng: 18.6483, rating: '4.7', price: 'Mellem', notes: 'Godt sted til pierogi og en uformel middag. Kig efter kø og book hvis muligt.', mapQuery: 'Pierogarnia Stary Mlyn Gdansk' },
  { id: 'mandu', name: 'Pierogarnia Mandu', type: 'Restaurant', category: 'Polsk / pierogi', lat: 54.3537, lng: 18.6467, rating: 'Populær', price: 'Mellem', notes: 'Meget populært pierogi-sted. Godt valg hvis I vil prøve polsk comfort food.', mapQuery: 'Pierogarnia Mandu Gdansk Elzbietanska' },
  { id: 'pomelo', name: 'Pomelo Gdańsk', type: 'Restaurant', category: 'Polsk / moderne', lat: 54.3520, lng: 18.6508, rating: '4.8', price: 'Mellem', notes: 'Fleksibelt valg til brunch, frokost eller casual dinner i centrum.', mapQuery: 'Pomelo Gdansk restaurant' },
  { id: 'manna', name: 'Manna 68', type: 'Restaurant', category: 'Vegetar / international', lat: 54.3482, lng: 18.6561, rating: '4.9', price: 'Mellem', notes: 'Godt valg hvis I vil have noget lettere, grønnere og mindre traditionelt.', mapQuery: 'Manna 68 Gdansk' },
  { id: 'tygle', name: 'TYGLE Gdańskie', type: 'Restaurant', category: 'Polsk / europæisk', lat: 54.3491, lng: 18.6577, rating: '4.8', price: 'Høj', notes: 'Mere upscale valg til en aften, hvor middagen gerne må være en større oplevelse.', mapQuery: 'TYGLE Gdanskie restaurant' },
  { id: 'literacka', name: 'Literacka Restaurant & Wine Bar', type: 'Restaurant', category: 'Polsk / europæisk', lat: 54.3497, lng: 18.6536, rating: '4.7', price: 'Mellem', notes: 'God kandidat til en rolig middag med vin tæt på Mariakirken og Mariacka Street.', mapQuery: 'Literacka Restaurant Wine Bar Gdansk' },
  { id: 'fino', name: 'Fino', type: 'Restaurant', category: 'Fine dining', lat: 54.3516, lng: 18.6570, rating: 'Populær', price: 'Høj', notes: 'Et mere ambitiøst restaurantvalg til en særlig aften.', mapQuery: 'Fino Gdansk restaurant' },
  { id: 'eliksir', name: 'Eliksir', type: 'Restaurant', category: 'Polsk / cocktails', lat: 54.3828, lng: 18.5992, rating: 'Populær', price: 'Høj', notes: 'Godt valg hvis I vil kombinere mad og cocktails uden for det mest turistede centrum.', mapQuery: 'Eliksir Gdansk restaurant' },
  { id: 'ritz', name: 'Ritz Restaurant', type: 'Restaurant', category: 'Polsk / fine dining', lat: 54.3503, lng: 18.6593, rating: 'Populær', price: 'Høj', notes: 'Klassisk upscale restaurantvalg nær vandet.', mapQuery: 'Ritz Restaurant Gdansk' },
  { id: 'kubicki', name: 'Restauracja Kubicki', type: 'Restaurant', category: 'Polsk / klassisk', lat: 54.3525, lng: 18.6602, rating: 'Klassisk', price: 'Mellem/høj', notes: 'Klassisk polsk restaurant ved havnefronten.', mapQuery: 'Restauracja Kubicki Gdansk' },
  { id: 'gdanski-bowke', name: 'Gdański Bowke', type: 'Restaurant', category: 'Polsk / havnefront', lat: 54.3498, lng: 18.6576, rating: 'Klassisk', price: 'Mellem', notes: 'Centralt valg med lokal og maritim stemning.', mapQuery: 'Gdanski Bowke Gdansk' },
  { id: 'goldwasser', name: 'Goldwasser Restaurant', type: 'Restaurant', category: 'Polsk / historisk', lat: 54.3505, lng: 18.6593, rating: 'Klassisk', price: 'Mellem/høj', notes: 'Historisk navn og central placering ved vandet.', mapQuery: 'Goldwasser Restaurant Gdansk' },
  { id: 'mercato', name: 'Mercato', type: 'Restaurant', category: 'Fine dining', lat: 54.3505, lng: 18.6533, rating: 'Eksklusiv', price: 'Høj', notes: 'Mere elegant restaurantvalg til en rolig middag.', mapQuery: 'Mercato Gdansk restaurant' },
  { id: 'whiskey', name: 'Whiskey in the Jar', type: 'Restaurant', category: 'Steak / burger', lat: 54.3488, lng: 18.6556, rating: 'Populær', price: 'Mellem', notes: 'Hvis I får lyst til noget andet end polsk mad.', mapQuery: 'Whiskey in the Jar Gdansk' },
  { id: 'billys', name: "Billy's American Restaurant", type: 'Restaurant', category: 'American', lat: 54.3492, lng: 18.6584, rating: 'Populær', price: 'Mellem', notes: 'Uformelt valg med amerikansk mad på Granary Island.', mapQuery: "Billy's American Restaurant Gdansk Wyspa Spichrzow" },
  { id: 'smaki-indii', name: 'Smaki Indii', type: 'Restaurant', category: 'Indisk', lat: 54.3515, lng: 18.6501, rating: 'Populær', price: 'Mellem', notes: 'Godt alternativ til polsk mad, hvis I vil have indisk.', mapQuery: 'Smaki Indii Restaurant Gdansk' },
  { id: 'durga', name: 'Durga', type: 'Restaurant', category: 'Indisk', lat: 54.3535, lng: 18.6465, rating: 'Populær', price: 'Mellem', notes: 'Endnu et stærkt bud på indisk mad i Gdańsk.', mapQuery: 'Durga Gdansk restaurant' },
  { id: 'drukarnia', name: 'Drukarnia Cafe', type: 'Restaurant', category: 'Café / kaffe', lat: 54.3496, lng: 18.6556, rating: 'Café', price: 'Lav/mellem', notes: 'God kaffepause tæt på Mariacka Street.', mapQuery: 'Drukarnia Cafe Gdansk' },
  { id: 'retro-cafe', name: 'Retro Cafe', type: 'Restaurant', category: 'Café / kage', lat: 54.3508, lng: 18.6519, rating: 'Café', price: 'Lav/mellem', notes: 'Hyggeligt stop til kaffe og kage i centrum.', mapQuery: 'Retro Cafe Gdansk' },
  { id: 'jozef-k', name: 'Józef K', type: 'Restaurant', category: 'Café / bar', lat: 54.3520, lng: 18.6500, rating: 'Unik stemning', price: 'Mellem', notes: 'Skævt og stemningsfuldt sted til kaffe eller en drink.', mapQuery: 'Jozef K Gdansk' },
  { id: 'eklerownia', name: 'Eklerownia', type: 'Restaurant', category: 'Dessert / kage', lat: 54.3529, lng: 18.6467, rating: 'Sødt stop', price: 'Lav/mellem', notes: 'Godt stop hvis I vil have noget sødt.', mapQuery: 'Eklerownia Gdansk' },
  { id: 'pg4', name: 'PG4', type: 'Restaurant', category: 'Bryggeri / mad', lat: 54.3557, lng: 18.6448, rating: 'Lokal øl', price: 'Mellem', notes: 'Mikrobryggeri tæt på togstationen med mad og øl.', mapQuery: 'PG4 Gdansk' },
  { id: 'brovarnia', name: 'Brovarnia Gdańsk', type: 'Restaurant', category: 'Bryggeri / mad', lat: 54.3496, lng: 18.6602, rating: 'Bryggeri', price: 'Mellem', notes: 'Bryggeri og restaurant ved Old Town.', mapQuery: 'Brovarnia Gdansk' },
  { id: 'pulapka', name: 'Pułapka', type: 'Restaurant', category: 'Craft beer / bar', lat: 54.3510, lng: 18.6560, rating: 'Bar', price: 'Mellem', notes: 'Hvis I vil prøve et mere specialiseret ølsted.', mapQuery: 'Pulapka Gdansk' },
  { id: 'flisak76', name: "Flisak '76", type: 'Restaurant', category: 'Cocktailbar', lat: 54.3510, lng: 18.6530, rating: 'Cocktails', price: 'Mellem/høj', notes: 'Kendt cocktailbar og et godt aftenstop.', mapQuery: "Flisak '76 Gdansk" },
  { id: 'cybermachina', name: 'Cybermachina', type: 'Restaurant', category: 'Bar / spil', lat: 54.3521, lng: 18.6507, rating: 'Sjov bar', price: 'Mellem', notes: 'Uformelt og anderledes barvalg med spiltema.', mapQuery: 'Cybermachina Gdansk' }
];

const ITINERARY = [
  { day: 'Dag 1', title: 'Ankomst og første indtryk', items: ['Royal Way og Długi Targ', 'Mariacka Street', 'Aften ved Motława Waterfront'] },
  { day: 'Dag 2', title: 'Historie og god middag', items: ['European Solidarity Centre', 'Museum of the Second World War', 'Middag hos Pomelo, Literacka eller TYGLE'] },
  { day: 'Dag 3', title: 'Luft i programmet', items: ['Oliwa Park og Katedral', 'Kaffe eller frokost i Oliwa', 'Sidste gåtur langs havnefronten'] }
];

function distanceInKm(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function getNowSuggestions() {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 11) return { title: 'God formiddag', text: 'Start stille og roligt i centrum.', items: ['☕ Kaffe i centrum', '⛪ Mariakirken', '🚶 Mariacka Street'] };
  if (hour >= 11 && hour < 14) return { title: 'Frokosttid', text: 'Find noget godt at spise uden at bruge for lang tid.', items: ['🍽️ Pomelo Gdańsk', '🥟 Pierogarnia Stary Młyn', '🚶 Kort gåtur ved Długi Targ'] };
  if (hour >= 14 && hour < 17) return { title: 'Eftermiddag', text: 'Godt tidspunkt til museum eller en roligere oplevelse.', items: ['🏛️ European Solidarity Centre', '🏛️ Museum of the Second World War', '🌳 Oliwa Park hvis I vil lidt væk fra centrum'] };
  if (hour >= 17 && hour < 22) return { title: 'Aften', text: 'Middag, havnefront og rolig aftentur.', items: ['🍷 Literacka Restaurant & Wine Bar', '🍽️ TYGLE Gdańskie', '🌉 Gåtur ved Motława Waterfront'] };
  return { title: 'Sen aften', text: 'Hold det enkelt og kom nemt tilbage til hotellet.', items: ['🏨 Tag tilbage til hotellet', '🌉 Kort aftengåtur ved havnefronten', '🧃 Køb vand eller snacks til hotellet'] };
}

export default function App() {
  const [tab, setTab] = useState('nearby');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [favorites, setFavorites] = useState(() => readStorage(STORAGE.favorites, []));
  const [expenses, setExpenses] = useState(() => readStorage(STORAGE.expenses, []));
  const [tripInfo, setTripInfo] = useState(() => readStorage(STORAGE.tripInfo, { hotel: HOTEL.name, flight: '', booking: '', notes: '' }));
  const [pln, setPln] = useState('100');
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const dkkRate = 1.75;
  const nowSuggestion = getNowSuggestions();
  const hotelAppleMaps = `https://maps.apple.com/?q=${encodeURIComponent(HOTEL.mapQuery)}`;
  const hotelGoogleMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOTEL.mapQuery)}`;
  const weatherUrl = 'https://www.yr.no/en/forecast/daily-table/2-3099434/Poland/Pomerania/Gda%C5%84sk/Gda%C5%84sk';

  useEffect(() => writeStorage(STORAGE.favorites, favorites), [favorites]);
  useEffect(() => writeStorage(STORAGE.expenses, expenses), [expenses]);
  useEffect(() => writeStorage(STORAGE.tripInfo, tripInfo), [tripInfo]);

  const sortedPlaces = useMemo(() => {
    return [...PLACES].sort((a, b) => {
      if (!location) return a.name.localeCompare(b.name);
      return distanceInKm(location, a) - distanceInKm(location, b);
    });
  }, [location]);

  const useCurrentLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Din browser understøtter ikke GPS.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('GPS blev ikke godkendt. Slå lokation til i Safari og prøv igen.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const toggleFavorite = (place) => {
    setFavorites((current) => current.some((x) => x.id === place.id) ? current.filter((x) => x.id !== place.id) : [...current, place]);
  };

  const addExpense = () => {
    const amount = Number(String(expenseAmount).replace(',', '.'));
    if (!expenseName.trim() || Number.isNaN(amount) || amount <= 0) return;
    setExpenses((current) => [...current, { id: Date.now(), name: expenseName.trim(), amount }]);
    setExpenseName('');
    setExpenseAmount('');
  };

  const maps = (place, service) => {
    const query = encodeURIComponent(place.mapQuery);
    if (service === 'apple') return `https://maps.apple.com/?q=${query}`;
    if (service === 'google') return `https://www.google.com/maps/search/?api=1&query=${query}`;
    return `https://www.tripadvisor.com/Search?q=${encodeURIComponent(place.name + ' Gdansk')}`;
  };

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  const Card = ({ place }) => {
    const km = location ? distanceInKm(location, place) : null;
    const fav = favorites.some((x) => x.id === place.id);
    return (
      <article className="card place-card">
        <div className="place-top">
          <div>
            <p className="meta">{place.type} · {place.category}</p>
            <h3>{place.name}</h3>
            <p>{place.notes}</p>
          </div>
          <button className={fav ? 'star active' : 'star'} onClick={() => toggleFavorite(place)}>{fav ? '★' : '☆'}</button>
        </div>
        <div className="stats">
          <span><b>{km ? `${km.toFixed(1)} km` : 'GPS'}</b><small>afstand</small></span>
          <span><b>{place.rating}</b><small>rating</small></span>
          <span><b>{place.price}</b><small>pris</small></span>
        </div>
        <div className="buttons">
          <a href={maps(place, 'apple')} target="_blank" rel="noreferrer">Apple Maps</a>
          <a href={maps(place, 'google')} target="_blank" rel="noreferrer" className="dark">Google Maps</a>
          {place.type === 'Restaurant' && <a href={maps(place, 'tripadvisor')} target="_blank" rel="noreferrer" className="green">Tripadvisor</a>}
        </div>
      </article>
    );
  };

  return (
    <main>
      <header className="hero">
        <p>Gdańsk · Old Town</p>
        <h1>Gdańsk Companion</h1>
        <p className="hero-text">Jess Krolewski Gdansk Old Town</p>
        <div className="status">{location ? 'GPS aktiv' : 'GPS klar'} · {favorites.length} favoritter · {expenses.length} udgifter</div>
      </header>

      <nav>
        {[
          ['nearby', '📍', 'Forside'],
          ['food', '🍽️', 'Mad'],
          ['plan', '📅', 'Plan'],
          ['budget', '💰', 'Budget'],
          ['info', '✈️', 'Info']
        ].map(([id, icon, label]) => (
          <button key={id} className={tab === id ? 'selected' : ''} onClick={() => setTab(id)}><span>{icon}</span>{label}</button>
        ))}
      </nav>

      {tab === 'nearby' && <section>
        <div className="card intro">
          <div>
            <h2>📍 Hvad er tæt på?</h2>
            <p>Tryk på GPS, så sorterer appen steder efter din position.</p>
            {locationError && <p className="error">{locationError}</p>}
          </div>
          <button className="primary" onClick={useCurrentLocation}>Brug min position</button>
        </div>

        <div className="card">
          <h2>🌦️ Vejr i Gdańsk</h2>
          <p>Åbn vejrudsigten, så I hurtigt kan vælge mellem byvandring, museum eller restaurant.</p>
          <div className="buttons"><a href={weatherUrl} target="_blank" rel="noreferrer">Åbn vejrudsigt</a></div>
        </div>

        <div className="card">
          <h2>🏨 Tilbage til hotellet</h2>
          <p>{HOTEL.name}</p>
          <div className="buttons">
            <a href={hotelAppleMaps} target="_blank" rel="noreferrer">Åbn i Apple Maps</a>
            <a href={hotelGoogleMaps} target="_blank" rel="noreferrer" className="dark">Åbn i Google Maps</a>
          </div>
        </div>

        <div className="card">
          <h2>🤔 Hvad skal vi lave nu?</h2>
          <p className="meta">{nowSuggestion.title}</p>
          <p>{nowSuggestion.text}</p>
          {nowSuggestion.items.map((item) => <p className="todo" key={item}>{item}</p>)}
        </div>

        <div className="grid">{sortedPlaces.map((place) => <Card key={place.id} place={place} />)}</div>
      </section>}

      {tab === 'food' && <section>
        <div className="card"><h2>🍽️ Restauranter, caféer og barer</h2><p>Udvalgte steder med kort og Tripadvisor-søgning.</p></div>
        <div className="grid">{PLACES.filter((p) => p.type === 'Restaurant').map((place) => <Card key={place.id} place={place} />)}</div>
      </section>}

      {tab === 'plan' && <section>
        <div className="day-grid">{ITINERARY.map((day) => <article className="card" key={day.day}><p className="meta">{day.day}</p><h2>{day.title}</h2>{day.items.map((item) => <p className="todo" key={item}>✅ {item}</p>)}</article>)}</div>
        <div className="card"><h2>⭐ Favoritter</h2>{favorites.length === 0 ? <p>Tryk på stjernen ved et sted for at gemme det.</p> : <div className="grid">{favorites.map((place) => <Card key={place.id} place={place} />)}</div>}</div>
      </section>}

      {tab === 'budget' && <section className="two-col">
        <article className="card"><h2>💰 PLN til DKK</h2><p>Fast kurs i appen: 1 PLN = {dkkRate.toFixed(2)} DKK.</p><input value={pln} onChange={(e) => setPln(e.target.value)} inputMode="decimal" /><div className="result">{((Number(String(pln).replace(',', '.')) || 0) * dkkRate).toFixed(2)} DKK</div></article>
        <article className="card"><h2>🧾 Udgifter</h2><div className="expense-input"><input value={expenseName} onChange={(e) => setExpenseName(e.target.value)} placeholder="Fx frokost" /><input value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="PLN" inputMode="decimal" /></div><button className="primary" onClick={addExpense}>Tilføj</button>{expenses.map((item) => <div className="expense" key={item.id}><span>{item.name}</span><b>{item.amount.toFixed(2)} PLN</b><button onClick={() => setExpenses((x) => x.filter((e) => e.id !== item.id))}>Slet</button></div>)}<div className="total">Total: {total.toFixed(2)} PLN · {(total * dkkRate).toFixed(2)} DKK</div></article>
      </section>}

      {tab === 'info' && <section className="two-col">
        <article className="card"><h2>✈️ Rejseinfo</h2>{[['hotel','Hotel'],['flight','Fly'],['booking','Bookingnumre'],['notes','Noter']].map(([field, label]) => <label key={field}>{label}<textarea value={tripInfo[field] || ''} onChange={(e) => setTripInfo({ ...tripInfo, [field]: e.target.value })} placeholder="Skriv her..." /></label>)}</article>
        <article className="card"><h2>📱 Del appen</h2><ol><li>Send linket til appen.</li><li>Åbn linket i Safari.</li><li>Tryk Del.</li><li>Vælg Føj til hjemmeskærm.</li></ol><p className="note">Favoritter, budget og noter gemmes lokalt på hver telefon.</p></article>
      </section>}
    </main>
  );
}
