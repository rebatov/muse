const fs = require("fs");
const http = require("https");
const { URL, API, FILEPATH } = require("./config");
const keysAndScales = {
  keys: [...Array(12).keys()],
  namedKeys: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  scales: [...Array(12).keys()],
  namedScales: [
    "Major",
    "Minor",
    "7th",
    "5th",
    "dim",
    "dim7th",
    "aug",
    "sus2",
    "sus4",
    "maj7th",
    "min7th",
    "7thsus4",
  ],
  // namedScales = ['Major','Minor','7','5','dim','dim7','aug','sus2','sus4','maj7','m7','7sus4','maj9','maj11','maj13','maj9#11','maj13#11add96add9maj7b5maj7#5m6m9m11m13madd9m6add9mmaj7mmaj9m7b5m7#56911137b57#57b97#97(b5,b9)7(b5,#9)7(#5,b9)7(#5,#9)9b59#513#1113b911b9sus2sus4-5]
};
let jsonArray = [];


const getData = (key, scale, index) =>
  new Promise((resolve, reject) => {
    const path = `${URL}${API}${key}/${scale}`;

    console.log("============================================================");
    console.log(`Fetching: ${path} \n`);
    console.time("Time elapsed: ");

    http
      .get(path, function (res) {
        var body = "";
        res.on("data", function (chunk) {
          body += chunk;
        });
        res.on("end", function () {
          console.log(body);
          resolve(body);
          keyIdx = index[0];
          scaleIdx = index[1];

          const output = {
            keyName: keysAndScales.namedKeys[keyIdx],
            scaleName: keysAndScales.namedScales[scaleIdx],
            results: JSON.parse(body).results,
          };
          jsonArray.push(output);
          console.log(`Fetched: ${path} \n`);
          console.timeEnd("Time elapsed: ");
        });
      })
      .on("error", function (e) {
        console.log("Got error: " + e.message);
        reject(err);
      });
  });

const runLoop = async () => {
  for (const [key, keyIdx] of keysAndScales.keys.entries()) {
    for (const [scale, scaleIdx] of keysAndScales.scales.entries()) {
      await getData(key, scale, [keyIdx, scaleIdx]);
      if (
        keyIdx == keysAndScales.keys.length - 1  &&
        scaleIdx == keysAndScales.scales.length - 1
      ) {
        fs.writeFileSync(FILEPATH, JSON.stringify(jsonArray, null, 2));
      }
    }
  }
};

runLoop();
