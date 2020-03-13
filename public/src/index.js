const fs = require("fs");
const path = require("path");
const util = require("util");
const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
var HunmaAI = require("./ai-server/ai_human");
var analysis = require("./ai-server/analysis");

const loadAnalysis = async (req, res) => {
  const ai = new HunmaAI();
  try {
    if (!req.query.text) {
      res.render("index");
      return;
    }
    if (req.query.format) {
      return await loadWebAnalysis(req, res);
    }

    const result = await ai.getMain(req.query.text, true);
    if (result) {
      const new_result = await analysis(req.query.text, result);
      return res.status(200).send(new_result);
    } else {
      const noresult = { type: "No Result found", count: "0" };
      return res.status(400).send(noresult);
    }
  } catch (error) {
    return res.status(500).send({ error: error ? error.stack : null });
  }
};

const loadWebAnalysis = async (req, res) => {
  const ai = new HunmaAI();
  try {
    const eventText = req.query.text;
    const result = await ai.getMain(eventText, true);

    if (result) {
      const new_result = await analysis(eventText, result);
      const csvFile = await jsonToCSV(res, new_result);
      await loadCSV(req, res, csvFile);
    } else {
      return res.status(400).send(null);
    }
  } catch (error) {
    return res.status(500).send({ error: error ? error.stack : null });
  }
};

const readFile = util.promisify(fs.readFile);
async function loadCSV(req, res, file) {
  const data = await readFile(file, "utf8");
  if (req.query.format) {
    const type = req.query.format;
    if (type === "file") {
      return res.sendFile(file);
    }
  }
  res.status(200).send(data);
}

async function csvToJSON(csvFile) {
  let textrow = "";
  await fs
    .createReadStream(csvFile)
    .pipe(csv())
    .on("data", row => {
      textrow += row;
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
      return textrow;
    });
}

async function jsonToCSV(res, data) {
  const csvWriter = createCsvWriter({
    path: "./views/csv/eventout.csv",
    header: [
      { id: "Event", title: "Event" },
      { id: "YearMonth", title: "YearMonth" },
      { id: "Actual Date", title: "Actual Date" },
      { id: "Time", title: "Time" },
      { id: "Address", title: "Address" },
      { id: "Subject", title: "Subject" }
    ]
  });

  let csvFile;
  let new_data = [];
  new_data.push(data);

  const result = await csvWriter.writeRecords(new_data).then(() => {
    csvFile = path.resolve("./views/csv/eventout.csv");
    console.log("The CSV file was written successfully");
  });

  return csvFile;
}

const data = {
  loadCSV: loadCSV,
  csvToJSON: csvToJSON,
  jsonToCSV: jsonToCSV,
  loadAnalysis: loadAnalysis,
  loadWebAnalysis: loadWebAnalysis
};
module.exports = data;
