import axios from 'axios';
export default class HunmaAI {

    constructor() {
        this.url = "https://www.twinword.com/api/";
        this.rest = require("unirest");
    }

    isStr(value)  {
        if (value == null || value == "")
            return false; 
    
       return true; 
    }

    contains(string,  value) {
       return string.includes(value);
    }

    
    //Detect human text meaning using the given text.
    //Topics,  sentiment
    detectHumanAI(url, q, cb)  {
       var self = this;

       axios({
         method: 'post',
         url: url,
         data: q,
         headers: {"Content-Type": "application/x-www-form-urlencoded"}
       }).then((response) => {
         if (response.error) {
            console.log("ERROR: "+  response.error);
            cb(response, null);
         }
         else {
            var body = response.data;
            if (self.isStr(body)) {
                body = self.getJSON(body);
                
                if (body.result_msg == "Success") {
                    return cb(response, body);
                }
            }
            cb(response, "gg");
        }
       }, (error) => {
         cb(response, "failed ");
       });
  }

  //Return sentiment analysis results with score for the given text.
  //get possibility of a text either positive or negative 
  getWordAISentiment(q, cb)  {
      this.detectHumanAI(this.url+"v4/sentiment/analyze/", "text="+ q, cb);
  }

   //Detect and generate human like topics to the given text.
  getWordAITopic(q, cb)  {
      this.detectHumanAI(this.url+"v4/word/associations/", "entry="+ q, cb);
  }

   //Get word associations with semantic distance score.
  getAIWordAssociations(q, cb)  {
      this.detectHumanAI(this.url+"v5/topic/generate/", "text="+ q, cb);
  }

  getAll(q, cb) {
      var self = this;
      var result = {"type":"all"};
      this.getWordAISentiment(q, function(response, sentiment) {
        self.getWordAITopic(q, function(response, topic) {
            self.getAIWordAssociations(q, function(response, associations) {
               //cb(response, topic);
               result["topic"] = topic;
               result["sentiment"] = sentiment;
               result["associations"] = associations;   
               cb(response, result);
            });
        });
      });
  }

  getJSON(json) {
    if (!(json instanceof Object) && json.startsWith("{")) {
        try {
           return JSON.parse(json);
        } catch(e) {
          return json;
        }
    } else {
        return json;
    }
 }
 
 customStringify(v) {
    const cache = new Set();
    return JSON.stringify(v, function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          try {
            return JSON.parse(JSON.stringify(value));
          } catch (err) {
            return;
          }
        }
        cache.add(value);
      }
      return value;
    });
  };
}