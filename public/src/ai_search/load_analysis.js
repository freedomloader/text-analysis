var HunmaAI = require("./ai_human");
var analysis = require("./analysis");

const loadAnalysis = async (req, res) => {
  const ai = new HunmaAI();
  try {
    if (!req.query.text) {
      const noresult = { type: "No Api Request", count: "0" };
      return res.status(400).send(noresult);
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

module.exports = loadAnalysis;
