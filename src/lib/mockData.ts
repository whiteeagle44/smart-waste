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
    name: 'PSZOK - Punkt Selektywnego Zbierania Odpadów Komunalnych',
    address: 'ul. Ekologiczna 1, Warszawa',
    lat: 52.2297,
    lng: 21.0122,
    accepted_categories: ['Gabaryty', 'Elektrośmieci', 'Opony', 'Odpady niebezpieczne'],
  },
  {
    id: '2',
    name: 'Pojemnik na elektrośmieci',
    address: 'ul. Marszałkowska 100, Warszawa',
    lat: 52.2310,
    lng: 21.0080,
    accepted_categories: ['Drobne elektrośmieci', 'Baterie'],
  },
  {
    id: '3',
    name: 'Apteka "Zdrowie" - zbiórka leków',
    address: 'ul. Nowy Świat 50, Warszawa',
    lat: 52.2350,
    lng: 21.0180,
    accepted_categories: ['Przeterminowane leki'],
  },
  {
    id: '4',
    name: 'Skup złomu i makulatury',
    address: 'ul. Przemysłowa 5, Warszawa',
    lat: 52.2100,
    lng: 20.9800,
    accepted_categories: ['Złom', 'Makulatura'],
  }
];

export const fetchCollectionPoints = async (): Promise<CollectionPoint[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCollectionPoints);
    }, 800); // Symulacja opóźnienia sieci
  });
};
