export interface MenuItem {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: number;
  currency: string;
  image_url?: string;
  dietary_info: string[]; // e.g. ['vegan', 'gluten-free']
  allergens: string[];
  is_featured: boolean;
}

export interface MenuCategory {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  items: MenuItem[];
}

// 50+ Item Massive Professional Menu Seed Data
export const mockMenuData: MenuCategory[] = [
  {
    id: "starters",
    name: { en: "Starters", hr: "Predjela" },
    description: { en: "Light, fresh, and meticulously crafted seasonal beginnings to awaken the palate.", hr: "Lagani, svježi i pomno osmišljeni sezonski počeci za buđenje nepca." },
    items: [
      {
        id: "s-1",
        name: { en: "Adriatic Bluefin Tuna Tartare", hr: "Tartar od jadranske plavoperajne tune" },
        description: { en: "Hand-cut fresh tuna, caper berries, shallots, premium olive oil, citrus zest, and microgreens. Served with toasted artisan sourdough.", hr: "Ručno rezana svježa tuna, kapari, ljutika, vrhunsko maslinovo ulje, kora citrusa i mikrozelenje. Posluženo uz tostirani domaći kruh od kiselog tijesta." },
        price: 22.00,
        currency: "EUR",
        image_url: "/images/tuna-tartare.jpg",
        dietary_info: ["pescatarian", "dairy-free"],
        allergens: ["fish", "gluten"],
        is_featured: true
      },
      {
        id: "s-2",
        name: { en: "Artisan Burrata & Heirloom Tomatoes", hr: "Zanatska burrata i domaće rajčice" },
        description: { en: "Creamy burrata sourced from Puglia, colorful heirloom tomatoes, fresh basil leaves, aged balsamic reduction, and extra virgin olive oil.", hr: "Kremasta burrata iz Puglie, šarene domaće rajčice, svježi listovi bosiljka, reducirani odležani aceto balsamico i ekstra djevičansko maslinovo ulje." },
        price: 18.00,
        currency: "EUR",
        image_url: "/images/truffle-pasta.jpg",
        dietary_info: ["vegetarian", "gluten-free"],
        allergens: ["dairy"],
        is_featured: false
      },
      {
        id: "s-3",
        name: { en: "Beef Carpaccio with Black Truffle", hr: "Goveđi carpaccio s crnim tartufom" },
        description: { en: "Thinly sliced aged beef tenderloin, shaved Istrian black truffle, Grana Padano flakes, arugula, and lemon-infused olive oil.", hr: "Tanko rezani odležani goveđi biftek, listići istarskog crnog tartufa, listići Grana Padana, rikola i maslinovo ulje prožeto limunom." },
        price: 24.00,
        currency: "EUR",
        image_url: "/images/panna-cotta.jpg",
        dietary_info: ["gluten-free", "low-carb"],
        allergens: ["dairy"],
        is_featured: true
      },
      {
        id: "s-4",
        name: { en: "Pan-Seared Adriatic Scallops", hr: "Jakobove kapice pečene na tavi" },
        description: { en: "Jumbo scallops seared to perfection, served on a bed of creamy cauliflower purée with crispy pancetta crumbs and chive oil.", hr: "Velike jakobove kapice savršeno pečene, poslužene na kremi od cvjetače s hrskavim mrvicama pancete i uljem od vlasca." },
        price: 26.00,
        currency: "EUR",
        image_url: "/images/beef-pasticada.jpg",
        dietary_info: ["pescatarian", "gluten-free"],
        allergens: ["molluscs", "dairy"],
        is_featured: false
      },
      {
        id: "s-5",
        name: { en: "Traditional Dalmatian Prosciutto Platter", hr: "Plata tradicionalnog dalmatinskog pršuta" },
        description: { en: "36-month aged Dalmatian dry-cured ham, served with local sheep cheese, olives, fig jam, and warm focaccia bread.", hr: "Dalmatinski pršut sušen 36 mjeseci, poslužen s lokalnim ovčjim sirom, maslinama, džemom od smokava i toplom focacciom." },
        price: 20.00,
        currency: "EUR",
        image_url: "/images/burrata-salad.jpg",
        dietary_info: [],
        allergens: ["dairy", "gluten"],
        is_featured: false
      },
      {
        id: "s-6",
        name: { en: "Roasted Bone Marrow", hr: "Pečena moždina" },
        description: { en: "Wood-fired bone marrow topped with a parsley and caper salad, served alongside toasted brioche and coarse sea salt.", hr: "Moždina pečena u krušnoj peći prelivena salatom od peršina i kapara, poslužena uz tostirani brioche i krupnu morsku sol." },
        price: 19.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: [],
        allergens: ["gluten", "dairy"],
        is_featured: false
      },
      {
        id: "s-7",
        name: { en: "Smoked Salmon & Caviar Blinis", hr: "Blini s dimljenim lososom i kavijarom" },
        description: { en: "House-smoked salmon slices, premium Oscietra caviar, dill crème fraîche on warm, fluffy buckwheat blinis.", hr: "Domaći dimljeni losos, vrhunski Oscietra kavijar, crème fraîche s koprom na toplim, mekim heljdinim blinima." },
        price: 28.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["pescatarian"],
        allergens: ["fish", "dairy", "gluten", "egg"],
        is_featured: true
      },
      {
        id: "s-8",
        name: { en: "Crispy Calamari with Lemon Aioli", hr: "Hrskave lignje s aiolijem od limuna" },
        description: { en: "Lightly dusted and fried fresh calamari rings, served with a zesty homemade lemon and roasted garlic aioli.", hr: "Lagano pobrašnjeni i prženi kolutići svježih lignji, posluženi s pikantnim domaćim aiolijem od limuna i pečenog češnjaka." },
        price: 17.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["pescatarian"],
        allergens: ["molluscs", "gluten", "egg"],
        is_featured: false
      },
      {
        id: "s-9",
        name: { en: "Foie Gras Terrine", hr: "Terina od guščje jetre (Foie Gras)" },
        description: { en: "Smooth foie gras terrine layered with port wine jelly, accompanied by caramelized onion chutney and brioche toast.", hr: "Glatka terina od guščje jetre obložena želeom od porto vina, uz chutney od karameliziranog luka i tostirani brioche." },
        price: 29.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: [],
        allergens: ["dairy", "gluten", "sulfites"],
        is_featured: false
      },
      {
        id: "s-10",
        name: { en: "Vegetable Gazpacho with Olive Caviar", hr: "Gazpacho od povrća s kavijarom od maslina" },
        description: { en: "Chilled Andalusian-style tomato and cucumber soup, garnished with molecular olive oil caviar and micro-basil.", hr: "Hladna andaluzijska juha od rajčice i krastavca, ukrašena molekularnim kavijarom od maslinovog ulja i mikro-bosiljkom." },
        price: 14.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free", "dairy-free"],
        allergens: [],
        is_featured: false
      }
    ]
  },
  {
    id: "mains",
    name: { en: "Main Courses", hr: "Glavna Jela" },
    description: { en: "Hearty, sophisticated European classics prepared with modern culinary techniques.", hr: "Izdašni, sofisticirani europski klasici pripremljeni modernim kulinarskim tehnikama." },
    items: [
      {
        id: "m-1",
        name: { en: "Istrian Black Truffle Fuži Pasta", hr: "Istarski fuži s crnim tartufom" },
        description: { en: "Hand-rolled traditional fuži pasta enveloped in a rich, creamy black truffle and aged Grana Padano sauce. Finished with fresh shaved truffles.", hr: "Ručno valjana tradicionalna tjestenina fuži obavijena bogatim, kremastim umakom od crnih tartufa i odležanog Grana Padana. Završeno svježe naribanim tartufima." },
        price: 29.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegetarian"],
        allergens: ["dairy", "gluten", "egg"],
        is_featured: true
      },
      {
        id: "m-2",
        name: { en: "Dalmatian Slow-Cooked Beef (Pašticada)", hr: "Dalmatinska Pašticada" },
        description: { en: "A regional masterpiece: braised beef slow-cooked for 12 hours in a sweet prosek wine and root vegetable sauce, served with handmade potato gnocchi.", hr: "Regionalno remek-djelo: pirjana govedina sporo kuhana 12 sati u umaku od slatkog prošeka i korjenastog povrća, poslužena s ručno rađenim krumpirovim njokima." },
        price: 32.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: [],
        allergens: ["gluten", "celery", "sulfites"],
        is_featured: true
      },
      {
        id: "m-3",
        name: { en: "Wild Caught Adriatic Sea Bass", hr: "Divlji jadranski brancin" },
        description: { en: "Pan-seared sea bass fillet with crispy skin, served atop fennel puree, charred asparagus, and a delicate lemon-butter blanc sauce.", hr: "File brancina pržen na tavi s hrskavom kožicom, poslužen na pireu od komorača, grilanim šparogama i delikatnom umaku od limuna i maslaca." },
        price: 36.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["pescatarian", "gluten-free"],
        allergens: ["fish", "dairy"],
        is_featured: false
      },
      {
        id: "m-4",
        name: { en: "Dry-Aged Ribeye Steak (400g)", hr: "Dry-Aged Ribeye Steak (400g)" },
        description: { en: "45-day dry-aged premium local beef ribeye, grilled over charcoal. Served with roasted garlic, confit tomatoes, and a robust red wine jus.", hr: "Odležani lokalni goveđi ribeye steak (45 dana), pečen na drvenom ugljenu. Poslužuje se s pečenim češnjakom, confit rajčicama i snažnim umakom od crnog vina." },
        price: 48.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["gluten-free", "high-protein"],
        allergens: ["dairy", "sulfites"],
        is_featured: true
      },
      {
        id: "m-5",
        name: { en: "Duck Breast with Cherry Reduction", hr: "Pačja prsa s redukcijom od višanja" },
        description: { en: "Sous-vide duck breast with crispy skin, paired with a sweet and sour sour-cherry reduction, celery root mousseline, and glazed baby carrots.", hr: "Sous-vide pačja prsa s hrskavom kožicom, uparena sa slatko-kiselom redukcijom od višanja, mousselineom od celera i glaziranim mladim mrkvama." },
        price: 34.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["gluten-free"],
        allergens: ["celery", "dairy", "sulfites"],
        is_featured: false
      },
      {
        id: "m-6",
        name: { en: "Saffron Seafood Risotto", hr: "Rižoto od plodova mora sa šafranom" },
        description: { en: "Carnaroli rice cooked perfectly al dente with a rich seafood broth, infused with premium saffron, and loaded with mussels, shrimp, and clams.", hr: "Carnaroli riža savršeno kuhana al dente s bogatim temeljcem od plodova mora, prožeta vrhunskim šafranom i puna dagnji, kozica i školjki." },
        price: 30.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["pescatarian", "gluten-free"],
        allergens: ["crustaceans", "molluscs", "dairy"],
        is_featured: false
      },
      {
        id: "m-7",
        name: { en: "Herb-Crusted Rack of Lamb", hr: "Janjeći kotleti u kori od začinskog bilja" },
        description: { en: "Oven-roasted rack of lamb with a pistachio and mint herb crust. Served with potato dauphinoise and rosemary infused lamb jus.", hr: "U pećnici pečeni janjeći kotleti s korom od pistacija i mente. Posluženo s krumpirom dauphinoise i janjećim jusom prožetim ružmarinom." },
        price: 38.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: [],
        allergens: ["dairy", "gluten", "tree nuts"],
        is_featured: false
      },
      {
        id: "m-8",
        name: { en: "Mushroom Wellington", hr: "Wellington od gljiva" },
        description: { en: "A vegetarian masterpiece. Earthy portobello mushrooms, spinach, and truffle duxelles baked in a flaky golden puff pastry. Served with vegan red wine jus.", hr: "Vegetarijansko remek-djelo. Zemljane portobello gljive, špinat i duxelles od tartufa pečeni u hrskavom zlatnom lisnatom tijestu. Posluženo s veganskim umakom od crnog vina." },
        price: 26.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegetarian", "vegan-option"],
        allergens: ["gluten", "soy", "sulfites"],
        is_featured: false
      },
      {
        id: "m-9",
        name: { en: "Grilled Whole Branzino", hr: "Cijeli brancin na žaru" },
        description: { en: "Fresh whole European bass, grilled over open flames with lemon, thyme, and garlic. Served tableside with traditional chard and potatoes.", hr: "Svježi cijeli europski brancin, pečen na otvorenoj vatri s limunom, timijanom i češnjakom. Poslužen uz stol s tradicionalnom blitvom i krumpirom." },
        price: 42.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["pescatarian", "gluten-free", "dairy-free"],
        allergens: ["fish"],
        is_featured: false
      },
      {
        id: "m-10",
        name: { en: "Lobster Ravioli in Bisque", hr: "Ravioli s jastogom u bisqueu" },
        description: { en: "Hand-pinched pasta filled with sweet lobster meat and mascarpone, swimming in a rich, brandy-flamed lobster bisque.", hr: "Ručno rađena tjestenina punjena slatkim mesom jastoga i mascarponeom, u bogatom bisqueu od jastoga flambiranom konjakom." },
        price: 35.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["pescatarian"],
        allergens: ["crustaceans", "dairy", "gluten", "egg", "sulfites"],
        is_featured: false
      }
    ]
  },
  {
    id: "desserts",
    name: { en: "Desserts", hr: "Deserti" },
    description: { en: "Decadent and beautifully plated sweet conclusions.", hr: "Dekadentni i prekrasno aranžirani slatki završeci." },
    items: [
      {
        id: "d-1",
        name: { en: "Lavender Panna Cotta", hr: "Panna Cotta s lavandom" },
        description: { en: "Silky, delicate panna cotta infused with hand-picked Hvar lavender, served with a vibrant wild berry compote and edible flowers.", hr: "Svilenkasta, delikatna panna cotta obogaćena ručno branom hvarskom lavandom, poslužena sa živopisnim kompotom od šumskog voća i jestivim cvijećem." },
        price: 12.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegetarian", "gluten-free"],
        allergens: ["dairy"],
        is_featured: true
      },
      {
        id: "d-2",
        name: { en: "Dark Chocolate & Olive Oil Tart", hr: "Tart od tamne čokolade i maslinovog ulja" },
        description: { en: "A dense, rich 70% dark chocolate ganache resting in a cacao crust. Finished with flaky sea salt and a drizzle of premium extra virgin olive oil.", hr: "Gusti, bogati ganache od 70% tamne čokolade u kori od kakaa. Završen lisnatom morskom soli i kapima vrhunskog ekstra djevičanskog maslinovog ulja." },
        price: 14.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegetarian"],
        allergens: ["dairy", "gluten", "egg"],
        is_featured: true
      },
      {
        id: "d-3",
        name: { en: "Classic Tiramisu", hr: "Klasični Tiramisu" },
        description: { en: "Layers of espresso-soaked ladyfingers, velvety mascarpone cream, and a generous dusting of rich cocoa powder. Prepared daily.", hr: "Slojevi piškota natopljenih espressom, baršunasta krema od mascarponea i obilno posipana bogatim kakaom u prahu. Priprema se svakodnevno." },
        price: 11.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegetarian"],
        allergens: ["dairy", "gluten", "egg", "caffeine"],
        is_featured: false
      },
      {
        id: "d-4",
        name: { en: "Lemon Meringue Deconstructed", hr: "Dekonstruirani Lemon Meringue" },
        description: { en: "Zesty Sicilian lemon curd, torched Swiss meringue drops, buttery shortbread crumbles, and fresh mint.", hr: "Krema od sicilijanskog limuna, spaljene kapljice švicarskog meringuea, mrvice prhkog tijesta od maslaca i svježa menta." },
        price: 13.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegetarian"],
        allergens: ["dairy", "gluten", "egg"],
        is_featured: false
      },
      {
        id: "d-5",
        name: { en: "Pistachio Soufflé", hr: "Soufflé od pistacija" },
        description: { en: "Warm, airy pistachio soufflé baked to order, served with a side of Madagascar vanilla bean crème anglaise.", hr: "Topli, prozračni soufflé od pistacija pečen po narudžbi, poslužen s crème anglaise od mahune madagaskarske vanilije." },
        price: 16.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegetarian"],
        allergens: ["dairy", "egg", "tree nuts", "gluten"],
        is_featured: true
      },
      {
        id: "d-6",
        name: { en: "Roasted Figs with Ricotta", hr: "Pečene smokve s ricottom" },
        description: { en: "Fresh figs roasted in honey and thyme, served over whipped sweet ricotta cheese and toasted walnuts.", hr: "Svježe smokve pečene u medu i timijanu, poslužene preko tučene slatke ricotte i tostiranih oraha." },
        price: 12.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegetarian", "gluten-free"],
        allergens: ["dairy", "tree nuts"],
        is_featured: false
      },
      {
        id: "d-7",
        name: { en: "Apple Strudel Mille-Feuille", hr: "Mille-Feuille od štrudle s jabukama" },
        description: { en: "A modern take on the traditional strudel: caramelized cinnamon apples layered between ultra-crispy puff pastry and vanilla cream.", hr: "Moderan pogled na tradicionalnu štrudlu: karamelizirane jabuke s cimetom složene između ultra-hrskavog lisnatog tijesta i kreme od vanilije." },
        price: 13.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegetarian"],
        allergens: ["dairy", "gluten", "egg"],
        is_featured: false
      },
      {
        id: "d-8",
        name: { en: "Vegan Chocolate Mousse", hr: "Veganski čokoladni mousse" },
        description: { en: "Incredibly smooth avocado and dark chocolate mousse, sweetened with agave nectar, topped with coconut flakes and fresh raspberries.", hr: "Nevjerojatno glatki mousse od avokada i tamne čokolade, zaslađen nektarom agave, posut pahuljicama kokosa i svježim malinama." },
        price: 11.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free", "dairy-free"],
        allergens: [],
        is_featured: false
      },
      {
        id: "d-9",
        name: { en: "Crème Brûlée", hr: "Crème Brûlée" },
        description: { en: "Classic French vanilla custard with a perfectly torched, shatteringly crisp caramelized sugar top.", hr: "Klasična francuska krema od vanilije sa savršeno spaljenim, hrskavim vrhom od karameliziranog šećera." },
        price: 10.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegetarian", "gluten-free"],
        allergens: ["dairy", "egg"],
        is_featured: false
      },
      {
        id: "d-10",
        name: { en: "Artisan Cheese Board", hr: "Plata zanatskih sireva" },
        description: { en: "A curated selection of 4 local and European cheeses, served with honeycomb, candied pecans, fruit mostarda, and sourdough crisps.", hr: "Pažljivo odabrana selekcija 4 lokalna i europska sira, poslužena sa saćem, kandiranim orahom, voćnom mostardom i hrskavim kruhom." },
        price: 22.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegetarian"],
        allergens: ["dairy", "gluten", "tree nuts"],
        is_featured: false
      }
    ]
  },
  {
    id: "wine-list",
    name: { en: "Wine List (By the Glass)", hr: "Vinska Karta (Na Čašu)" },
    description: { en: "A meticulously curated selection of exceptional local Croatian wines and renowned international labels.", hr: "Pažljivo odabrana selekcija iznimnih lokalnih hrvatskih vina i poznatih međunarodnih etiketa." },
    items: [
      {
        id: "w-1",
        name: { en: "Coronica Malvazija Istarska 2022", hr: "Coronica Malvazija Istarska 2022" },
        description: { en: "Crisp, aromatic white wine from Istria with notes of acacia flower, green apple, and a mineral finish.", hr: "Svježe, aromatično bijelo vino iz Istre s notama cvijeta akacije, zelene jabuke i mineralnim završetkom." },
        price: 8.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free"],
        allergens: ["sulfites"],
        is_featured: true
      },
      {
        id: "w-2",
        name: { en: "Krajančić Pošip Intrada 2022", hr: "Krajančić Pošip Intrada 2022" },
        description: { en: "Elegant white from Korčula island. Full-bodied with aromas of Mediterranean herbs, citrus, and stone fruits.", hr: "Elegantno bijelo vino s otoka Korčule. Punog tijela s aromama mediteranskog bilja, citrusa i koštuničavog voća." },
        price: 10.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free"],
        allergens: ["sulfites"],
        is_featured: false
      },
      {
        id: "w-3",
        name: { en: "Bura Dingač 2019", hr: "Bura Dingač 2019" },
        description: { en: "A powerhouse red from the Pelješac peninsula. Plavac Mali grape offering dark cherry, carob, and distinct terroir.", hr: "Moćno crno vino s poluotoka Pelješca. Sorta Plavac Mali nudi tamnu trešnju, rogač i poseban terroir." },
        price: 14.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free"],
        allergens: ["sulfites"],
        is_featured: true
      },
      {
        id: "w-4",
        name: { en: "Meneghetti Red 2018", hr: "Meneghetti Red 2018" },
        description: { en: "Premium Istrian Bordeaux blend (Merlot, Cabernet Sauvignon, Cabernet Franc). Velvety, with dark berries and oak.", hr: "Vrhunska istarska Bordeaux kupaža (Merlot, Cabernet Sauvignon, Cabernet Franc). Baršunasto, s tamnim bobičastim voćem i hrastom." },
        price: 16.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free"],
        allergens: ["sulfites"],
        is_featured: false
      },
      {
        id: "w-5",
        name: { en: "Tomac Diplomat Extra Brut", hr: "Tomac Diplomat Extra Brut" },
        description: { en: "World-class Croatian sparkling wine from the Plešivica region, made using the traditional method. Fine bubbles and brioche notes.", hr: "Vrhunsko hrvatsko pjenušavo vino s Plešivice, proizvedeno tradicionalnom metodom. Fini mjehurići i note briochea." },
        price: 12.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free"],
        allergens: ["sulfites"],
        is_featured: true
      },
      {
        id: "w-6",
        name: { en: "St. Hills Frenchie Sauvignon Blanc", hr: "St. Hills Frenchie Sauvignon Blanc" },
        description: { en: "Vibrant and refreshing Sauvignon Blanc from Istria with tropical fruit and gooseberry characteristics.", hr: "Živahan i osvježavajući Sauvignon Blanc iz Istre s karakteristikama tropskog voća i ogrozda." },
        price: 9.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free"],
        allergens: ["sulfites"],
        is_featured: false
      },
      {
        id: "w-7",
        name: { en: "Testament Babić 2020", hr: "Testament Babić 2020" },
        description: { en: "Organic red wine from Dalmatia. Medium-bodied, showcasing red fruits, Mediterranean scrub, and gentle tannins.", hr: "Organsko crno vino iz Dalmacije. Srednjeg tijela, s crvenim voćem, mediteranskim makijom i blagim taninima." },
        price: 9.50,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free", "organic"],
        allergens: ["sulfites"],
        is_featured: false
      },
      {
        id: "w-8",
        name: { en: "Benvenuti Teran Anno Domini", hr: "Benvenuti Teran Anno Domini" },
        description: { en: "Rich and complex Teran from Motovun. Deep ruby color with aromas of raspberry, black pepper, and dark chocolate.", hr: "Bogat i kompleksan Teran iz Motovuna. Duboke rubin boje s aromama maline, crnog papra i tamne čokolade." },
        price: 13.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free"],
        allergens: ["sulfites"],
        is_featured: false
      },
      {
        id: "w-9",
        name: { en: "Kozlović Muškat Momjanski", hr: "Kozlović Muškat Momjanski" },
        description: { en: "Semi-sweet dessert wine from Istria. Highly aromatic with intense notes of white peach, elderflower, and honey.", hr: "Poluslatko desertno vino iz Istre. Visoko aromatično s intenzivnim notama bijele breskve, bazge i meda." },
        price: 8.50,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free"],
        allergens: ["sulfites"],
        is_featured: false
      },
      {
        id: "w-10",
        name: { en: "Moët & Chandon Impérial Brut", hr: "Moët & Chandon Impérial Brut" },
        description: { en: "The iconic French Champagne. Elegant, vibrant, and seductive with notes of green apple and white flowers.", hr: "Ikonski francuski šampanjac. Elegantan, živahan i zavodljiv s notama zelene jabuke i bijelog cvijeća." },
        price: 22.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free"],
        allergens: ["sulfites"],
        is_featured: false
      }
    ]
  },
  {
    id: "cocktails",
    name: { en: "Signature Cocktails", hr: "Autorski Kokteli" },
    description: { en: "Crafted by our mixologists using premium spirits and local botanicals.", hr: "Kreirali naši miksolozi koristeći vrhunska žestoka pića i lokalno bilje." },
    items: [
      {
        id: "c-1",
        name: { en: "Adriatic Spritz", hr: "Jadranski Spritz" },
        description: { en: "A refreshing blend of local Maraschino liqueur, prosecco, fresh grapefruit juice, and a sprig of rosemary.", hr: "Osvježavajuća mješavina lokalnog likera Maraschino, prosecca, svježeg soka od grejpa i grančice ružmarina." },
        price: 14.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free"],
        allergens: [],
        is_featured: true
      },
      {
        id: "c-2",
        name: { en: "Smoked Fig Old Fashioned", hr: "Smoked Fig Old Fashioned" },
        description: { en: "Bourbon infused with dried Dalmatian figs, aromatic bitters, served over a large ice sphere with applewood smoke.", hr: "Bourbon prožet suhim dalmatinskim smokvama, aromatični biteri, poslužen preko velike ledene kugle s dimom drveta jabuke." },
        price: 16.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free"],
        allergens: [],
        is_featured: true
      },
      {
        id: "c-3",
        name: { en: "Mediterranean Gin & Tonic", hr: "Mediteranski Gin Tonic" },
        description: { en: "Artisan Croatian gin, premium Mediterranean tonic, garnished with juniper berries, lemon wheel, and fresh thyme.", hr: "Zanatski hrvatski gin, vrhunski mediteranski tonik, ukrašen bobicama smreke, kolutićem limuna i svježim timijanom." },
        price: 13.00,
        currency: "EUR",
        image_url: "/images/placeholder.jpg",
        dietary_info: ["vegan", "gluten-free"],
        allergens: [],
        is_featured: false
      }
    ]
  }
];
