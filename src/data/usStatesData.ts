import { Place } from '../types';

export interface USStatePreset {
  name: string;
  code: string;
  capital: string;
  centroid: {
    latitude: number;
    longitude: number;
  };
  spots: Place[];
}

export const US_STATES_DATA: USStatePreset[] = [
  {
    name: "Alabama",
    code: "AL",
    capital: "Montgomery",
    centroid: { latitude: 32.806671, longitude: -86.79113 },
    spots: [
      {
        id: "al-1",
        name: "U.S. Space & Rocket Center",
        description: "The Earth's largest space museum, showcasing authentic Saturn V rockets, Apollo artifacts, and astronaut simulators.",
        whyMatch: "A bucket-list destination for cosmic science and space race machinery.",
        emoji: "🚀",
        address: "1 Tranquility Base, Huntsville, AL 35805",
        latitude: 34.7119,
        longitude: -86.654,
        geocodingStatus: "success",
        category: "museum"
      },
      {
        id: "al-2",
        name: "Civil Rights Memorial Center",
        description: "A poignant memorial designed by Maya Lin honoring activists who fought and died during the Civil Rights Movement.",
        whyMatch: "An essential venue for deep historical learning and community reflection.",
        emoji: "🏰",
        address: "400 Washington Ave, Montgomery, AL 36104",
        latitude: 32.3736,
        longitude: -86.3025,
        geocodingStatus: "success",
        category: "historic"
      }
    ]
  },
  {
    name: "Alaska",
    code: "AK",
    capital: "Juneau",
    centroid: { latitude: 61.370716, longitude: -152.404419 },
    spots: [
      {
        id: "ak-1",
        name: "Denali National Park & Preserve",
        description: "Over six million acres of untamed wild lands crested by Denali, North America's tallest mountain peak.",
        whyMatch: "Witness spectacular subarctic tundra, pristine glaciers, and towering moose or grizzlies.",
        emoji: "🌄",
        address: "Denali National Park, AK 99755",
        latitude: 63.1148,
        longitude: -151.1926,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "ak-2",
        name: "Kenai Fjords National Park",
        description: "An icy spectacular glacier world where mountains, ice, and oceans meet in beautiful marine fjords.",
        whyMatch: "Marvel at calving glaciers and abundant humpback whales or otters.",
        emoji: "🌳",
        address: "Seward Highway, Seward, AK 99664",
        latitude: 59.9167,
        longitude: -149.85,
        geocodingStatus: "success",
        category: "park"
      }
    ]
  },
  {
    name: "Arizona",
    code: "AZ",
    capital: "Phoenix",
    centroid: { latitude: 33.729759, longitude: -111.431221 },
    spots: [
      {
        id: "az-1",
        name: "Grand Canyon National Park",
        description: "A colossal, world-famous gorge carved beautifully by the Colorado River displaying layered bands of red rock.",
        whyMatch: "Unparalleled views of deep geologic time and jaw-dropping sunset panoramas.",
        emoji: "🌄",
        address: "Grand Canyon Village, AZ 86023",
        latitude: 36.0544,
        longitude: -112.1375,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "az-2",
        name: "Cathedral Rock Trailhead",
        description: "One of Sedona's most iconic sandstone landmarks, believed by many to emit strong local energy vortexes.",
        whyMatch: "An active glowing crimson red hike and spiritual sanctuary.",
        emoji: "⛩️",
        address: "Cathedral Rock Trail, Sedona, AZ 86336",
        latitude: 34.819,
        longitude: -111.7885,
        geocodingStatus: "success",
        category: "temple"
      }
    ]
  },
  {
    name: "Arkansas",
    code: "AR",
    capital: "Little Rock",
    centroid: { latitude: 34.969704, longitude: -92.373123 },
    spots: [
      {
        id: "ar-1",
        name: "Hot Springs National Park",
        description: "Nine historic Bathhouse buildings styled in beautiful art deco architecture built over ancient bubbling thermal springs.",
        whyMatch: "Indulge in old-school relaxation and historical architectural marvels.",
        emoji: "🏰",
        address: "369 Central Ave, Hot Springs, AR 71901",
        latitude: 34.5128,
        longitude: -93.0533,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "ar-2",
        name: "Crystal Bridges Museum of American Art",
        description: "A world-class modernist pavilion gallery designed by Moshe Safdie nestled deep in a gorgeous forested valley.",
        whyMatch: "An outstanding blend of iconic American art masterpieces and natural hiking trails.",
        emoji: "🖼️",
        address: "600 Museum Way, Bentonville, AR 72712",
        latitude: 36.3844,
        longitude: -94.2033,
        geocodingStatus: "success",
        category: "museum"
      }
    ]
  },
  {
    name: "California",
    code: "CA",
    capital: "Sacramento",
    centroid: { latitude: 36.116203, longitude: -119.681564 },
    spots: [
      {
        id: "ca-1",
        name: "Golden Gate Bridge Overlook",
        description: "The world-famous Art Deco suspension bridge framing San Francisco's dramatic foggy ocean gateway.",
        whyMatch: "An iconic view overlooking deep blue waters, rocky headlands, and passing sailboats.",
        emoji: "🌄",
        address: "Golden Gate Bridge, San Francisco, CA 94129",
        latitude: 37.8199,
        longitude: -122.4783,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "ca-2",
        name: "Yosemite Valley Centroid",
        description: "Glacial valley packed with giant sequoia groves, dramatic granite monoliths like El Capitan, and tall roaring waterfalls.",
        whyMatch: "A mecca of pure wilderness majesty and classic outdoor adventure.",
        emoji: "🌳",
        address: "Yosemite Valley, CA 95389",
        latitude: 37.7456,
        longitude: -119.5332,
        geocodingStatus: "success",
        category: "park"
      },
      {
        id: "ca-3",
        name: "Venice Beach Boardwalk",
        description: "A eclectic beachfront scene filled with muscle gyms, vibrant mural artwork, and energetic street musicians.",
        whyMatch: "A bustling, sun-saturated cultural snapshot of coastal Los Angeles lifestyle.",
        emoji: "☕",
        address: "1800 Ocean Front Walk, Venice, CA 90291",
        latitude: 33.985,
        longitude: -118.4695,
        geocodingStatus: "success",
        category: "cafe"
      }
    ]
  },
  {
    name: "Colorado",
    code: "CO",
    capital: "Denver",
    centroid: { latitude: 39.059811, longitude: -105.311104 },
    spots: [
      {
        id: "co-1",
        name: "Rocky Mountain National Park",
        description: "Soaring alpine peaks, subalpine forests, and high-altitude highway trails that cut right across the continental divide.",
        whyMatch: "Perfect alpine hiking basecamp for watching herds of majestic wild elk.",
        emoji: "🌳",
        address: "Trail Ridge Road, Estes Park, CO 85157",
        latitude: 40.3428,
        longitude: -105.6836,
        geocodingStatus: "success",
        category: "park"
      },
      {
        id: "co-2",
        name: "Red Rocks Amphitheatre",
        description: "A world-renowned acoustical outdoor music venue nestled perfectly between giant red monolithic rock formations.",
        whyMatch: "A visually striking spot combining live performances with incredible hiking.",
        emoji: "🌄",
        address: "18300 W Alameda Pkwy, Morrison, CO 80465",
        latitude: 39.6654,
        longitude: -105.2058,
        geocodingStatus: "success",
        category: "scenic-overlook"
      }
    ]
  },
  {
    name: "Connecticut",
    code: "CT",
    capital: "Hartford",
    centroid: { latitude: 41.597782, longitude: -72.755371 },
    spots: [
      {
        id: "ct-1",
        name: "Mystic Seaport Museum",
        description: "America's premier maritime museum, featuring a recreated 19th-century coastal village and historic square-rigged ships.",
        whyMatch: "Step onto authentic tall ships and explore colonial ocean crafts.",
        emoji: "🏰",
        address: "75 Greenmanville Ave, Mystic, CT 06355",
        latitude: 41.3622,
        longitude: -71.9622,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "ct-2",
        name: "Yale University Art Gallery",
        description: "The oldest university art museum in the western hemisphere, filled with ancient sculptures and classic modern collections.",
        whyMatch: "An elite architectural structure showcasing legendary master art canvases.",
        emoji: "🖼️",
        address: "1111 Chapel St, New Haven, CT 06510",
        latitude: 41.3082,
        longitude: -72.9304,
        geocodingStatus: "success",
        category: "museum"
      }
    ]
  },
  {
    name: "Delaware",
    code: "DE",
    capital: "Dover",
    centroid: { latitude: 39.318523, longitude: -75.507116 },
    spots: [
      {
        id: "de-1",
        name: "Nemours Estate",
        description: "A breathtaking French neoclassical chateau estate patterned beautifully after Versailles with expansive formal gardens.",
        whyMatch: "Indulge in Gilded Age mansions, golden fountains, and historic chauffeur cars.",
        emoji: "🏰",
        address: "1600 Rockland Rd, Wilmington, DE 19803",
        latitude: 39.7788,
        longitude: -75.552,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "de-2",
        name: "Rehoboth Beach Boardwalk",
        description: "A classic east-coast wooden boardwalk flanking ocean waves with arcade stands, snack shops, and fine soft sand.",
        whyMatch: "A vibrant, friendly coastal boardwalk ideal for beach strolls.",
        emoji: "🍿",
        address: "Rehoboth Ave & Boardwalk, Rehoboth Beach, DE 19971",
        latitude: 38.7188,
        longitude: -75.0768,
        geocodingStatus: "success",
        category: "scenic-overlook"
      }
    ]
  },
  {
    name: "Florida",
    code: "FL",
    capital: "Tallahassee",
    centroid: { latitude: 27.766279, longitude: -81.686782 },
    spots: [
      {
        id: "fl-1",
        name: "Everglades National Park",
        description: "The largest subtropical wilderness in the United States, providing critical wetlands habitat for unique wildlife.",
        whyMatch: "Glide down grassy waters on an airboat alongside Florida alligators and rare herons.",
        emoji: "🌳",
        address: "Ernest F. Coe Center, Homestead, FL 33034",
        latitude: 25.3125,
        longitude: -80.6875,
        geocodingStatus: "success",
        category: "park"
      },
      {
        id: "fl-2",
        name: "Southernmost Point Buoy",
        description: "An colorful concrete landmark celebrating the southernmost dry land point in the continental US.",
        whyMatch: "A quintessential Key West coastal photo-point framing rolling Caribbean waves.",
        emoji: "🌄",
        address: "Whitehead St & South St, Key West, FL 33040",
        latitude: 24.5465,
        longitude: -81.7975,
        geocodingStatus: "success",
        category: "scenic-overlook"
      }
    ]
  },
  {
    name: "Georgia",
    code: "GA",
    capital: "Atlanta",
    centroid: { latitude: 32.165622, longitude: -82.900075 },
    spots: [
      {
        id: "ga-1",
        name: "Georgia Aquarium",
        description: "A colossal aquatic conservatory home to thousands of marine species including massive whale sharks and manta rays.",
        whyMatch: "Marvel at deep oceanic glass viewing tunnels of otherworldly scale.",
        emoji: "🦈",
        address: "225 Baker St NW, Atlanta, GA 30313",
        latitude: 33.7625,
        longitude: -84.3946,
        geocodingStatus: "success",
        category: "museum"
      },
      {
        id: "ga-2",
        name: "Historic Savannah District",
        description: "Twenty historic public squares draped in romantic Spanish Moss, bordered by Antebellum manses.",
        whyMatch: "A nostalgic stroll down gas-lit cobblestones and southern coastal food spots.",
        emoji: "🏰",
        address: "301 Martin Luther King Jr Blvd, Savannah, GA 31401",
        latitude: 32.0762,
        longitude: -81.0965,
        geocodingStatus: "success",
        category: "historic"
      }
    ]
  },
  {
    name: "Hawaii",
    code: "HI",
    capital: "Honolulu",
    centroid: { latitude: 19.898682, longitude: -155.665857 },
    spots: [
      {
        id: "hi-1",
        name: "Hawaii Volcanoes National Park",
        description: "An active volcano sanctuary containing dramatic cinder cones, massive steaming sulfur vents, and solid volcanic tubes.",
        whyMatch: "Witness real molten earth pathways active in real time.",
        emoji: "🌋",
        address: "Crater Rim Drive, Volcano, HI 96718",
        latitude: 19.4194,
        longitude: -155.2878,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "hi-2",
        name: "Waikiki Beach Core",
        description: "A sunny high-rise resort district featuring golden white sand beaches, surf schools, and swaying palm outlines.",
        whyMatch: "An iconic Pacific surf culture focal point framing Diamond Head volcanic crater.",
        emoji: "🏄",
        address: "2259 Kalakaua Ave, Honolulu, HI 96815",
        latitude: 21.2764,
        longitude: -157.8281,
        geocodingStatus: "success",
        category: "scenic-overlook"
      }
    ]
  },
  {
    name: "Idaho",
    code: "ID",
    capital: "Boise",
    centroid: { latitude: 44.240459, longitude: -114.478828 },
    spots: [
      {
        id: "id-1",
        name: "Shoshone Falls Park",
        description: "Sometimes called the 'Niagara of the West', these dramatic falls cascade over basalt cliffs higher than Niagara.",
        whyMatch: "Marvel at thunderous rushing river canyons in deep lava rock country.",
        emoji: "🏞️",
        address: "4155 Shoshone Falls Grade, Twin Falls, ID 83301",
        latitude: 42.594,
        longitude: -114.401,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "id-2",
        name: "Craters of the Moon National Monument",
        description: "An alien volcanic flood land consisting of cinder cone mounds, lava cavities, and black basalt flows.",
        whyMatch: "Walk across incredibly preserved volcanic flood plains that astronauts once used to train.",
        emoji: "🌋",
        address: "Highway 26, Arco, ID 83213",
        latitude: 43.4617,
        longitude: -113.5627,
        geocodingStatus: "success",
        category: "park"
      }
    ]
  },
  {
    name: "Illinois",
    code: "IL",
    capital: "Springfield",
    centroid: { latitude: 40.349457, longitude: -88.986137 },
    spots: [
      {
        id: "il-1",
        name: "Millennium Park 'The Bean'",
        description: "Chicago's lakeside high-art park starring Anish Kapoor's highly polished, mirror-like steel Cloud Gate sculpture.",
        whyMatch: "Capture warp-reflections of Chicago's elite high-rise skyline.",
        emoji: "🏙️",
        address: "201 E Randolph St, Chicago, IL 60602",
        latitude: 41.8827,
        longitude: -87.6227,
        geocodingStatus: "success",
        category: "park"
      },
      {
        id: "il-2",
        name: "Lincoln Home Historic Site",
        description: "The beautifully preserved 19th-century Greek Revival house where Abraham Lincoln resided from 1844 until 1861.",
        whyMatch: "Step into historical presidential neighborhoods fully frozen in period styles.",
        emoji: "🏰",
        address: "426 S Seventh St, Springfield, IL 62701",
        latitude: 39.7972,
        longitude: -89.6456,
        geocodingStatus: "success",
        category: "historic"
      }
    ]
  },
  {
    name: "Indiana",
    code: "IN",
    capital: "Indianapolis",
    centroid: { latitude: 39.849426, longitude: -86.258278 },
    spots: [
      {
        id: "in-1",
        name: "Indianapolis Motor Speedway",
        description: "The historic racing capital of the world, home to the legendary Indy 500.",
        whyMatch: "An elite brick-lined track honoring automotive velocity history.",
        emoji: "🏎️",
        address: "4790 W 16th St, Indianapolis, IN 46222",
        latitude: 39.7949,
        longitude: -86.2345,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "in-2",
        name: "Indiana Dunes State Park",
        description: "Beautiful tall sandy ridges framing Lake Michigan's deep blue horizons.",
        whyMatch: "A striking mix of sandy beach dunes, dynamic marshes, and bird flyways.",
        emoji: "🌳",
        address: "1600 N 25 E, Chesterton, IN 46304",
        latitude: 41.654,
        longitude: -87.054,
        geocodingStatus: "success",
        category: "park"
      }
    ]
  },
  {
    name: "Iowa",
    code: "IA",
    capital: "Des Moines",
    centroid: { latitude: 42.011539, longitude: -93.210526 },
    spots: [
      {
        id: "ia-1",
        name: "Field of Dreams Movie Site",
        description: "The cinematic baseball diamond carved directly out of a lush cornfield, immortalized in film.",
        whyMatch: "A warm slice of midwestern nostalgia for sports and classic cinema.",
        emoji: "🏟️",
        address: "28995 Lansing Rd, Dyersville, IA 52040",
        latitude: 42.4977,
        longitude: -91.1558,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "ia-2",
        name: "Maquoketa Caves State Park",
        description: "A trail system loaded with limestone caves, stone bridges, and scenic wooden catwalks.",
        whyMatch: "Iowa's most rugged underground exploration pathway.",
        emoji: "🌳",
        address: "10970 Caves Rd, Maquoketa, IA 52060",
        latitude: 42.1189,
        longitude: -90.7761,
        geocodingStatus: "success",
        category: "park"
      }
    ]
  },
  {
    name: "Kansas",
    code: "KS",
    capital: "Topeka",
    centroid: { latitude: 38.5266, longitude: -96.726486 },
    spots: [
      {
        id: "ks-1",
        name: "Monument Rocks",
        description: "Towering ancient chalk rock monoliths rising dramatically out of the surrounding flat Kansas pastures.",
        whyMatch: "A gorgeous geologic formation detailing fossilized ocean sediment history.",
        emoji: "🌄",
        address: "Monument Rocks Road, Gove 15, KS 67736",
        latitude: 38.7917,
        longitude: -100.7633,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "ks-2",
        name: "Boot Hill Museum",
        description: "An interactive Old West museum built directly on the original site of the Dodge City cemetery.",
        whyMatch: "Relive active cowboy shootouts and legendary frontier folklore.",
        emoji: "🏰",
        address: "500 W Wyatt Earp Blvd, Dodge City, KS 67801",
        latitude: 37.7538,
        longitude: -100.0212,
        geocodingStatus: "success",
        category: "historic"
      }
    ]
  },
  {
    name: "Kentucky",
    code: "KY",
    capital: "Frankfort",
    centroid: { latitude: 37.66814, longitude: -84.670067 },
    spots: [
      {
        id: "ky-1",
        name: "Mammoth Cave National Park",
        description: "The world's longest known labyrinthine cave system, boasting hundreds of miles of mapped stone passages.",
        whyMatch: "Embark on an awe-inspiring underworld cavern trek of historic scales.",
        emoji: "🌳",
        address: "1 Mammoth Cave Pkwy, Mammoth Cave, KY 42259",
        latitude: 37.187,
        longitude: -86.1005,
        geocodingStatus: "success",
        category: "park"
      },
      {
        id: "ky-2",
        name: "Churchill Downs",
        description: "The legendary twin-spired racecourse home to the historic Kentucky Derby horse race since 1875.",
        whyMatch: "Soak in elite equestrian heritage and grandstand energy.",
        emoji: "🐎",
        address: "700 Central Ave, Louisville, KY 40208",
        latitude: 38.2031,
        longitude: -85.7701,
        geocodingStatus: "success",
        category: "historic"
      }
    ]
  },
  {
    name: "Louisiana",
    code: "LA",
    capital: "Baton Rouge",
    centroid: { latitude: 31.169546, longitude: -91.867805 },
    spots: [
      {
        id: "la-1",
        name: "French Quarter Jackson Square",
        description: "The historic beating heart of New Orleans, lined with gas lamps, busking brass bands, and ironwork balconies.",
        whyMatch: "A vibrant center of rich Creole cuisine, live street jazz, and historic structures.",
        emoji: "🎺",
        address: "701 Decatur St, New Orleans, LA 70116",
        latitude: 29.9575,
        longitude: -90.063,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "la-2",
        name: "Cafe Du Monde French Market",
        description: "The legendary open-air coffee pavilion famous for its golden beignets buried in mountains of powdered sugar.",
        whyMatch: "The ultimate historic stop for classic chicory café au lait.",
        emoji: "☕",
        address: "800 Decatur St, New Orleans, LA 70116",
        latitude: 29.9573,
        longitude: -90.062,
        geocodingStatus: "success",
        category: "cafe"
      }
    ]
  },
  {
    name: "Maine",
    code: "ME",
    capital: "Augusta",
    centroid: { latitude: 44.693947, longitude: -69.381927 },
    spots: [
      {
        id: "me-1",
        name: "Acadia Cadillac Mountain",
        description: "The highest point on the US Atlantic Coast, offering expansive island-studded ocean views.",
        whyMatch: "The first place in the United States to watch red sunbeams emerge in the mornings.",
        emoji: "🌄",
        address: "Cadillac Mountain Summit Rd, Bar Harbor, ME 04609",
        latitude: 44.3526,
        longitude: -68.2251,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "me-2",
        name: "Portland Head Light",
        description: "Maine's most historic and photogenic stone lighthouse, keeping watch over Cape Elizabeth's rocky shoreline.",
        whyMatch: "Fascinating rocky-coast scenic vibes with crashing ocean foam.",
        emoji: "🏰",
        address: "1000 Shore Rd, Cape Elizabeth, ME 04107",
        latitude: 43.6231,
        longitude: -70.2012,
        geocodingStatus: "success",
        category: "historic"
      }
    ]
  },
  {
    name: "Maryland",
    code: "MD",
    capital: "Annapolis",
    centroid: { latitude: 39.063946, longitude: -76.802101 },
    spots: [
      {
        id: "md-1",
        name: "Fort McHenry National Monument",
        description: "The historic star-shaped fort that successfully defended Baltimore from the British in 1814, inspiring our national anthem.",
        whyMatch: "Walk the ramparts that birthed 'The Star-Spangled Banner'.",
        emoji: "🏰",
        address: "2400 E Fort Ave, Baltimore, MD 21230",
        latitude: 39.2638,
        longitude: -76.5796,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "md-2",
        name: "National Aquarium Baltimore",
        description: "A gorgeous glass pyramid harbor harbor structure home to multistory coral reefs, dolphin sanctuaries, and rain forests.",
        whyMatch: "An incredible deep dive into ocean life directly on the Inner Harbor boardwalk.",
        emoji: "🐠",
        address: "501 E Pratt St, Baltimore, MD 21202",
        latitude: 39.2858,
        longitude: -76.6083,
        geocodingStatus: "success",
        category: "museum"
      }
    ]
  },
  {
    name: "Massachusetts",
    code: "MA",
    capital: "Boston",
    centroid: { latitude: 42.230171, longitude: -71.530106 },
    spots: [
      {
        id: "ma-1",
        name: "Freedom Trail Boston Common",
        description: "A red-brick pathway winding through Boston past 16 historic locations crucial to the American Revolution.",
        whyMatch: "The ultimate revolutionary walk starring vintage churches, state houses, and burial grounds.",
        emoji: "🏰",
        address: "139 Tremont St, Boston, MA 02111",
        latitude: 42.3551,
        longitude: -71.0656,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "ma-2",
        name: "Harvard Yard",
        description: "The beautiful leafy academic heart of Harvard University, historic red-brick library quads.",
        whyMatch: "Historic Ivy League cobblestones, ivy facades, and classical architecture.",
        emoji: "🎓",
        address: "2 Kirkland St, Cambridge, MA 02138",
        latitude: 42.3734,
        longitude: -71.1169,
        geocodingStatus: "success",
        category: "historic"
      }
    ]
  },
  {
    name: "Michigan",
    code: "MI",
    capital: "Lansing",
    centroid: { latitude: 43.326618, longitude: -84.536064 },
    spots: [
      {
        id: "mi-1",
        name: "Mackinac Island State Park",
        description: "A motor-free island jewel packed with Victorian architecture, horse-drawn carriages, and legendary fudge stores.",
        whyMatch: "Step back into the carriage age on lovely Lake Huron coastlines.",
        emoji: "🌳",
        address: "Mackinac Island, MI 49757",
        latitude: 45.8569,
        longitude: -84.6292,
        geocodingStatus: "success",
        category: "park"
      },
      {
        id: "mi-2",
        name: "The Henry Ford Museum",
        description: "A massive tribute to industrial innovation featuring JFK's real presidential limousine and Rosa Parks' bus.",
        whyMatch: "A staggering gathering of American technological history.",
        emoji: "🏎️",
        address: "20900 Oakwood Blvd, Dearborn, MI 48124",
        latitude: 42.302,
        longitude: -83.2335,
        geocodingStatus: "success",
        category: "museum"
      }
    ]
  },
  {
    name: "Minnesota",
    code: "MN",
    capital: "Saint Paul",
    centroid: { latitude: 45.694454, longitude: -93.900192 },
    spots: [
      {
        id: "mn-1",
        name: "Minnehaha Falls Park",
        description: "A beautiful 53-foot glacial waterfall that cascades into a scenic creek valley right inside Minneapolis bounds.",
        whyMatch: "A lovely green wooded park oasis complete with lime trails.",
        emoji: "🏞️",
        address: "4801 S Minnehaha Dr, Minneapolis, MN 55417",
        latitude: 44.8983,
        longitude: -93.2105,
        geocodingStatus: "success",
        category: "park"
      },
      {
        id: "mn-2",
        name: "Mall of America",
        description: "The gargantuan shopping complex starring a whole indoor theme park, aquarium, and hundreds of retail storefronts.",
        whyMatch: "A massive, ultra-density entertainment and commerce destination.",
        emoji: "🍿",
        address: "60 E Broadway, Bloomington, MN 55425",
        latitude: 44.8548,
        longitude: -93.2428,
        geocodingStatus: "success",
        category: "scenic-overlook"
      }
    ]
  },
  {
    name: "Mississippi",
    code: "MS",
    capital: "Jackson",
    centroid: { latitude: 32.741646, longitude: -89.670806 },
    spots: [
      {
        id: "ms-1",
        name: "Vicksburg National Military Park",
        description: "A sprawling battlefield detailing the pivotal Civil War siege of Vicksburg, marked by stone monuments.",
        whyMatch: "Deep historical exploration containing an authentic ironclad gunboat.",
        emoji: "🏰",
        address: "3201 Clay St, Vicksburg, MS 39183",
        latitude: 32.3431,
        longitude: -90.8496,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "ms-2",
        name: "Delta Blues Museum",
        description: "An arts structure in Clarksdale celebrating the soulful acoustic origins of the original Missisippi Delta Blues.",
        whyMatch: "The spiritual birthplace of rock, soul, and legendary blues guitar styles.",
        emoji: "🎸",
        address: "1 Blues Alley, Clarksdale, MS 38614",
        latitude: 34.2001,
        longitude: -90.573,
        geocodingStatus: "success",
        category: "museum"
      }
    ]
  },
  {
    name: "Missouri",
    code: "MO",
    capital: "Jefferson City",
    centroid: { latitude: 38.456085, longitude: -92.288368 },
    spots: [
      {
        id: "mo-1",
        name: "Gateway Arch National Park",
        description: "The towering 630-foot stainless steel monument honoring the historic westward expansion of the United States.",
        whyMatch: "Hop into retro sphere trams that slide up inside the hollow curve of the arch.",
        emoji: "🏙️",
        address: "11 N 4th St, St. Louis, MO 63102",
        latitude: 38.6247,
        longitude: -90.1848,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "mo-2",
        name: "Silver Dollar City",
        description: "An incredibly detailed 1880s-themed mountain amusement park loaded with artisan glass crafters and record rollercoasters.",
        whyMatch: "A rich mashup of historic woodcrafting trades and big thrills.",
        emoji: "🎢",
        address: "399 Silver Dollar City Pkwy, Branson, MO 65616",
        latitude: 36.6678,
        longitude: -93.3387,
        geocodingStatus: "success",
        category: "park"
      }
    ]
  },
  {
    name: "Montana",
    code: "MT",
    capital: "Helena",
    centroid: { latitude: 46.921925, longitude: -110.454353 },
    spots: [
      {
        id: "mt-1",
        name: "Glacier 'Going-to-the-Sun Road'",
        description: "A spectacular highway cutting across sheer glacial walls, cascading mountain creeks, and alpine rock ledges.",
        whyMatch: "Incredible engineering framing breathtaking high-altitude Montana skylines.",
        emoji: "🌄",
        address: "Going-to-the-Sun Road, Glacier National Park, MT 59936",
        latitude: 48.6963,
        longitude: -113.718,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "mt-2",
        name: "Little Bighorn Battlefield",
        description: "A solemn prairie memorial commemorating the historic clash of 1876 between US Cavalry forces and Native tribes.",
        whyMatch: "Poignant prairie landscapes retelling stories of legendary warriors.",
        emoji: "🏰",
        address: "I-90 Frontage Rd, Crow Agency, MT 59022",
        latitude: 45.5703,
        longitude: -107.4258,
        geocodingStatus: "success",
        category: "historic"
      }
    ]
  },
  {
    name: "Nebraska",
    code: "NE",
    capital: "Lincoln",
    centroid: { latitude: 41.12537, longitude: -98.268082 },
    spots: [
      {
        id: "ne-1",
        name: "Chimney Rock Historic Site",
        description: "A dramatic 325-foot organic spire rising over the grasslands, serving as the landmark of the Oregon Trail travelers.",
        whyMatch: "A nostalgic geographic signpost of early frontier wagon runs.",
        emoji: "🌄",
        address: "Chimney Rock Rd, Bayard, NE 69334",
        latitude: 41.7036,
        longitude: -103.3481,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "ne-2",
        name: "Omaha's Henry Doorly Zoo",
        description: "Consistently ranked among the top zoos globally, starring the world's largest indoor glazed geodesic glazed desert dome.",
        whyMatch: "An elite architectural biome tracing rainforest caves, deserts, and oceans.",
        emoji: "🐒",
        address: "3701 S 10th St, Omaha, NE 68107",
        latitude: 41.2244,
        longitude: -95.9281,
        geocodingStatus: "success",
        category: "museum"
      }
    ]
  },
  {
    name: "Nevada",
    code: "NV",
    capital: "Carson City",
    centroid: { latitude: 38.313515, longitude: -117.055374 },
    spots: [
      {
        id: "nv-1",
        name: "Las Vegas Strip Core",
        description: "A dazzling four-mile street packed with towering replica structures, glowing music fountains, and high-production casinos.",
        whyMatch: "An incredibly luminous monument to nocturnal leisure and performance arts.",
        emoji: "💎",
        address: "3600 Las Vegas Blvd S, Las Vegas, NV 89109",
        latitude: 36.1125,
        longitude: -115.1722,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "nv-2",
        name: "Red Rock Canyon Overlook",
        description: "Vibrant tiered bands of crimson shale rock cliffs soaring over Nevada's high Mojave Desert range.",
        whyMatch: "A peaceful desert escape packed with classic scenic loop routes.",
        emoji: "🌄",
        address: "3205 State Route 159, Las Vegas, NV 89161",
        latitude: 36.1356,
        longitude: -115.4278,
        geocodingStatus: "success",
        category: "scenic-overlook"
      }
    ]
  },
  {
    name: "New Hampshire",
    code: "NH",
    capital: "Concord",
    centroid: { latitude: 43.452492, longitude: -71.563896 },
    spots: [
      {
        id: "nh-1",
        name: "Mount Washington State Park",
        description: "The highest peak in the Northeast, famous for some of the most dramatic wind storms and mountain rail cogways in history.",
        whyMatch: "A scenic pinnacle displaying cloud-locked mountain peaks.",
        emoji: "🌄",
        address: "Mount Washington Auto Road, Sargent's Purchase, NH 03589",
        latitude: 44.2705,
        longitude: -71.3031,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "nh-2",
        name: "Flume Gorge Cascade",
        description: "A raw 800-foot granite notch trail flanked by sheer moss-covered walls and rushing forest pools.",
        whyMatch: "A pleasant, cool wooden walkway hike past lush mountain woods.",
        emoji: "🏞️",
        address: "85 State Route 3, Lincoln, NH 03251",
        latitude: 44.0975,
        longitude: -71.6783,
        geocodingStatus: "success",
        category: "park"
      }
    ]
  },
  {
    name: "New Jersey",
    code: "NJ",
    capital: "Trenton",
    centroid: { latitude: 40.298904, longitude: -74.521011 },
    spots: [
      {
        id: "nj-1",
        name: "Liberty State Park",
        description: "A waterfront park overlooking Jersey City, Manhattan, Ellis Island, and the Statue of Liberty directly.",
        whyMatch: "Epic skyline views, maritime transport, and deep harbor history.",
        emoji: "🗽",
        address: "1 Audrey Zapp Dr, Jersey City, NJ 07305",
        latitude: 40.7042,
        longitude: -74.052,
        geocodingStatus: "success",
        category: "park"
      },
      {
        id: "nj-2",
        name: "Atlantic City Boardwalk Office",
        description: "The world's historic longest wooden boardwalk, lined with casino lights and historic salt-water taffy shops.",
        whyMatch: "A classic coastal entertainment stretch flanking ocean waves.",
        emoji: "🥨",
        address: "2301 Boardwalk, Atlantic City, NJ 08401",
        latitude: 39.3562,
        longitude: -74.4285,
        geocodingStatus: "success",
        category: "scenic-overlook"
      }
    ]
  },
  {
    name: "New Mexico",
    code: "NM",
    capital: "Santa Fe",
    centroid: { latitude: 34.840515, longitude: -106.248482 },
    spots: [
      {
        id: "nm-1",
        name: "Carlsbad Caverns",
        description: "A multi-chamber limestone wonderland starring 'The Big Room', the massive underground cavern chamber.",
        whyMatch: "Embark on an otherworldly trek into deep, cool, stalactite-loaded underground vaults.",
        emoji: "🌳",
        address: "3225 Carlsbad Caverns Hwy, Carlsbad, NM 88220",
        latitude: 32.1753,
        longitude: -104.4439,
        geocodingStatus: "success",
        category: "park"
      },
      {
        id: "nm-2",
        name: "Santa Fe Plaza Historic Ring",
        description: "The historic city center plaza lined with 400-year-old Pueblo adobe structures and artisan jewelers.",
        whyMatch: "A rich meeting point of Spanish Colonial architecture and Indigenous crafts.",
        emoji: "⛩️",
        address: "100 Old Santa Fe Trail, Santa Fe, NM 87501",
        latitude: 35.6885,
        longitude: -105.9398,
        geocodingStatus: "success",
        category: "temple"
      }
    ]
  },
  {
    name: "New York",
    code: "NY",
    capital: "Albany",
    centroid: { latitude: 42.165726, longitude: -74.948051 },
    spots: [
      {
        id: "ny-1",
        name: "Central Park Bethesda Center",
        description: "The emerald crown of New York City, featuring romantic stone bridges, grand public terraces, and leafy elm paths.",
        whyMatch: "An elite public wooded sanctuary framed by skyscraper skylines.",
        emoji: "🌳",
        address: "Bethesda Terrace, Central Park, New York, NY 10024",
        latitude: 40.7737,
        longitude: -73.9708,
        geocodingStatus: "success",
        category: "park"
      },
      {
        id: "ny-2",
        name: "Niagara Falls State Park Overlook",
        description: "The historic oldest state park in the nation, bordering the roaring, massive mist-clouds of Horseshoe Falls.",
        whyMatch: "A thunderous spectacle of roaring glacial water power.",
        emoji: "🏞️",
        address: "332 Prospect St, Niagara Falls, NY 14303",
        latitude: 43.0815,
        longitude: -79.0642,
        geocodingStatus: "success",
        category: "scenic-overlook"
      }
    ]
  },
  {
    name: "North Carolina",
    code: "NC",
    capital: "Raleigh",
    centroid: { latitude: 35.630066, longitude: -79.806419 },
    spots: [
      {
        id: "nc-1",
        name: "Biltmore Estate",
        description: "A breathtaking 250-room French Renaissance chateau, recognized as America's largest private residence.",
        whyMatch: "A stunning Gilded Age castle complete with manicured estate gardens.",
        emoji: "🏰",
        address: "1 Lodge St, Asheville, NC 28803",
        latitude: 35.5406,
        longitude: -82.552,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "nc-2",
        name: "Cape Hatteras Lighthouse",
        description: "An iconic spiral-striped brick lighthouse holding guard over North Carolina's shifting Outer Banks sound cliffs.",
        whyMatch: "Ocean vistas framing dangerous historic shipping waters.",
        emoji: "🌄",
        address: "46379 Lighthouse Rd, Buxton, NC 27920",
        latitude: 35.251,
        longitude: -75.529,
        geocodingStatus: "success",
        category: "scenic-overlook"
      }
    ]
  },
  {
    name: "North Dakota",
    code: "ND",
    capital: "Bismarck",
    centroid: { latitude: 47.528912, longitude: -99.784012 },
    spots: [
      {
        id: "nd-1",
        name: "Theodore Roosevelt National Park",
        description: "A striking badlands terrain filled with colorful rock canyons, petrified timber, and roaming herds of wild bison.",
        whyMatch: "Explore the scenic rugged badlands country that inspired a president.",
        emoji: "🌳",
        address: "Scenic Loop Rd, Medora, ND 58645",
        latitude: 46.968,
        longitude: -103.525,
        geocodingStatus: "success",
        category: "park"
      },
      {
        id: "nd-2",
        name: "Scandinavian Heritage Park",
        description: "A fascinating open-air park paying tribute to Nordic culture, starring a replica historic Stave Church.",
        whyMatch: "Beautiful carved woodwork, authentic sod houses, and real windmills.",
        emoji: "⛩️",
        address: "1020 S Broadway, Minot, ND 58701",
        latitude: 48.225,
        longitude: -101.2965,
        geocodingStatus: "success",
        category: "temple"
      }
    ]
  },
  {
    name: "Ohio",
    code: "OH",
    capital: "Columbus",
    centroid: { latitude: 40.388783, longitude: -82.764915 },
    spots: [
      {
        id: "oh-1",
        name: "Rock & Roll Hall of Fame",
        description: "An iconic glass-pyramid waterfront structure designed by I.M. Pei celebrating legendary rock music history.",
        whyMatch: "See real instruments and memorabilia of rock legends overlooking Lake Erie shores.",
        emoji: "🎸",
        address: "1100 Rock and Roll Blvd, Cleveland, OH 44114",
        latitude: 41.5086,
        longitude: -81.6953,
        geocodingStatus: "success",
        category: "museum"
      },
      {
        id: "oh-2",
        name: "Hocking Hills Old Man's Cave",
        description: "A gorgeous hemlock-shaded sandstone gorge featuring tall waterfalls, cavern bridges, and carved pools.",
        whyMatch: "The ultimate rugged wilderness ravine trail in midwestern woods.",
        emoji: "🏔️",
        address: "19852 State Route 664, Logan, OH 43138",
        latitude: 39.4356,
        longitude: -82.5383,
        geocodingStatus: "success",
        category: "park"
      }
    ]
  },
  {
    name: "Oklahoma",
    code: "OK",
    capital: "Oklahoma City",
    centroid: { latitude: 35.565342, longitude: -96.928917 },
    spots: [
      {
        id: "ok-1",
        name: "Oklahoma City National Memorial",
        description: "A poignant outdoor symbolic memorial featuring 168 bronze and stone chairs along a reflective black granite water strip.",
        whyMatch: "A striking tribute to strength and community healing.",
        emoji: "🏰",
        address: "620 N Harvey Ave, Oklahoma City, OK 73102",
        latitude: 35.4728,
        longitude: -97.518,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "ok-2",
        name: "National Cowboy Museum",
        description: "A vast gallery showcasing historical weaponry, western artwork, and interactive replica pioneer frontier towns.",
        whyMatch: "The premier cultural showcase protecting American frontier lore.",
        emoji: "🤠",
        address: "1700 NE 63rd St, Oklahoma City, OK 73111",
        latitude: 35.5348,
        longitude: -97.4812,
        geocodingStatus: "success",
        category: "museum"
      }
    ]
  },
  {
    name: "Oregon",
    code: "OR",
    capital: "Salem",
    centroid: { latitude: 44.572021, longitude: -122.070938 },
    spots: [
      {
        id: "or-1",
        name: "Crater Lake National Park",
        description: "The deepest and clearest volcanic caldera lake in the United States, bounded by sheer basalt cliffs.",
        whyMatch: "Unparalleled views of deep sapphire-blue volcanic water ripples.",
        emoji: "🏞️",
        address: "Rim Dr, Crater Lake, OR 97604",
        latitude: 42.9419,
        longitude: -122.109,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "or-2",
        name: "Multnomah Falls",
        description: "A dramatic 620-foot two-tiered waterfall, crossed by the iconic stone Benson Bridge directly in front of the cascade.",
        whyMatch: "A lush, fern-carpeted canyon mist experience in the heart of the Columbia Gorge.",
        emoji: "🌳",
        address: "Columbia River Hwy, Corbett, OR 97019",
        latitude: 45.5762,
        longitude: -122.1158,
        geocodingStatus: "success",
        category: "park"
      }
    ]
  },
  {
    name: "Pennsylvania",
    code: "PA",
    capital: "Harrisburg",
    centroid: { latitude: 40.590752, longitude: -77.209755 },
    spots: [
      {
        id: "pa-1",
        name: "Independence National Historical Park",
        description: "The historic city blocks housing the Liberty Bell and Independence Hall, where the Declaration in 1776 was negotiated.",
        whyMatch: "Step into the red-brick chambers that birthed the nation.",
        emoji: "🏰",
        address: "520 Chestnut St, Philadelphia, PA 19106",
        latitude: 39.9489,
        longitude: -75.15,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "pa-2",
        name: "Gettysburg Battlefield",
        description: "The sprawling landscape memorializing the turning-point battle of the Civil War in July 1863.",
        whyMatch: "A vast landscape dotted with historic cannons and battlefield lines.",
        emoji: "🛡️",
        address: "1195 Baltimore Pike, Gettysburg, PA 17325",
        latitude: 39.8131,
        longitude: -77.2285,
        geocodingStatus: "success",
        category: "historic"
      }
    ]
  },
  {
    name: "Rhode Island",
    code: "RI",
    capital: "Providence",
    centroid: { latitude: 41.680893, longitude: -71.51178 },
    spots: [
      {
        id: "ri-1",
        name: "The Breakers Mansion",
        description: "A jaw-dropping 70-room Italian Renaissance estate building commissioned by the Vanderbilt family during the Gilded Age.",
        whyMatch: "The gold-plated pinnacle of historic oceanic high-society mansions.",
        emoji: "🏰",
        address: "44 Ochre Point Ave, Newport, RI 02840",
        latitude: 41.4697,
        longitude: -71.2985,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "ri-2",
        name: "Newport Cliff Walk",
        description: "A gorgeous three-mile public coastal trail that borders crashing ocean shorelines on one side and gilded estates on the other.",
        whyMatch: "A striking coastal stroll showing off elite historic residences.",
        emoji: "🌄",
        address: "117 Memorial Blvd, Newport, RI 02840",
        latitude: 41.4795,
        longitude: -71.2917,
        geocodingStatus: "success",
        category: "scenic-overlook"
      }
    ]
  },
  {
    name: "South Carolina",
    code: "SC",
    capital: "Columbia",
    centroid: { latitude: 33.85689, longitude: -80.945007 },
    spots: [
      {
        id: "sc-1",
        name: "Charleston Historic District",
        description: "Beautifully preserved cobblestoned streets and pastel-painted Antebellum row houses bordering the coastal harbor.",
        whyMatch: "Ride historic carriage routes down gas-lit coastal neighborhoods.",
        emoji: "🏰",
        address: "375 Meeting St, Charleston, SC 29403",
        latitude: 32.7831,
        longitude: -79.937,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "sc-2",
        name: "Fort Sumter National Monument",
        description: "The historic seaside fort in Charleston Harbor where the first shots of the American Civil War were fired in 1861.",
        whyMatch: "Step off a ferry onto historical coastal battery battle lines.",
        emoji: "⚓",
        address: "340 Concord St, Charleston, SC 29401",
        latitude: 32.7523,
        longitude: -79.8742,
        geocodingStatus: "success",
        category: "historic"
      }
    ]
  },
  {
    name: "South Dakota",
    code: "SD",
    capital: "Pierre",
    centroid: { latitude: 44.299782, longitude: -99.43882 },
    spots: [
      {
        id: "sd-1",
        name: "Mount Rushmore",
        description: "The monumental granite mountainside carving depicting 60-foot heads of four prominent US Presidents.",
        whyMatch: "A colossal American landmark carved beautifully into the Black Hills pines.",
        emoji: "🌄",
        address: "13000 Highway 244, Keystone, SD 57751",
        latitude: 43.8791,
        longitude: -103.4591,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "sd-2",
        name: "Badlands Loop Overlook",
        description: "Striking layered geological stone mesas, spires, and canyons surrounded by golden mixed-grass prairies.",
        whyMatch: "An extraordinarily rugged wilderness terrain packed with fossils.",
        emoji: "🧗",
        address: "25216 SD Highway 240, Interior, SD 57750",
        latitude: 43.763,
        longitude: -101.927,
        geocodingStatus: "success",
        category: "scenic-overlook"
      }
    ]
  },
  {
    name: "Tennessee",
    code: "TN",
    capital: "Nashville",
    centroid: { latitude: 35.747845, longitude: -86.692345 },
    spots: [
      {
        id: "tn-1",
        name: "Great Smoky Mountains Center",
        description: "America's most visited national park, featuring ancient, mist-draped mountain ridges and historical cabins.",
        whyMatch: "Marvel at rolling ridges coated in majestic blue mountain haze.",
        emoji: "🌳",
        address: "107 Park Headquarters Rd, Gatlinburg, TN 37738",
        latitude: 35.6117,
        longitude: -83.5042,
        geocodingStatus: "success",
        category: "park"
      },
      {
        id: "tn-2",
        name: "Graceland Mansion",
        description: "The legendary 13-acre estate grounds belonging to Elvis Presley, featuring authentic retro-chic music rooms.",
        whyMatch: "Trace incredible musical artifacts of the King of Rock and Roll.",
        emoji: "🎸",
        address: "3764 Elvis Presley Blvd, Memphis, TN 38116",
        latitude: 35.0461,
        longitude: -90.0251,
        geocodingStatus: "success",
        category: "historic"
      }
    ]
  },
  {
    name: "Texas",
    code: "TX",
    capital: "Austin",
    centroid: { latitude: 31.054487, longitude: -97.563461 },
    spots: [
      {
        id: "tx-1",
        name: "The Alamo Historic Site",
        description: "The historic Spanish mission fort where Texas defenders fought to the last during the battle of 1836.",
        whyMatch: "Commanding limestone arches representing pivotal southwestern heritage.",
        emoji: "🏰",
        address: "300 Alamo Plaza, San Antonio, TX 78205",
        latitude: 29.426,
        longitude: -98.4862,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "tx-2",
        name: "Space Center Houston",
        description: "The official visitor center of NASA Johnson Space Center, housing historic spacecraft and astronaut mission control hubs.",
        whyMatch: "Walk inside a massive space shuttle replica and touch real Moon rocks.",
        emoji: "🚀",
        address: "1601 NASA Parkway, Houston, TX 77058",
        latitude: 29.5519,
        longitude: -95.0979,
        geocodingStatus: "success",
        category: "museum"
      }
    ]
  },
  {
    name: "Utah",
    code: "UT",
    capital: "Salt Lake City",
    centroid: { latitude: 39.32098, longitude: -111.583002 },
    spots: [
      {
        id: "ut-1",
        name: "Zion Canyon Trailhead",
        description: "A spectacular vertical canyon landscape, home to the breathtaking Angels Landing rock paths.",
        whyMatch: "Epic sheer red sandstone cliffs and rushing virgin stream pools.",
        emoji: "🏔️",
        address: "Zion Park Blvd, Springdale, UT 84767",
        latitude: 37.2147,
        longitude: -112.9882,
        geocodingStatus: "success",
        category: "park"
      },
      {
        id: "ut-2",
        name: "Temple Square",
        description: "A gorgeous neo-Gothic granite temple complex flanking beautifully manicured pools and historic tabernacles.",
        whyMatch: "A striking, massive historical structure right in the heart of Salt Lake.",
        emoji: "⛩️",
        address: "50 N Temple St, Salt Lake City, UT 84150",
        latitude: 40.7704,
        longitude: -111.8919,
        geocodingStatus: "success",
        category: "historic"
      }
    ]
  },
  {
    name: "Vermont",
    code: "VT",
    capital: "Montpelier",
    centroid: { latitude: 44.045876, longitude: -72.710686 },
    spots: [
      {
        id: "vt-1",
        name: "Shelburne Museum",
        description: "A stellar, sprawling museum of American art containing 39 historic exhibition buildings, including a historic side-wheeler ship.",
        whyMatch: "A striking layout of early New England architecture and handmade quilts.",
        emoji: "🖼️",
        address: "6000 Shelburne Rd, Shelburne, VT 05482",
        latitude: 44.3756,
        longitude: -73.2305,
        geocodingStatus: "success",
        category: "museum"
      },
      {
        id: "vt-2",
        name: "Green Mountain National Forest",
        description: "Over 400,000 acres of preserved hardwood forests, rushing rivers, and historical wooden ski towns.",
        whyMatch: "The quintessential foliage and hiking forest destination in Vermont.",
        emoji: "🌳",
        address: "2313 Route 11, Londonderry, VT 05148",
        latitude: 43.1975,
        longitude: -72.9342,
        geocodingStatus: "success",
        category: "park"
      }
    ]
  },
  {
    name: "Virginia",
    code: "VA",
    capital: "Richmond",
    centroid: { latitude: 37.769337, longitude: -78.169968 },
    spots: [
      {
        id: "va-1",
        name: "Colonial Williamsburg Ring",
        description: "The world's largest living history outdoor museum, fully recreating 18th-century colonial life.",
        whyMatch: "Chat with blacksmiths, wigmakers, and colonial carriage drivers in real-time.",
        emoji: "🏰",
        address: "101 Visitor Center Dr, Williamsburg, VA 23185",
        latitude: 37.2707,
        longitude: -76.7001,
        geocodingStatus: "success",
        category: "historic"
      },
      {
        id: "va-2",
        name: "Shenandoah Skyline Drive",
        description: "A spectacular scenic crest highway tracing the summits of the Blue Ridge Mountains.",
        whyMatch: "Perfect views under golden forest canopies watching wild deer.",
        emoji: "🌄",
        address: "Skyline Drive, Front Royal, VA 22630",
        latitude: 38.654,
        longitude: -78.362,
        geocodingStatus: "success",
        category: "scenic-overlook"
      }
    ]
  },
  {
    name: "Washington",
    code: "WA",
    capital: "Olympia",
    centroid: { latitude: 47.400902, longitude: -121.490494 },
    spots: [
      {
        id: "wa-1",
        name: "Space Needle Overlook",
        description: "Seattle's historic 605-foot futuristic flying-saucer tower showcasing sweeping vistas of Puget Sound.",
        whyMatch: "Includes high-fidelity glass floors showing ground views from high altitude.",
        emoji: "🏙️",
        address: "400 Broad St, Seattle, WA 98109",
        latitude: 47.6205,
        longitude: -122.3493,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "wa-2",
        name: "Mount Rainier National Park",
        description: "An active glacial volcano soaring over 14,000 feet, surrounded by gorgeous subalpine wildflower meadows.",
        whyMatch: "Lush evergreen alpine trails with waterfalls and pristine glaciers.",
        emoji: "🏔️",
        address: "Paradise Rd, Ashford, WA 98304",
        latitude: 46.8523,
        longitude: -121.7603,
        geocodingStatus: "success",
        category: "park"
      }
    ]
  },
  {
    name: "West Virginia",
    code: "WV",
    capital: "Charleston",
    centroid: { latitude: 38.491227, longitude: -80.954453 },
    spots: [
      {
        id: "wv-1",
        name: "New River Gorge Bridge Point",
        description: "One of the longest steel arch bridges in the western hemisphere, soaring over a rugged wild river canyon.",
        whyMatch: "Incredible mountain bridge engineering with massive rock cliffs.",
        emoji: "🌄",
        address: "162 Visitor Center Rd, Lansing, WV 25862",
        latitude: 38.0689,
        longitude: -81.0825,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "wv-2",
        name: "Harpers Ferry Historic District",
        description: "A postcard historic mountain village situated precisely at the scenic confluence of the Potomac and Shenandoah rivers.",
        whyMatch: "Explore red-brick ruins, historical canal paths, and crucial Civil War sites.",
        emoji: "🏰",
        address: "171 Shoreline Dr, Harpers Ferry, WV 25425",
        latitude: 39.3244,
        longitude: -77.7428,
        geocodingStatus: "success",
        category: "historic"
      }
    ]
  },
  {
    name: "Wisconsin",
    code: "WI",
    capital: "Madison",
    centroid: { latitude: 44.268543, longitude: -89.616508 },
    spots: [
      {
        id: "wi-1",
        name: "Milwaukee Art Museum",
        description: "A gorgeous lakefront modernist pavilion styled with dynamic 217-foot wings that open and close like a giant bird.",
        whyMatch: "An elite architectural masterpiece combining custom art vaults with lake breezes.",
        emoji: "🖼️",
        address: "700 Art Museum Drive, Milwaukee, WI 53202",
        latitude: 43.0389,
        longitude: -87.8967,
        geocodingStatus: "success",
        category: "museum"
      },
      {
        id: "wi-2",
        name: "Apostle Islands Sea Caves",
        description: "Gorgeous lakeside red sandstone cliffs hollowed out into sea arches on the crystal-clear Lake Superior waters.",
        whyMatch: "Perfect for scenic rock kayak excursions.",
        emoji: "🏞️",
        address: "Meyers Beach Rd, Bayfield, WI 54814",
        latitude: 46.885,
        longitude: -90.542,
        geocodingStatus: "success",
        category: "scenic-overlook"
      }
    ]
  },
  {
    name: "Wyoming",
    code: "WY",
    capital: "Cheyenne",
    centroid: { latitude: 42.755966, longitude: -107.30249 },
    spots: [
      {
        id: "wy-1",
        name: "Yellowstone 'Old Faithful'",
        description: "The world's premier thermal area, home to majestic, highly predictable sulfur steam geysers.",
        whyMatch: "Witness spectacular boiling mud pots, natural springs, and geysers.",
        emoji: "🌋",
        address: "Old Faithful geyser, Yellowstone National Park, WY 82190",
        latitude: 44.4604,
        longitude: -110.8281,
        geocodingStatus: "success",
        category: "scenic-overlook"
      },
      {
        id: "wy-2",
        name: "Grand Teton Jackson Lake",
        description: "Spectacular knife-edged granite peaks rising steeply over the glassy waters of Jackson Lake.",
        whyMatch: "Perfect views of raw alpine beauty without any lower foothills blocking the sky.",
        emoji: "🏔️",
        address: "Jackson Lake Lodge Rd, Moran, WY 83013",
        latitude: 43.8785,
        longitude: -110.579,
        geocodingStatus: "success",
        category: "park"
      }
    ]
  }
];
