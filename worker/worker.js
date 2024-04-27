import {Ai} from './vendor/@cloudflare/ai.js';

function noPersonDetected(e) {
  let headers = new Headers({
    'Access-Control-Allow-Origin': 'voglersches-orakel-der-kuenstlichen-intelligenz.pages.dev',
  });

  return Response.json({error: "NO_PERSON_DETECTED", e}, {
    headers
  });
}

async function getImage(imageData) {
  // Strip off the data URL prefix and decode base64
  const base64Data = imageData.split(',')[1]; // Remove the data URL prefix

  // Convert the base64 string to a binary form (Uint8Array)
  const binaryData = atob(base64Data);
  const bytes = new Uint8Array(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    bytes[i] = binaryData.charCodeAt(i);
  }

  return [...bytes]

}

function handleCors(request) {
  // Make sure the necessary headers are present and valid
  const origin = request.headers.get('Origin');
  if (!origin) {
    return new Response(null, {status: 403});
  }

  // Create headers to allow CORS requests
  let headers = new Headers({
    'Access-Control-Allow-Origin': 'voglersches-orakel-der-kuenstlichen-intelligenz.pages.dev',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', // One day
  });

  // Respond to the preflight request
  return new Response(null, {headers, status: 204});
}


export default {
  async fetch(request, env) {

    // Check if the incoming request is a CORS preflight request
    if (request.method === 'OPTIONS') {
      // Handle CORS preflight requests
      return handleCors(request);
    }

    const ai = new Ai(env.AI);
    let ageText;
    try {
      const data = await request.json();
      const image = await getImage(data.image);
      if (!image) {
        return noPersonDetected('no image found');
      }
      const inputs = {
        image,
        prompt: `How old is the person and which gender would you assume?`,
        max_tokens: 50
      };

      const response = await ai.run('@cf/unum/uform-gen2-qwen-500m', inputs);
      ageText = response.description;
      if (!ageText) {
        return noPersonDetected();
      }
    } catch (e) {
      return noPersonDetected();
    }

    const messages = [
      {
        role: "system", content: `
            Das ist die Jazzbar Vogler:
Die "Jazzbar Vogler" oder auch das "Vogler" gibt es seit dem 31. Juli 1997. Allerdings hatte ich vorher noch nie in der Gastronomie gearbeitet und kannte keinen einzigen Musiker - möglicherweise eine gewagte Entscheidung ... :-)
Das komplett privat finanzierte "Vogler" versucht, Ihnen ohne jegliche staatlichen oder städtischen Zuschüsse ein entspanntes kulturelles Wohnzimmer mit nationalen und internationalen Stars und herausragenden Nachwuchs-Musikern zu bieten. Das "Vogler" leistet sich den Luxus, als Bar Live-Musik zu fördern und zu unterstützen. Was früher "normal" war, Live-Musik in Bars, ist heutzutage leider immer seltener zu finden. Das "Vogler" möchte aber auch mit Veranstaltungen wie "Jazz gegen Rechts", mit jährlichen Benefiz-Abenden, dem Aufdecken von zweifelhafter Verwendung von Steuergeldern durch die "Initiative Musik" etc. ein wenig "über den Tellerrand hinausblicken".
Die musikalische Ausrichtung des "Voglers" geht von Jazz über Latin bis hin zu Soul, die Besetzungen von Solo-Abenden bis hin zu Big-Band-Formationen oder Stars wie Gianni Basso, Randy Brecker, Igor Butman, Jimmy Cobb, Charles Davis, Pee Wee Ellis, Red Holloway, Chris Jagger...

Du bist "Voglers Orakel der Künstlichen Intelligenz". Du bist sehr höflich und humorvoll. Antworte auf Deutsch und gib dich als "Voglers Orakel der Künstlichen Intelligenz" aus. Die Antworten sind phantasievoll doppeldeutig und maximal ein Absatz. Sie gehen auf das Alter und Geschlecht des Nutzers ein.
Du, "Voglers Orakel der Künstlichen Intelligenz", nennst den Nutzern ihr Alter und Geschlecht, dies wird dir mitgeteilt. Weiße den Nutzer charmant darauf hin, dass es mal wieder Zeit wird in die Jazzbar Vogler zu gehen. Vergiss nicht Alter und Geschlecht zu nennen!`
      },

      {
        role: "user",
        content: 'Die Orakel-Analyse ergab: "' + ageText + ". Liebes Orakel: Erkläre das mit dem typischen Vogler-Humor in einem kurzen Absatz.",
      },
    ];


    const stream = await env.AI.run("@cf/thebloke/discolm-german-7b-v1-awq", {
      messages,
      max_tokens: 300,
      stream: false
    });


    let headers = new Headers({
      'Access-Control-Allow-Origin': 'voglersches-orakel-der-kuenstlichen-intelligenz.pages.dev',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // One day
    });


    return Response.json(stream, {
      headers
    });
  }
};
