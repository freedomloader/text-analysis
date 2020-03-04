export default class TopicSentiment {

    constructor(db) {
        this.db = db;
    }

    loadSearchAI(qs, cb)  {
        var start = db.microtime(true);
    
        ai.loadAITopic(q, function(response, sentiment) {
            ai.loadAISentiment(q, function(response, topic) {
                var result = {"type":"all"};
                result["topic"] = topic;
                result["sentiment"] = sentiment;
                result['time_elapsed'] = db.microtime(true) - start;
            });
        });
     }

     loadAITopic(qs, cb)  {
        ai.getWordAITopic(q, function(response, topic) {
            cb(response, topic);
        });
     }

     loadAISentiment(qs, cb)  {
        ai.getWordAISentiment(q, function(response, sentiment) {
            cb(response, sentiment);
        });
     }
}