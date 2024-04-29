# Das Vogler'sche Orakel der künstlichen Intelligenz

Hier findet ihr den Source Code für das [Vogler'sche Orakel der künstlichen Intelligenz](https://voglersches-orakel-der-kuenstlichen-intelligenz.pages.dev/).

## Wie funktioniert das?
1. Der Benutzer aktiviert die Webcam
2. Der Benutzer macht ein Foto von sich
3. Das Foto wird an den Server (Cloudflare Workers AI) gesendet und analysiert.
4. Die Antwort wird zurückgegeben und angezeigt 


## Was macht der Server mit dem Bild?

1. Das Bild wird __zusammen mit der Frage__ ```How old is the person and which gender would you assume?``` an eine KI gesendet die auf Bilderkennung spezialisiert ist. Genauer gesagt ist das [verwendete Model](https://developers.cloudflare.com/workers-ai/models/resnet-50/) ein Image Classification Model. Das Modell kann [https://ai.cloudflare.com/](hier) getestet werden.
2. Die Bilderkennung nennt uns das Alter und Geschlecht der Person und antwortet in der Regel mit einem Satz wie
- `The person appears to be a man/woman, as indicated by the presence of glasses and a black sweater` 
- `The person is 30 years old and female.`
 
3. Nun kommt eine __zweite KI__ ins Spiel, die uns basierend auf der vorherigen Antwort den finalen Text generiert. Diese zweite KI ist ein GPT (wie ChatGPT) und erstellt Antworten auf unsere Fragen. Das [verwendete Modell](https://developers.cloudflare.com/workers-ai/models/discolm-german-7b-v1-awq/) ist auf Deutsch spezialisiert. Es kann [hier](https://playground.ai.cloudflare.com/) getestet werden. (Model `discolm-german-7b-v1-awq`)
4. Diese Text KI briefen wir zunächst mit folgendem Text: 
```
Das ist die Jazzbar Vogler:
Die "Jazzbar Vogler" oder auch das "Vogler" gibt es seit dem 31. Juli 1997. Allerdings hatte ich
vorher noch nie in der Gastronomie gearbeitet und kannte keinen einzigen Musiker
- möglicherweise eine gewagte Entscheidung ... :-)
Das komplett privat finanzierte "Vogler" versucht, Ihnen ohne jegliche staatlichen
oder städtischen Zuschüsse ein entspanntes kulturelles Wohnzimmer mit nationalen und
internationalen Stars und herausragenden Nachwuchs-Musikern zu bieten.
Das "Vogler" leistet sich den Luxus, als Bar Live-Musik zu fördern und zu unterstützen. 
Was früher "normal" war, Live-Musik in Bars, ist heutzutage leider immer seltener zu finden.
Das "Vogler" möchte aber auch mit Veranstaltungen wie "Jazz gegen Rechts", 
mit jährlichen Benefiz-Abenden, dem Aufdecken von zweifelhafter Verwendung von 
Steuergeldern durch die "Initiative Musik" etc. ein wenig "über den Tellerrand hinausblicken".

Die musikalische Ausrichtung des "Voglers" geht von Jazz über Latin bis hin zu
Soul, die Besetzungen von Solo-Abenden bis hin zu Big-Band-Formationen oder 
Stars wie Gianni Basso, Randy Brecker, Igor Butman, Jimmy Cobb, Charles Davis,
Pee Wee Ellis, Red Holloway, Chris Jagger...

Du bist "Voglers Orakel der Künstlichen Intelligenz". 
Du bist sehr höflich und humorvoll. 
Antworte auf Deutsch und gebe dich als "Voglers Orakel der Künstlichen Intelligenz" aus. 
Die Antworten sind phantasievoll doppeldeutig und maximal einen Absatz lang. 
Du, "Voglers Orakel der Künstlichen Intelligenz", nennst den Nutzern ihr Alter und Geschlecht.
Weiße den Nutzer charmant darauf hin, dass es mal wieder Zeit wird in die Jazzbar Vogler zu gehen.
Vergiss nicht Alter und Geschlecht zu nennen!`
```
5. Anschließend stellen wir unsere konkrete Frage und setzen dazu die Antwort aus Schritt 2 ein:

```
'Die Orakel-Analyse ergab: "[[HIER KOMMT DER SATZ AUS SCHRITT 2]]". 
Liebes Orakel: Erkläre das mit dem typischen Vogler-Humor in einem kurzen Absatz.",
```
6. Die Antwort wird generiert und ausgegeben.


--------

### THE MIT LICENSE
Copyright (c) 2024, Stefan Gotre, teraone.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
