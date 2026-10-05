import type { RestaurantSeed } from '@/types/restaurant';

/**
 * Tišina — restaurant facts, menu and opening hours.
 *
 * This file is the single source of truth for seeding Supabase
 * (`npm run db:seed` writes supabase/seed.sql from it) and the offline
 * fallback the website renders if Supabase is unreachable.
 *
 * Once a restaurant is live, staff edit menu and hours in Supabase; keep this
 * file in sync only if you want the fallback to match.
 */
export const restaurant: RestaurantSeed = {
  slug: 'tisina',
  name: 'Tišina',
  cuisine: ['Croatian', 'Modern European', 'Mediterranean'],
  address: {
    street: 'Opatička ulica 14',
    postalCode: '10000',
    city: 'Zagreb',
    region: 'Grad Zagreb',
    countryCode: 'HR',
  },
  geo: { lat: 45.8164, lng: 15.9772 },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Opati%C4%8Dka+ulica+14%2C+10000+Zagreb',
  phone: '+385 1 4851 290',
  email: 'stol@tisina-zagreb.hr',
  website: 'https://tisina-zagreb.hr',
  instagram: 'https://www.instagram.com/tisina.zagreb',
  timezone: 'Europe/Zagreb',
  currency: 'EUR',
  priceRange: '€€€',
  defaultLocale: 'hr',
  locales: ['hr', 'en', 'de', 'hu'],

  booking: {
    enabled: true,
    minParty: 1,
    maxParty: 8,
    leadMinutes: 120,
    windowDays: 90,
    slotMinutes: 30,
    lastSeatingMinutes: 90,
  },

  i18n: {
    hr: {
      tagline: 'Tiha blagovaonica u Gornjem gradu',
      shortDescription: 'Hrvatske regije, kuhane polako. Restoran u Opatičkoj ulici, Zagreb.',
      description:
        'Tišina je restoran u zagrebačkom Gornjem gradu. Kuhamo Hrvatsku regiju po regiju — istarski tartuf, dalmatinska jela koja se krčkaju satima, sir i vrhnje Zagorja — i poslužujemo ih bez žurbe, u blagovaonici od dvadeset i osam mjesta.',
      cuisineLabel: 'Hrvatska regionalna kuhinja',
      metaTitle: 'Tišina — restoran u Gornjem gradu, Zagreb',
      metaDescription:
        'Hrvatska regionalna kuhinja u Opatičkoj ulici. Ručak i večera od utorka do nedjelje, degustacijski meni i vina iz hrvatskih vinogorja. Rezervirajte stol.',
    },
    en: {
      tagline: 'A quiet dining room in the Upper Town',
      shortDescription: 'Croatian regions, cooked slowly. A restaurant on Opatička Street, Zagreb.',
      description:
        "Tišina is a restaurant in Zagreb's Upper Town. We cook Croatia one region at a time — Istrian truffle, Dalmatian dishes braised for hours, the cheese and cream of Zagorje — and serve it without hurry, in a dining room of twenty-eight seats.",
      cuisineLabel: 'Croatian regional cuisine',
      metaTitle: 'Tišina — Restaurant in the Upper Town, Zagreb',
      metaDescription:
        'Croatian regional cooking on Opatička Street, Zagreb. Lunch and dinner Tuesday to Sunday, a tasting menu and wines from Croatian vineyards. Reserve a table.',
    },
    de: {
      tagline: 'Ein stiller Speisesaal in der Oberstadt',
      shortDescription: 'Kroatiens Regionen, langsam gekocht. Ein Restaurant in der Opatička-Straße, Zagreb.',
      description:
        'Tišina ist ein Restaurant in der Zagreber Oberstadt. Wir kochen Kroatien Region für Region — istrischer Trüffel, stundenlang geschmorte dalmatinische Gerichte, Käse und Rahm aus dem Zagorje — und servieren ohne Eile, in einem Speisesaal mit achtundzwanzig Plätzen.',
      cuisineLabel: 'Kroatische Regionalküche',
      metaTitle: 'Tišina — Restaurant in der Oberstadt, Zagreb',
      metaDescription:
        'Kroatische Regionalküche in der Opatička-Straße, Zagreb. Mittag- und Abendessen von Dienstag bis Sonntag, Degustationsmenü und Weine aus kroatischen Lagen. Tisch reservieren.',
    },
    hu: {
      tagline: 'Csendes étterem a Felsővárosban',
      shortDescription: 'Horvátország tájegységei, lassan főzve. Étterem az Opatička utcában, Zágráb.',
      description:
        'A Tišina étterem Zágráb Felsővárosában. Horvátországot tájegységről tájegységre főzzük — isztriai szarvasgomba, órákig párolt dalmát fogások, a Zagorje sajtja és tejszíne — és sietség nélkül tálaljuk, egy huszonnyolc férőhelyes étteremben.',
      cuisineLabel: 'Horvát regionális konyha',
      metaTitle: 'Tišina — Étterem a Felsővárosban, Zágráb',
      metaDescription:
        'Horvát regionális konyha az Opatička utcában, Zágrábban. Ebéd és vacsora keddtől vasárnapig, kóstolómenü és horvát borvidékek borai. Foglaljon asztalt.',
    },
  },

  // Monday closed. Lunch and dinner Tue–Sat, lunch only on Sunday.
  hours: [
    { day: 2, service: 'lunch', opens: '12:00', closes: '15:00' },
    { day: 2, service: 'dinner', opens: '18:30', closes: '23:00' },
    { day: 3, service: 'lunch', opens: '12:00', closes: '15:00' },
    { day: 3, service: 'dinner', opens: '18:30', closes: '23:00' },
    { day: 4, service: 'lunch', opens: '12:00', closes: '15:00' },
    { day: 4, service: 'dinner', opens: '18:30', closes: '23:00' },
    { day: 5, service: 'lunch', opens: '12:00', closes: '15:00' },
    { day: 5, service: 'dinner', opens: '18:30', closes: '23:30' },
    { day: 6, service: 'lunch', opens: '12:30', closes: '15:30' },
    { day: 6, service: 'dinner', opens: '18:30', closes: '23:30' },
    { day: 7, service: 'lunch', opens: '12:30', closes: '16:30' },
  ],

  specialHours: [
    {
      date: '2026-12-24',
      closed: true,
      label: { hr: 'Badnjak', en: 'Christmas Eve', de: 'Heiligabend', hu: 'Szenteste' },
    },
    {
      date: '2026-12-25',
      closed: true,
      label: { hr: 'Božić', en: 'Christmas Day', de: 'Erster Weihnachtstag', hu: 'Karácsony' },
    },
    {
      date: '2026-12-31',
      closed: false,
      service: 'dinner',
      opens: '19:00',
      closes: '23:59',
      label: { hr: 'Stara godina — jedan slijed večere', en: "New Year's Eve — one seating", de: 'Silvester — eine Sitzung', hu: 'Szilveszter — egy turnus' },
    },
    {
      date: '2027-01-01',
      closed: true,
      label: { hr: 'Nova godina', en: "New Year's Day", de: 'Neujahr', hu: 'Újév' },
    },
  ],

  menu: [
    {
      slug: 'to-begin',
      i18n: {
        hr: { name: 'Za početak', description: 'Kruh iz naše pećnice i nekoliko zalogaja dok birate.' },
        en: { name: 'To begin', description: 'Bread from our oven and a few bites while you decide.' },
        de: { name: 'Zum Beginn', description: 'Brot aus unserem Ofen und ein paar Bissen, während Sie wählen.' },
        hu: { name: 'Kezdésnek', description: 'Kenyér a saját kemencénkből és néhány falat, amíg választ.' },
      },
      items: [
        {
          slug: 'sourdough-cultured-butter',
          price: 5,
          allergens: ['gluten', 'milk'],
          dietary: ['vegetarian'],
          i18n: {
            hr: { name: 'Kruh od kiselog tijesta', description: 'Kultivirani maslac, morska sol iz Nina.' },
            en: { name: 'Sourdough bread', description: 'Cultured butter, sea salt from Nin.' },
            de: { name: 'Sauerteigbrot', description: 'Kultivierte Butter, Meersalz aus Nin.' },
            hu: { name: 'Kovászos kenyér', description: 'Érlelt vaj, ninski tengeri só.' },
          },
        },
        {
          slug: 'pag-cheese-sage-honey',
          price: 9,
          allergens: ['milk', 'nuts'],
          dietary: ['vegetarian', 'gluten_free'],
          i18n: {
            hr: { name: 'Paški sir', description: 'Med od kadulje, pečeni orasi.' },
            en: { name: 'Pag island cheese', description: 'Sage honey, roasted walnuts.' },
            de: { name: 'Käse von der Insel Pag', description: 'Salbeihonig, geröstete Walnüsse.' },
            hu: { name: 'Pagi sajt', description: 'Zsályaméz, pirított dió.' },
          },
        },
        {
          slug: 'ston-oysters',
          price: 4.5,
          seasonal: true,
          allergens: ['molluscs'],
          dietary: ['gluten_free', 'dairy_free', 'pescatarian'],
          i18n: {
            hr: { name: 'Kamenica iz Malostonskog zaljeva', description: 'Po komadu. Ocat od malvazije, ljutika.' },
            en: { name: 'Ston oyster', description: 'Per piece. Malvazija vinegar, shallot.' },
            de: { name: 'Auster aus Ston', description: 'Pro Stück. Malvazija-Essig, Schalotte.' },
            hu: { name: 'Stoni osztriga', description: 'Darabra. Malvazija-ecet, salottahagyma.' },
          },
        },
      ],
    },
    {
      slug: 'starters',
      i18n: {
        hr: { name: 'Predjela', description: 'Hladno i toplo, s obale i iz unutrašnjosti.' },
        en: { name: 'Starters', description: 'Cold and warm, from the coast and the interior.' },
        de: { name: 'Vorspeisen', description: 'Kalt und warm, von der Küste und aus dem Hinterland.' },
        hu: { name: 'Előételek', description: 'Hidegen és melegen, a tengerpartról és a szárazföld belsejéből.' },
      },
      items: [
        {
          slug: 'adriatic-tuna-tartare',
          price: 19,
          image: '/images/dishes/tuna-tartare.jpg',
          featured: true,
          allergens: ['fish', 'gluten', 'eggs'],
          dietary: ['pescatarian', 'dairy_free'],
          i18n: {
            hr: { name: 'Tartar od jadranske tune', description: 'Istarsko maslinovo ulje, listovi kapara, rotkvica, crni maslinov pire, raženi krekeri.' },
            en: { name: 'Adriatic tuna tartare', description: 'Istrian olive oil, caper leaves, radish, black olive purée, rye crisps.' },
            de: { name: 'Tatar vom Adria-Thunfisch', description: 'Istrisches Olivenöl, Kapernblätter, Radieschen, Schwarzolivenpüree, Roggen-Cracker.' },
            hu: { name: 'Adriai tonhal tatár', description: 'Isztriai olívaolaj, kapribogyó levél, retek, fekete olívakrém, rozskeksz.' },
          },
        },
        {
          slug: 'burrata-neretva-tomatoes',
          price: 16,
          image: '/images/dishes/burrata.jpg',
          seasonal: true,
          allergens: ['milk', 'sulphites'],
          dietary: ['vegetarian', 'gluten_free'],
          i18n: {
            hr: { name: 'Burrata i rajčice iz doline Neretve', description: 'Bosiljak, odležani ocat, maslinovo ulje iz Bala.' },
            en: { name: 'Burrata, Neretva valley tomatoes', description: 'Basil, aged vinegar, olive oil from Bale.' },
            de: { name: 'Burrata, Tomaten aus dem Neretva-Tal', description: 'Basilikum, gereifter Essig, Olivenöl aus Bale.' },
            hu: { name: 'Burrata, Neretva-völgyi paradicsom', description: 'Bazsalikom, érlelt ecet, bale-i olívaolaj.' },
          },
        },
        {
          slug: 'baked-strukli',
          price: 12,
          allergens: ['gluten', 'milk', 'eggs'],
          dietary: ['vegetarian'],
          i18n: {
            hr: { name: 'Zapečeni štrukli', description: 'Svježi kravlji sir, vrhnje, smeđi maslac. Recept iz Zagorja.' },
            en: { name: 'Baked štrukli', description: 'Fresh cow’s cheese, cream, brown butter. A Zagorje recipe.' },
            de: { name: 'Überbackene Štrukli', description: 'Frischer Kuhkäse, Rahm, braune Butter. Ein Rezept aus dem Zagorje.' },
            hu: { name: 'Sült štrukli', description: 'Friss tehéntúró, tejszín, barna vaj. Zagorjei recept.' },
          },
        },
        {
          slug: 'porcini-consomme',
          price: 11,
          seasonal: true,
          allergens: ['celery'],
          dietary: ['vegan', 'gluten_free', 'dairy_free'],
          i18n: {
            hr: { name: 'Bistra juha od vrganja', description: 'Vrganji s Učke, ulje od lovora.' },
            en: { name: 'Porcini consommé', description: 'Porcini from Učka, bay leaf oil.' },
            de: { name: 'Steinpilzconsommé', description: 'Steinpilze vom Učka-Gebirge, Lorbeeröl.' },
            hu: { name: 'Vargánya erőleves', description: 'Učka-hegyi vargánya, babérlevél-olaj.' },
          },
        },
      ],
    },
    {
      slug: 'pasta',
      i18n: {
        hr: { name: 'Tjestenina', description: 'Svako jutro ručno, od domaćeg brašna i jaja.' },
        en: { name: 'Pasta', description: 'Made by hand every morning, from Croatian flour and eggs.' },
        de: { name: 'Pasta', description: 'Jeden Morgen von Hand, aus kroatischem Mehl und Eiern.' },
        hu: { name: 'Tészták', description: 'Minden reggel kézzel, horvát lisztből és tojásból.' },
      },
      items: [
        {
          slug: 'fuzi-black-truffle',
          price: 26,
          image: '/images/dishes/fuzi-truffle.jpg',
          featured: true,
          allergens: ['gluten', 'eggs', 'milk'],
          dietary: ['vegetarian'],
          i18n: {
            hr: { name: 'Fuži s istarskim crnim tartufom', description: 'Vrhnje, odležani istarski sir, tartuf ribani za stolom.' },
            en: { name: 'Fuži with Istrian black truffle', description: 'Cream, aged Istrian cheese, truffle shaved at the table.' },
            de: { name: 'Fuži mit istrischem schwarzem Trüffel', description: 'Rahm, gereifter istrischer Käse, Trüffel am Tisch gehobelt.' },
            hu: { name: 'Fuži isztriai fekete szarvasgombával', description: 'Tejszín, érlelt isztriai sajt, az asztalnál reszelt szarvasgomba.' },
          },
        },
        {
          slug: 'pljukanci-kvarner-scampi',
          price: 29,
          allergens: ['gluten', 'crustaceans', 'sulphites'],
          dietary: ['pescatarian', 'dairy_free'],
          i18n: {
            hr: { name: 'Pljukanci s kvarnerskim škampima', description: 'Limun, peršin, bijelo vino, buzara od glava.' },
            en: { name: 'Pljukanci with Kvarner scampi', description: 'Lemon, parsley, white wine, a buzara made from the heads.' },
            de: { name: 'Pljukanci mit Kvarner-Scampi', description: 'Zitrone, Petersilie, Weißwein, Buzara aus den Köpfen.' },
            hu: { name: 'Pljukanci kvarneri scampival', description: 'Citrom, petrezselyem, fehérbor, a fejekből főzött buzara.' },
          },
        },
        {
          slug: 'pumpkin-gnocchi-sage',
          price: 18,
          seasonal: true,
          allergens: ['gluten', 'eggs', 'milk', 'nuts'],
          dietary: ['vegetarian'],
          i18n: {
            hr: { name: 'Njoki od pečene bundeve', description: 'Kadulja, smeđi maslac, prženi lješnjaci.' },
            en: { name: 'Roast pumpkin gnocchi', description: 'Sage, brown butter, toasted hazelnuts.' },
            de: { name: 'Gnocchi vom gerösteten Kürbis', description: 'Salbei, braune Butter, geröstete Haselnüsse.' },
            hu: { name: 'Sült sütőtökös gnocchi', description: 'Zsálya, barna vaj, pirított mogyoró.' },
          },
        },
      ],
    },
    {
      slug: 'from-the-sea',
      i18n: {
        hr: { name: 'Iz mora', description: 'Ono što je jutros stiglo s otoka.' },
        en: { name: 'From the sea', description: 'Whatever arrived from the islands this morning.' },
        de: { name: 'Aus dem Meer', description: 'Was heute Morgen von den Inseln kam.' },
        hu: { name: 'A tengerből', description: 'Ami ma reggel a szigetekről érkezett.' },
      },
      items: [
        {
          slug: 'sea-bass-chard',
          price: 32,
          allergens: ['fish'],
          dietary: ['pescatarian', 'gluten_free', 'dairy_free'],
          i18n: {
            hr: { name: 'Brancin s gradela', description: 'Blitva s krumpirom, češnjak, maslinovo ulje iz Bala.' },
            en: { name: 'Grilled sea bass', description: 'Swiss chard with potato, garlic, olive oil from Bale.' },
            de: { name: 'Gegrillter Wolfsbarsch', description: 'Mangold mit Kartoffel, Knoblauch, Olivenöl aus Bale.' },
            hu: { name: 'Grillezett tengeri sügér', description: 'Mángold burgonyával, fokhagyma, bale-i olívaolaj.' },
          },
        },
        {
          slug: 'octopus-peka',
          price: 34,
          allergens: ['molluscs'],
          dietary: ['gluten_free', 'dairy_free'],
          i18n: {
            hr: { name: 'Hobotnica ispod peke', description: 'Krumpir, ružmarin, crveni luk. Pripremamo za dvoje ili više.' },
            en: { name: 'Octopus under the peka', description: 'Potato, rosemary, red onion. Prepared for two or more.' },
            de: { name: 'Oktopus unter der Peka', description: 'Kartoffel, Rosmarin, rote Zwiebel. Für zwei oder mehr Personen.' },
            hu: { name: 'Polip peka alatt', description: 'Burgonya, rozmaring, vöröshagyma. Két vagy több főre.' },
          },
        },
        {
          slug: 'fish-of-the-day',
          price: null,
          allergens: ['fish'],
          dietary: ['pescatarian', 'gluten_free'],
          i18n: {
            hr: { name: 'Riba dana', description: 'Cijena prema dnevnom ulovu. Pitajte konobara.' },
            en: { name: 'Fish of the day', description: 'Priced by the day’s catch. Ask your waiter.' },
            de: { name: 'Fisch des Tages', description: 'Preis nach Tagesfang. Fragen Sie Ihren Kellner.' },
            hu: { name: 'A nap hala', description: 'Ár a napi fogás szerint. Kérdezze a pincért.' },
          },
        },
      ],
    },
    {
      slug: 'from-the-land',
      i18n: {
        hr: { name: 'S kopna', description: 'Sporo, na kosti, kako su nas učili.' },
        en: { name: 'From the land', description: 'Slow, on the bone, the way we were taught.' },
        de: { name: 'Vom Land', description: 'Langsam, am Knochen, so wie wir es gelernt haben.' },
        hu: { name: 'A szárazföldről', description: 'Lassan, csonton, ahogy tanultuk.' },
      },
      items: [
        {
          slug: 'dalmatian-pasticada',
          price: 30,
          image: '/images/dishes/pasticada.jpg',
          featured: true,
          allergens: ['gluten', 'eggs', 'celery', 'sulphites'],
          dietary: [],
          i18n: {
            hr: { name: 'Dalmatinska pašticada', description: 'Govedina marinirana dva dana, pirjana u prošeku sa suhim šljivama. Domaći njoki.' },
            en: { name: 'Dalmatian pašticada', description: 'Beef marinated for two days, braised in prošek with dried plums. House gnocchi.' },
            de: { name: 'Dalmatinische Pašticada', description: 'Zwei Tage mariniertes Rind, in Prošek mit Dörrpflaumen geschmort. Hausgemachte Gnocchi.' },
            hu: { name: 'Dalmát pašticada', description: 'Két napig pácolt marha, prošekben párolva aszalt szilvával. Házi gnocchi.' },
          },
        },
        {
          slug: 'turkey-mlinci',
          price: 26,
          allergens: ['gluten', 'eggs'],
          dietary: ['dairy_free'],
          i18n: {
            hr: { name: 'Zagorska purica s mlincima', description: 'Pečena na masti, mlinci natopljeni sokom od pečenja.' },
            en: { name: 'Zagorje turkey with mlinci', description: 'Roasted in its own fat, mlinci flatbread soaked in the roasting juices.' },
            de: { name: 'Zagorje-Pute mit Mlinci', description: 'Im eigenen Fett gebraten, Mlinci-Fladen im Bratensaft getränkt.' },
            hu: { name: 'Zagorjei pulyka mlincivel', description: 'Saját zsírjában sütve, a pecsenyelében áztatott mlinci lepénnyel.' },
          },
        },
        {
          slug: 'lika-lamb',
          price: 34,
          seasonal: true,
          allergens: ['sulphites'],
          dietary: ['gluten_free', 'dairy_free'],
          i18n: {
            hr: { name: 'Janjetina iz Like', description: 'Pečena polako na drvu, mladi luk, kiselo vrhnje od kozjeg mlijeka.' },
            en: { name: 'Lika lamb', description: 'Slow-roasted over wood, spring onion, goat’s milk soured cream.' },
            de: { name: 'Lamm aus der Lika', description: 'Langsam über Holz gebraten, Frühlingszwiebel, Sauerrahm aus Ziegenmilch.' },
            hu: { name: 'Likai bárány', description: 'Fán lassan sütve, újhagyma, kecsketejes tejföl.' },
          },
        },
      ],
    },
    {
      slug: 'garden',
      i18n: {
        hr: { name: 'Iz vrta', description: 'Povrće s obiteljskih gospodarstava oko Zagreba.' },
        en: { name: 'From the garden', description: 'Vegetables from family farms around Zagreb.' },
        de: { name: 'Aus dem Garten', description: 'Gemüse von Familienhöfen rund um Zagreb.' },
        hu: { name: 'A kertből', description: 'Zöldség Zágráb környéki családi gazdaságokból.' },
      },
      items: [
        {
          slug: 'roasted-beetroot-goat-cheese',
          price: 14,
          allergens: ['milk', 'nuts'],
          dietary: ['vegetarian', 'gluten_free'],
          i18n: {
            hr: { name: 'Pečena cikla', description: 'Svježi kozji sir, lješnjaci, ocat od bazge.' },
            en: { name: 'Roasted beetroot', description: 'Fresh goat’s cheese, hazelnuts, elderflower vinegar.' },
            de: { name: 'Geröstete Rote Bete', description: 'Frischer Ziegenkäse, Haselnüsse, Holunderblütenessig.' },
            hu: { name: 'Sült cékla', description: 'Friss kecskesajt, mogyoró, bodzaecet.' },
          },
        },
        {
          slug: 'chard-potato',
          price: 7,
          allergens: [],
          dietary: ['vegan', 'gluten_free', 'dairy_free'],
          i18n: {
            hr: { name: 'Blitva s krumpirom', description: 'Prilog. Češnjak, maslinovo ulje.' },
            en: { name: 'Swiss chard and potato', description: 'Side. Garlic, olive oil.' },
            de: { name: 'Mangold mit Kartoffel', description: 'Beilage. Knoblauch, Olivenöl.' },
            hu: { name: 'Mángold burgonyával', description: 'Köret. Fokhagyma, olívaolaj.' },
          },
        },
      ],
    },
    {
      slug: 'desserts',
      i18n: {
        hr: { name: 'Deserti', description: 'Recepti naših baka, malo manje slatki.' },
        en: { name: 'Desserts', description: 'Our grandmothers’ recipes, a little less sweet.' },
        de: { name: 'Desserts', description: 'Rezepte unserer Großmütter, etwas weniger süß.' },
        hu: { name: 'Desszertek', description: 'Nagymamáink receptjei, kicsit kevésbé édesen.' },
      },
      items: [
        {
          slug: 'goat-milk-panna-cotta',
          price: 10,
          image: '/images/dishes/panna-cotta.jpg',
          featured: true,
          seasonal: true,
          allergens: ['milk'],
          dietary: ['vegetarian', 'gluten_free'],
          i18n: {
            hr: { name: 'Panna cotta od kozjeg mlijeka', description: 'Šumsko voće s Medvednice, lavanda s Hvara.' },
            en: { name: 'Goat’s milk panna cotta', description: 'Wild berries from Medvednica, lavender from Hvar.' },
            de: { name: 'Panna cotta aus Ziegenmilch', description: 'Waldbeeren vom Medvednica, Lavendel von Hvar.' },
            hu: { name: 'Kecsketejes panna cotta', description: 'Medvednicai erdei gyümölcs, hvari levendula.' },
          },
        },
        {
          slug: 'rozata',
          price: 9,
          allergens: ['milk', 'eggs'],
          dietary: ['vegetarian', 'gluten_free'],
          i18n: {
            hr: { name: 'Rožata', description: 'Dubrovačka krema od jaja, liker od ruže, karamel.' },
            en: { name: 'Rožata', description: 'Dubrovnik custard, rose liqueur, caramel.' },
            de: { name: 'Rožata', description: 'Dubrovniker Eiercreme, Rosenlikör, Karamell.' },
            hu: { name: 'Rožata', description: 'Dubrovniki tojáskrém, rózsalikőr, karamell.' },
          },
        },
        {
          slug: 'samobor-kremsnita',
          price: 8,
          allergens: ['gluten', 'milk', 'eggs'],
          dietary: ['vegetarian'],
          i18n: {
            hr: { name: 'Kremšnita', description: 'Lisnato tijesto, vanilija, šlag. Po samoborskom receptu.' },
            en: { name: 'Kremšnita', description: 'Puff pastry, vanilla custard, cream. The Samobor way.' },
            de: { name: 'Kremšnita', description: 'Blätterteig, Vanillecreme, Sahne. Nach Samoborer Art.' },
            hu: { name: 'Krémes', description: 'Leveles tészta, vaníliakrém, tejszínhab. Szamobori módra.' },
          },
        },
      ],
    },
    {
      slug: 'tasting',
      i18n: {
        hr: { name: 'Degustacija', description: 'Za cijeli stol. Narudžba do 21:00.' },
        en: { name: 'Tasting', description: 'For the whole table. Last order 21:00.' },
        de: { name: 'Degustation', description: 'Für den ganzen Tisch. Letzte Bestellung 21:00.' },
        hu: { name: 'Kóstolómenü', description: 'Az egész asztalnak. Utolsó rendelés 21:00.' },
      },
      items: [
        {
          slug: 'six-courses',
          price: 85,
          i18n: {
            hr: { name: 'Šest sljedova', description: 'Put kroz pet regija, od Istre do Slavonije.' },
            en: { name: 'Six courses', description: 'A route through five regions, from Istria to Slavonia.' },
            de: { name: 'Sechs Gänge', description: 'Eine Reise durch fünf Regionen, von Istrien bis Slawonien.' },
            hu: { name: 'Hat fogás', description: 'Út öt tájegységen át, Isztriától Szlavóniáig.' },
          },
        },
        {
          slug: 'wine-pairing',
          price: 55,
          allergens: ['sulphites'],
          i18n: {
            hr: { name: 'Sljubljivanje vina', description: 'Šest vina malih hrvatskih vinara.' },
            en: { name: 'Wine pairing', description: 'Six wines from small Croatian growers.' },
            de: { name: 'Weinbegleitung', description: 'Sechs Weine kleiner kroatischer Winzer.' },
            hu: { name: 'Borpárosítás', description: 'Hat bor kis horvát pincészetektől.' },
          },
        },
      ],
    },
    {
      slug: 'wine',
      i18n: {
        hr: { name: 'Vino na čašu', description: '0,15 l. Cijela vinska karta za stolom.' },
        en: { name: 'Wine by the glass', description: '150 ml. The full list is at the table.' },
        de: { name: 'Wein im Glas', description: '0,15 l. Die vollständige Karte am Tisch.' },
        hu: { name: 'Pohárborok', description: '1,5 dl. A teljes borlap az asztalnál.' },
      },
      items: [
        {
          slug: 'grasevina',
          price: 7,
          allergens: ['sulphites'],
          i18n: {
            hr: { name: 'Graševina', description: 'Kutjevo, Slavonija. Svježe, jabuka, badem.' },
            en: { name: 'Graševina', description: 'Kutjevo, Slavonia. Fresh, apple, almond.' },
            de: { name: 'Graševina', description: 'Kutjevo, Slawonien. Frisch, Apfel, Mandel.' },
            hu: { name: 'Graševina', description: 'Kutjevo, Szlavónia. Friss, alma, mandula.' },
          },
        },
        {
          slug: 'malvazija',
          price: 8,
          allergens: ['sulphites'],
          i18n: {
            hr: { name: 'Malvazija istarska', description: 'Zapadna Istra. Slano, kruška, bijelo cvijeće.' },
            en: { name: 'Malvazija istarska', description: 'Western Istria. Saline, pear, white flowers.' },
            de: { name: 'Malvazija istarska', description: 'Westistrien. Salzig, Birne, weiße Blüten.' },
            hu: { name: 'Malvazija istarska', description: 'Nyugat-Isztria. Sós, körte, fehér virágok.' },
          },
        },
        {
          slug: 'posip',
          price: 9,
          allergens: ['sulphites'],
          i18n: {
            hr: { name: 'Pošip', description: 'Korčula. Puno, smilje, citrus.' },
            en: { name: 'Pošip', description: 'Korčula. Full, immortelle, citrus.' },
            de: { name: 'Pošip', description: 'Korčula. Vollmundig, Strohblume, Zitrus.' },
            hu: { name: 'Pošip', description: 'Korčula. Testes, szalmagyopár, citrus.' },
          },
        },
        {
          slug: 'teran',
          price: 9,
          allergens: ['sulphites'],
          i18n: {
            hr: { name: 'Teran', description: 'Središnja Istra. Kiselo voće, crvena zemlja.' },
            en: { name: 'Teran', description: 'Central Istria. Tart fruit, red earth.' },
            de: { name: 'Teran', description: 'Zentralistrien. Säuerliche Frucht, rote Erde.' },
            hu: { name: 'Teran', description: 'Közép-Isztria. Savanykás gyümölcs, vörös föld.' },
          },
        },
        {
          slug: 'plavac-mali',
          price: 11,
          allergens: ['sulphites'],
          i18n: {
            hr: { name: 'Plavac mali', description: 'Pelješac. Suha šljiva, rogač, sunce.' },
            en: { name: 'Plavac mali', description: 'Pelješac. Dried plum, carob, sun.' },
            de: { name: 'Plavac mali', description: 'Pelješac. Dörrpflaume, Johannisbrot, Sonne.' },
            hu: { name: 'Plavac mali', description: 'Pelješac. Aszalt szilva, szentjánoskenyér, napfény.' },
          },
        },
        {
          slug: 'prosek',
          price: 8,
          allergens: ['sulphites'],
          i18n: {
            hr: { name: 'Prošek', description: 'Desertno vino od prosušenog grožđa. Dalmacija.' },
            en: { name: 'Prošek', description: 'Sweet wine from sun-dried grapes. Dalmatia.' },
            de: { name: 'Prošek', description: 'Süßwein aus sonnengetrockneten Trauben. Dalmatien.' },
            hu: { name: 'Prošek', description: 'Napon aszalt szőlőből készült desszertbor. Dalmácia.' },
          },
        },
      ],
    },
  ],
};
