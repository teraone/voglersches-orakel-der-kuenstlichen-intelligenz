import {Ai} from './vendor/@cloudflare/ai.js';


const allowedOrigin = 'https://orakel.jazzbar-vogler.com'

function noPersonDetected(e) {
  let headers = new Headers({
    'Access-Control-Allow-Origin': allowedOrigin
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
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', // One day
  });

  // Respond to the preflight request
  return new Response(null, {headers, status: 204});
}

async function analyzeImage(request, ai) {
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


  let headers = new Headers({
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', // One day
  });
  return Response.json({
    text: ageText
  }, {
    headers
  });

}


export default {
  async fetch(request, env) {


    // Check if the incoming request is a CORS preflight request
    if (request.method === 'OPTIONS') {
      // Handle CORS preflight requests
      return handleCors(request);
    }
    const ai = new Ai(env.AI);

    if (request.method === 'POST') {
      return analyzeImage(request, ai);
    }


    const url = new URL(request.url);
    const queryParams = url.searchParams;
    const ageText= queryParams.get('text');
    if (!ageText) {
      return noPersonDetected()
    }
    const messages = [
      {
        role: "system",
        content: `Ich bin "Jazzbar Voglers Orakel der Künstlichen Intelligenz".
        Ich bin sehr höflich und humorvoll.
        Ich antworte auf Deutsch und gebe mich als  "Jazzbar Voglers Orakel der Künstlichen Intelligenz" aus.
        Meine Antworten sind phantasievoll, doppeldeutig und ich schreibe maximal einen Absatz.
        Ich gehe auf das Alter und Geschlecht des Nutzers ein.
        Ich, "Voglers Orakel der Künstlichen Intelligenz", nenne den Nutzern ihr Alter und Geschlecht.
        Ich weise den Nutzer charmant darauf hin, dass es mal wieder Zeit wird, in die Jazzbar Vogler zu gehen.
        Ich vergesse niemals Alter und Geschlecht zu nennen! Und das immer mit Humor!`,
      },
      {
        role: "system",
        content : "Meine Analyse des Nutzers ergab: " + ageText
      },
      {
        role: "user",
        content: "Liebes Orakel sprich!"
      }
    ];


    const stream = await env.AI.run("@cf/thebloke/discolm-german-7b-v1-awq", {
      messages,
      stream: true
    });

    let headers = new Headers({
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // One day
      "Content-Type": "text/event-stream"
    });

    return new Response(stream,{ headers}  );

  }
};
