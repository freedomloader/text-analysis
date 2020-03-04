 import '@babel/polyfill'
 import express from 'express'
 import HunmaAI from './ai_search/ai_human';
 const http = require('http');

 const app = express();
 app.use(express.json());
 require('dotenv').config();

 const port = 3020;
 app.get('/', (req, res) => {
    if (!req.query.text) {
        const noresult = {'type':'No Request', 'count':'0'};
        return res.status(400).send(noresult);
    }

    const ai = new HunmaAI();
    ai.getAll(req.query.text, function(response, result) {
        if (result) {
           return res.status(200).send(result);
        }
        
        const noresult = {'type':'No Result found', 'count':'0'};
        return res.status(400).send(noresult);
    });
 });
 
 
 app.set('port', port);
 const server = http.createServer(app);
 server.listen(port, () => {
   console.log(`App listening on PORT ${port}`);
 });