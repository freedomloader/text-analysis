import {ai, func, mfunc} from '..';
import * as Request from '../ai';

const search = async (req, res) => {
   let result = false;
   try {
     let q = req.query.q.trim().toLowerCase();
     let qs = q;
     result = (qs = func.isSearchApp(qs)) ? Request.getapp(req, res, qs) : false;
    
     result = isfalse(result) && (qs = func.isSearchQuiz(q)) ? Request.question(req, res, qs) : result;
     result = isfalse(result) && (qs = func.isSearchJokes(q)) ? Request.joke(req, res, qs) : result;
     result = isfalse(result) && (qs = mfunc.isSearchMusic(q)) ? Request.music(req, res, qs) : result;
     result = isfalse(result) && (qs = mfunc.isSearchMovie(q)) ? Request.music(req, res, qs) : result;
     result = isfalse(result) ? getAnalysisFunctions(req, res, q) : null;
     
    } catch (error) {
      if (!result)
        return res.status(500).send(error.stack);
    }
  };

  function getAnalysisFunctions(req, res, q) {
    const isSearchAITopic = null;//ai.getAnalysisFunction(qs);
      
    return func.isStr(isSearchAITopic) ?
    ai.loadSearchAITopic(q, null) :
    Request.wiki(req, res, q)
  }

  function isfalse(value) {
    return value == false;
  }

export default search;
