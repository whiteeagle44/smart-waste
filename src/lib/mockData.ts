export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  accepted_categories: string[];
}

export const mockCollectionPoints: CollectionPoint[] = [
  {
    id: '1',
    name: 'PSZOK Wilanów',
    address: 'ul. Zawodzie 1, 02-981 Warszawa, Polska',
    lat: 52.1818,
    lng: 21.0888,
    accepted_categories: ['Gabaryty', 'Elektrośmieci', 'Opony', 'Odpady niebezpieczne', 'Odpady budowlane i poremontowe', 'Baterie i akumulatory'],
  },
  {
    id: '2',
    name: 'Pojemnik na elektrośmieci',
    address: 'ul. Marszałkowska 100, 00-024 Warszawa, Polska',
    lat: 52.2310,
    lng: 21.0080,
    accepted_categories: ['Elektrośmieci', 'Baterie i akumulatory'],
  },
  {
    id: '3',
    name: 'Apteka "Zdrowie" - zbiórka leków',
    address: 'ul. Nowy Świat 50, 00-363 Warszawa, Polska',
    lat: 52.2350,
    lng: 21.0180,
    accepted_categories: ['Leki i odpady medyczne'],
  },
  {
    id: '4',
    name: 'Skup złomu i makulatury',
    address: 'ul. Przemysłowa 5, 00-450 Warszawa, Polska',
    lat: 52.2100,
    lng: 20.9800,
    accepted_categories: ['Metale i tworzywa sztuczne', 'Papier'],
  },
  {
    id: '5',
    name: 'Kontener PCK',
    address: 'ul. Świętokrzyska 14, 00-050 Warszawa, Polska',
    lat: 52.2365,
    lng: 21.0050,
    accepted_categories: ['Tekstylia i odzież'],
  },
  {
    id: '6',
    name: 'PSZOK Wola',
    address: 'ul. Tatarska 2/4, 01-464 Warszawa, Polska',
    lat: 52.2480,
    lng: 20.9700,
    accepted_categories: ['Gabaryty', 'Elektrośmieci', 'Opony', 'Odpady niebezpieczne', 'Odpady budowlane i poremontowe'],
  },
  {
    id: '7',
    name: 'Pojemniki do segregacji - Plac Politechniki',
    address: 'Plac Politechniki 1, 00-661 Warszawa, Polska',
    lat: 52.2195,
    lng: 21.0115,
    accepted_categories: ['Szkło', 'Papier', 'Metale i tworzywa sztuczne']
  },
  {
    id: '8',
    name: 'Pojemnik PCK - Śródmieście',
    address: 'ul. Nowowiejska 15, 00-665 Warszawa, Polska',
    lat: 52.2180,
    lng: 21.0080,
    accepted_categories: ['Tekstylia i odzież']
  },
  {
    id: '9',
    name: 'Apteka Ziko',
    address: 'ul. Waryńskiego 12, 00-631 Warszawa, Polska',
    lat: 52.2210,
    lng: 21.0150,
    accepted_categories: ['Leki i odpady medyczne']
  },
  {
    id: '10',
    name: 'Pojemnik na elektrośmieci',
    address: 'ul. Koszykowa 63, 00-667 Warszawa, Polska',
    lat: 52.2250,
    lng: 21.0100,
    accepted_categories: ['Elektrośmieci', 'Baterie i akumulatory']
  },
  {
    id: '11',
    name: 'Pojemniki do segregacji - Koszykowa',
    address: 'ul. Koszykowa 75, 00-662 Warszawa, Polska',
    lat: 52.2230,
    lng: 21.0050,
    accepted_categories: ['Szkło', 'Papier', 'Metale i tworzywa sztuczne', 'Bioodpady']
  },
  {
    id: '12',
    name: 'PSZOK Targówek',
    address: 'ul. Płytowa 1, 03-046 Warszawa, Polska',
    lat: 52.2800,
    lng: 21.0500,
    accepted_categories: ['Gabaryty', 'Elektrośmieci', 'Odpady budowlane i poremontowe', 'Opony', 'Odpady niebezpieczne', 'Metale i tworzywa sztuczne', 'Papier', 'Szkło']
  },
  {
    id: '13',
    name: 'Pojemnik na baterie - Biedronka',
    address: 'ul. Polna 11, 00-633 Warszawa, Polska',
    lat: 52.2150,
    lng: 21.0200,
    accepted_categories: ['Baterie i akumulatory']
  },
  {
    id: '14',
    name: 'Pojemniki do segregacji - Mokotowska',
    address: 'ul. Mokotowska 45, 00-551 Warszawa, Polska',
    lat: 52.2280,
    lng: 21.0200,
    accepted_categories: ['Szkło', 'Papier', 'Metale i tworzywa sztuczne']
  },
  {
    id: '15',
    name: 'Pojemnik PCK - Mokotów',
    address: 'ul. Puławska 10, 02-566 Warszawa, Polska',
    lat: 52.2000,
    lng: 21.0250,
    accepted_categories: ['Tekstylia i odzież']
  },
  {
    id: '16',
    name: 'Apteka Cefarm',
    address: 'ul. Rakowiecka 41, 02-528 Warszawa, Polska',
    lat: 52.2100,
    lng: 21.0000,
    accepted_categories: ['Leki i odpady medyczne']
  },
  {
    id: '17',
    name: 'Elektrośmieci - RTV EURO AGD',
    address: 'ul. Złota 59, 00-120 Warszawa, Polska',
    lat: 52.2300,
    lng: 21.0020,
    accepted_categories: ['Elektrośmieci', 'Baterie i akumulatory']
  },
  {
    id: '18',
    name: 'Pojemniki do segregacji - Hoża',
    address: 'ul. Hoża 50, 00-682 Warszawa, Polska',
    lat: 52.2270,
    lng: 21.0150,
    accepted_categories: ['Szkło', 'Papier', 'Metale i tworzywa sztuczne', 'Bioodpady']
  },
  {
    id: '19',
    name: 'Kompostownik miejski - Jazdów',
    address: 'ul. Jazdów 2, 00-467 Warszawa, Polska',
    lat: 52.2200,
    lng: 21.0300,
    accepted_categories: ['Bioodpady']
  },
  {
    id: '20',
    name: 'Pojemnik na przeterminowane leki - Przychodnia',
    address: 'ul. Armii Ludowej 15, 00-632 Warszawa, Polska',
    lat: 52.2180,
    lng: 21.0180,
    accepted_categories: ['Leki i odpady medyczne']
  },
  {
    id: '21',
    name: 'Zbiórka gabarytów - Osiedle',
    address: 'ul. Filtrowa 62, 02-057 Warszawa, Polska',
    lat: 52.2200,
    lng: 20.9900,
    accepted_categories: ['Gabaryty']
  },
  {
    id: '22',
    name: 'Warsztat Samochodowy - Zbiórka Opon',
    address: 'ul. Wawelska 5, 02-034 Warszawa, Polska',
    lat: 52.2000,
    lng: 20.9800,
    accepted_categories: ['Opony', 'Odpady niebezpieczne']
  },
  {
    id: '23',
    name: 'Pojemniki do segregacji - Lwowska',
    address: 'ul. Lwowska 10, 00-658 Warszawa, Polska',
    lat: 52.2215,
    lng: 21.0125,
    accepted_categories: ['Szkło', 'Papier', 'Metale i tworzywa sztuczne', 'Odpady zmieszane']
  },
  {
    id: '24',
    name: 'Pojemniki do segregacji - Noakowskiego',
    address: 'ul. Noakowskiego 14, 00-666 Warszawa, Polska',
    lat: 52.2225,
    lng: 21.0110,
    accepted_categories: ['Szkło', 'Papier', 'Metale i tworzywa sztuczne']
  },
  {
    id: '25',
    name: 'Pojemniki do segregacji - Polna',
    address: 'ul. Polna 50, 00-644 Warszawa, Polska',
    lat: 52.2185,
    lng: 21.0160,
    accepted_categories: ['Szkło', 'Papier', 'Metale i tworzywa sztuczne', 'Bioodpady']
  }
];

export const fetchCollectionPoints = async (): Promise<CollectionPoint[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCollectionPoints);
    }, 800); // Symulacja opóźnienia sieci
  });
};
