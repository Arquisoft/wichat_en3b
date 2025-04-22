// Define the SPARQL queries to fetch data from Wikidata
const QUERIES = {
    city: `SELECT ?city ?cityLabel ?image WHERE {
  ?city wdt:P31 wd:Q515;  # The entity is a city
        wikibase:sitelinks ?sitelinks;  # Number of Wikipedia links
        wdt:P18 ?image.  # The city has an image
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

    flag: `SELECT ?flag ?flagLabel ?image WHERE {
  ?flag wdt:P31 wd:Q6256;  # The entity is a country
           wikibase:sitelinks ?sitelinks;  # Number of Wikipedia links
           wdt:P41 ?image.  # Country flag image
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)  # Order by popularity
LIMIT 200
`,

    athlete: `SELECT DISTINCT ?athlete ?athleteLabel ?image WHERE {
  ?athlete wdt:P31 wd:Q5;  # The entity is a person
           wdt:P106 ?sport;  # The person is an athlete
           wikibase:sitelinks ?sitelinks;  # Number of Wikipedia links
           wdt:P18 ?image;  # The athlete must have an image
           wdt:P166 ?award.  # The athlete has won a major award

  # Filter by types of athletes
  VALUES ?sport { wd:Q937857 wd:Q10833314 wd:Q3665646 }  
  # Q937857 = Footballer
  # Q10833314 = Tennis player
  # Q3665646 = Basketball player

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)  # Order by popularity
LIMIT 200
`,

    singer: `SELECT ?singer ?singerLabel ?image WHERE {
  ?singer wdt:P31 wd:Q5;  # The entity is a person
          wdt:P106 wd:Q177220;  # The person is a singer
          wikibase:sitelinks ?sitelinks;  # Number of Wikipedia links
          wdt:P18 ?image.  # The person has an image

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

    country: `SELECT ?country ?countryLabel ?image WHERE {
  ?country wdt:P31 wd:Q6256;  # The entity is a country
           wikibase:sitelinks ?sitelinks;  # Number of Wikipedia links
           wdt:P242 ?image.  # Image of the territory's silhouette
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)  # Sort by popularity
LIMIT 200
`,

    sport: `SELECT ?sport ?sportLabel ?image WHERE {
?sport wdt:P31 wd:Q31629;        # The entity is a type of sport
        wikibase:sitelinks ?sitelinks;  # Number of Wikipedia sitelinks
        wdt:P18 ?image.           # The sport has an image

SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)  # Sort by popularity
LIMIT 200
`,

    spanishProvince: `SELECT ?spanishProvince ?spanishProvinceLabel ?image WHERE {
  ?spanishProvince wdt:P31 wd:Q162620;          # Instance of Spanish province
           wikibase:sitelinks ?sitelinks;
           wdt:P242 ?image.              # Territorial silhouette

  FILTER(?spanishProvince NOT IN (wd:Q16622625, wd:Q274126))  # Exclude Gulf of Guinea and Havana departments

  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 100
`,
  
    spanishCommunityFlag: `SELECT DISTINCT ?spanishCommunityFlag ?spanishCommunityFlagLabel ?image WHERE {
  ?spanishCommunityFlag wdt:P31/wdt:P279* wd:Q10742;  # Instance of (or subclass of) autonomous community
          wdt:P41 ?image;  # Flag of the community
          wikibase:sitelinks ?sitelinks.

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 20  # Just 17 communities
`,
  
    historicalEvent: `SELECT ?historicalEvent ?historicalEventLabel ?image WHERE {
  ?historicalEvent wdt:P31 wd:Q1190554;    # Instance of occurence
  wikibase:sitelinks ?sitelinks;  # Number of Wikipedia links
  wdt:P18 ?image.                 # Image of the event (required)
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} 
ORDER BY DESC(?sitelinks)         # Sort by popularity
LIMIT 200
`,
  
    famousPlace: `SELECT DISTINCT ?famousPlace ?famousPlaceLabel ?image WHERE {
  ?famousPlace wdt:P31 wd:Q570116;  # The entity is a famous place
  wikibase:sitelinks ?sitelinks;
  wdt:P18 ?image.

  # Get the label in English
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)  # Sort by popularity
LIMIT 200
`,
  
    spanishCity: `SELECT ?spanishCity ?spanishCityLabel ?image ?population WHERE {
  {
    ?spanishCity wdt:P31 wd:Q2074737.  # Municipality of Spain
  }
  UNION
  {
    ?spanishCity wdt:P31 wd:Q515;
                 wdt:P17 wd:Q29.       # City located in Spain
  }

  ?spanishCity wdt:P18 ?image;         # Has image
               wdt:P1082 ?population.  # Has population

  SERVICE wikibase:label { 
    bd:serviceParam wikibase:language "en".
    ?spanishCity rdfs:label ?spanishCityLabel.
  }

  # Exclude labels that are just Q followed by numbers
  FILTER(!REGEX(?spanishCityLabel, "^Q[0-9]+$"))
}
ORDER BY DESC(?population)
LIMIT 200
`,
  
    musicalInstrument: `SELECT ?musicalInstrument ?musicalInstrumentLabel ?image WHERE {
  # The entity is a musical instrument
  ?musicalInstrument wdt:P31 wd:Q110295396;

             # The instrument has an image
             wdt:P18 ?image;

             # Number of Wikipedia sitelinks (used for popularity)
             wikibase:sitelinks ?sitelinks.
  
  # Labels in English
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)  # Sort by popularity
LIMIT 200
`,
      
    historicalWoman: `SELECT ?historicalWoman ?historicalWomanLabel ?image WHERE {
  # Start with a smaller set of entities (those with many sitelinks)
  ?historicalWoman wikibase:sitelinks ?sitelinks.
  FILTER(?sitelinks > 100)        # Higher threshold for faster results
  
  # Then apply the more expensive filters
  ?historicalWoman wdt:P31 wd:Q5;           # Instance of human
  wdt:P21 wd:Q6581072;            # Female gender
  wdt:P18 ?image.                 # Image (required)
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} 
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

    sportingGijonPlayer: `SELECT DISTINCT ?sportingGijonPlayer ?sportingGijonPlayerLabel ?image ?sitelinks WHERE {
?sportingGijonPlayer p:P54 ?membership.
?membership ps:P54 wd:Q12278.  # Has played for Real Sporting de Gijón

?sportingGijonPlayer wdt:P18 ?image.
?sportingGijonPlayer wikibase:sitelinks ?sitelinks.

SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

oviedoPlayer: `SELECT DISTINCT ?oviedoPlayer ?oviedoPlayerLabel ?image ?sitelinks WHERE {
?oviedoPlayer p:P54 ?membership.
?membership ps:P54 wd:Q271574.  # Has played for Real Oviedo

?oviedoPlayer wdt:P18 ?image.
?oviedoPlayer wikibase:sitelinks ?sitelinks.

SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

realMadridPlayer: `SELECT DISTINCT ?realMadridPlayer ?realMadridPlayerLabel ?image ?sitelinks WHERE {
?realMadridPlayer p:P54 ?membership.
?membership ps:P54 wd:Q8682.  # Has played for Real Madrid

?realMadridPlayer wdt:P18 ?image.
?realMadridPlayer wikibase:sitelinks ?sitelinks.

SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

barcelonaPlayer: `SELECT DISTINCT ?barcelonaPlayer ?barcelonaPlayerLabel ?image ?sitelinks WHERE {
?barcelonaPlayer p:P54 ?membership.
?membership ps:P54 wd:Q7156.  # Has played for FC Barcelona

?barcelonaPlayer wdt:P18 ?image.
?barcelonaPlayer wikibase:sitelinks ?sitelinks.

SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

atleticoMadridPlayer: `SELECT DISTINCT ?atleticoMadridPlayer ?atleticoMadridPlayerLabel ?image ?sitelinks WHERE {
?atleticoMadridPlayer p:P54 ?membership.
?membership ps:P54 wd:Q8701.  # Has played for Atlético de Madrid

?atleticoMadridPlayer wdt:P18 ?image.
?atleticoMadridPlayer wikibase:sitelinks ?sitelinks.

SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

    language: `SELECT ?language ?languageLabel ?image WHERE {
  ?language wdt:P31 wd:Q33742;        # The entity is a natural language
            wikibase:sitelinks ?sitelinks;  # Number of Wikipedia sitelinks (popularity)
            wdt:P18 ?image.           # Image property (general image)
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)  # Sort by popularity
LIMIT 200
`,
      
    f1Driver: `SELECT ?f1Driver ?f1DriverLabel ?image WHERE {
  ?f1Driver wdt:P31 wd:Q5;              # Human being
          wdt:P106 wd:Q10841764;       # F1 Driver
          wikibase:sitelinks ?sitelinks;  # Wikipedia sitelinks
          wdt:P18 ?image.              # Driver's image
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)              # Sorted from most popular to least
LIMIT 200
`,
  
    racingCircuit: `SELECT ?racingCircuit ?racingCircuitLabel ?image WHERE {
  # Select entities that are race tracks (using Q2338524)
  ?racingCircuit wdt:P31/wdt:P279* wd:Q2338524;
           wikibase:sitelinks ?sitelinks;
           wdt:P3311 ?image.
  
  SERVICE wikibase:label { 
    bd:serviceParam wikibase:language "en". 
  }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

    asturianFamous: `SELECT ?asturianFamous ?asturianFamousLabel ?image WHERE {
?asturianFamous wdt:P31 wd:Q5;  # Is a person
        wikibase:sitelinks ?sitelinks;
        wdt:P19 ?birthplace;  # Has a place of birth
        wdt:P18 ?image.  # Has an associated image

?birthplace wdt:P131* wd:Q3934.  # Is in Asturias (Q3934)

SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
}
ORDER BY DESC(?sitelinks)  # Sort alphabetically
LIMIT 200
`,

    asturianCouncil: `SELECT ?asturianCouncil ?asturianCouncilLabel ?image WHERE {
?asturianCouncil wdt:P31 wd:Q5055981;       # Instance of Asturian council (concejo)
            wikibase:sitelinks ?sitelinks;  # Number of Wikipedia sitelinks (used as popularity metric)
            wdt:P242 ?image.           # Image of the territorial silhouette (P242)

SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }  # Get labels in Spanish and English
}
ORDER BY DESC(?sitelinks)  # Sort by most popular
LIMIT 100  # Limit the number of results for better performance
`,
 
    nbaPlayer:  `SELECT ?nbaPlayer ?nbaPlayerLabel ?image WHERE {
      ?nbaPlayer wdt:P106 wd:Q3665646;      # occupation: basketball player
                 wdt:P118 wd:Q155223;       # league: NBA
                 wdt:P18 ?image;            # image
                 wikibase:sitelinks ?sitelinks.
    
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    ORDER BY DESC(?sitelinks)
    LIMIT 200
    `,

    wnbaPlayer:  `SELECT ?wnbaPlayer ?wnbaPlayerLabel ?image ?sitelinks WHERE {
  ?wnbaPlayer wdt:P106 wd:Q3665646;      # occupation: basketball player
              wdt:P118 wd:Q2593221;      # league: WNBA
              wdt:P18 ?image;            # image
              wikibase:sitelinks ?sitelinks.

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

    atpPlayer: `SELECT ?atpPlayer ?atpPlayerLabel ?image WHERE {
  ?atpPlayer wdt:P106 wd:Q10833314;   # occupation: tennis player
                wdt:P641 wd:Q847;        # sport: tennis
                wdt:P21 wd:Q6581097;     # gender: male
                wdt:P18 ?image;          # image
                wikibase:sitelinks ?sitelinks.

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

   wtaPlayer: `SELECT ?tennisPlayer ?tennisPlayerLabel ?image WHERE {
  ?tennisPlayer wdt:P106 wd:Q10833314;   # occupation: tennis player
                wdt:P641 wd:Q847;        # sport: tennis
                wdt:P21 wd:Q6581072;     # gender: female
                wdt:P18 ?image;          # image
                wikibase:sitelinks ?sitelinks.

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

    euroleaguePlayer: `SELECT ?euroleaguePlayer ?euroleaguePlayerLabel ?image WHERE {
  ?euroleaguePlayer wdt:P106 wd:Q3665646;    # occupation: basketball player
                    wdt:P118 wd:Q185982;     # league: EuroLeague
                    wdt:P18 ?image;          # image
                    wikibase:sitelinks ?sitelinks.

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

    rockBand: `SELECT ?rockBand ?rockBandLabel ?image WHERE {
  ?rockBand wdt:P31 wd:Q215380;        # instance of: musical group
             wdt:P136 wd:Q11399;        # genre: rock music
             wdt:P18 ?image;            # image
             wikibase:sitelinks ?sitelinks.

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`
      
};

module.exports = QUERIES;