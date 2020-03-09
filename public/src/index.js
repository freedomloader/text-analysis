//import '@babel/polyfill'
var HunmaAI = require("./ai-server/ai_human");
var analysis = require("./ai-server/analysis");

const loadAnalysis = async (req, res) => {
  const ai = new HunmaAI();
  try {
    if (!req.query.text) {
      // ejs render automatically looks in the views folder
      res.render("index");
      //const noresult = { type: "No Request", count: "0" };
      return;//res.status(400).send(noresult);
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