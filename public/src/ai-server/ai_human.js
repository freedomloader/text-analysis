var axios = require("axios");
var data = require("./analysisdata");

module.exports = class HunmaAI {
  constructor() {
    this.url = "https://www.twinword.com/api/";
    this.rest = require("unirest");
  }

  isStr(value) {
    if (value == null || value == "") return false;

    return true;
  }

  contains(string, value) {
    return string.includes(value);
  }

  async detectHumanAI(url, q) {
    /*const response = await this.unirest.post(url)
        .headers({"Content-Type": "application/x-www-form-urlencoded"})
        .send(q);*/
    let response = await axios({
      url: url,
      data: q,
      method: "post",
      timeout: 8000,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    if (response.error) {
      return { response: "response", result: null };
    } else {
      let body = response.data;
      if (this.isStr(body)) {
        //body = await this.getJSON(body);

        if (body.result_msg == "Success") {
          return { response: "response", result: body };
        }
      }
      return { response: "response", result: null };
    }
  }

  //retrieve the client's IP address
  //and return location using free active IP lookup services
  async getAddressLocation() {
    let response = await axios.get("http://ip-api.com/json"); //http://www.geoplugin.net/json.gp

    const body = response.data;
    if (body && body.status === "success") {
      return { response: "response", result: body };
    }
    return { response: "response", result: null };
  }

  //Return sentiment analysis results with score for the given text.
  //get possibility of a text either positive or negative
  async getWordAISentiment(q) {
    return await this.detectHumanAI(
      this.url + "v4/sentiment/analyze/",
      "text=" + q
    );
  }

  //Detect and generate human like topics to the given text.
  async getWordAITopic(q) {
    return await this.detectHumanAI(
      this.url + "v4/word/associations/",
      "entry=" + q
    );
  }

  //Get word associations with semantic distance score.
  async getAIWordLemma(q) {
    const params = new URLSearchParams();
    params.append("text", q);
    params.append("flag", "ALL_TOKENS_INVALID_EMPTY_STRING");
    params.append("exclude_non_content_words", "1");

    return await this.detectHumanAI(
      this.url + "v4/lemma/extract/",
      params.toString()
    );
  }

  //Get word associations with semantic distance score.
  async getAIWordAssociations(q) {
    return await this.detectHumanAI(
      this.url + "v5/topic/generate/",
      "text=" + q
    );
  }

  async getAll(q) {
    var result = { type: "all" };

    const sentiment = await this.getWordAISentiment(q);
    const topic = await this.getWordAITopic(q);
    const associations = await this.getAIWordAssociations(q);

    result["topic"] = await topic.result;
    result["sentiment"] = await sentiment.result;
    result["associations"] = await associations.result;
    return result;
  }

  async getMain(q, mWithAddress) {
    var result = { type: "all" };
    let address;

    try {
      let address = await this.getAddressLocation();
      const topic = await this.getWordAITopic(q);
      const lemma = await this.getAIWordLemma(q);

      result["curAddress"] = await address.result;
      result["topic"] = await topic.result;
      result["lemma"] = await lemma.result;

      result.topic.response;
    } catch (e) {
      result["topic"] = { response: await this.textToSplit(q) };
      result["lemma"] = { lemma: await this.checkUnnesessaryWords(q) };

      if (!result["curAddress"])
        result["curAddress"] = address ? await address.result : null;
    }

    if (mWithAddress) {
      var cities = require("../cities.json");
      const address = await cities;

      result["addresss"] = address;
    }
    return result;
  }

  async textToSplit(q) {
    let result = {};

    var arr = await q.split(" ");
    for (let i = 0; i < arr.length; i++) {
      let ss = arr[i];
      result[ss] = 1;
    }
    return result;
  }

  async checkUnnesessaryWords(text) {
    // Convert to lowercase
    text = text.toLowerCase();

    // replace unnesessary words.
    text = text.replace(/[^\w\d ]/g, "");
    var result = await text.split(" ");

    // remove commonWords from text
    result = await result.filter(function(word) {
      return data.commonWords.indexOf(word) === -1;
    });
    return result;
  }

  async getJSON(json) {
    if (!(json instanceof Object) && json.startsWith("{")) {
      try {
        return JSON.parse(json);
      } catch (e) {
        return json;
      }
    } else {
      return json;
    }
  }
};
