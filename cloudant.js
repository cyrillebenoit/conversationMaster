'use strict'
// The app owner may optionally configure a cloudand db to track user input.
// This cloudand db is not required, the app will operate without it.
// If logging is enabled the app must also enable basic auth to secure logging
// endpoints
var basicAuth = require('basic-auth-connect');
var uuid = require('uuid');
var vcapServices = require('vcap_services');
var cloudantCredentials = vcapServices.getCredentials('cloudantNoSQLDB');
var cloudantUrl = null;
const express = require('express');
const cloudant = express();
const bodyParser = require('body-parser');
cloudant.use(bodyParser.json());
cloudant.use(bodyParser.urlencoded({
  extended: true
}));
if (cloudantCredentials) {
  cloudantUrl = cloudantCredentials.url;
}
cloudantUrl = cloudantUrl || process.env.CLOUDANT_URL; // || '<cloudant_url>';
var logs = null;
module.exports = {
  app: cloudant,
  /**
   * Updates the response text using the intent confidence
   * @param  {Object} input The request to the Conversation service
   * @param  {Object} response The response from the Conversation service
   * @return {Object}          The response with the updated message
   */
  updateMessage: function(input, response) {
    var responseText = null;
    var id = null;
    if (!response.output) {
      response.output = {};
    } else {
      if (logs) {
        // If the logs db is set, then we want to record all input and responses
        id = uuid.v4();
        logs.insert({
          '_id': id,
          'request': input,
          'response': response,
          'time': new Date()
        });
      }
      return response;
    }
    if (response.intents && response.intents[0]) {
      var intent = response.intents[0];
      // Depending on the confidence of the response the app can return different messages.
      // The confidence will vary depending on how well the system is trained. The service will always try to assign
      // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
      // user's intent . In these cases it is usually best to return a disambiguation message
      // ('I did not understand your intent, please rephrase your question', etc..)
      if (intent.confidence >= 0.75) {
        responseText = 'I understood your intent was ' + intent.intent;
      } else if (intent.confidence >= 0.5) {
        responseText = 'I think your intent was ' + intent.intent;
      } else {
        responseText = 'I did not understand your intent';
      }
    }
    response.output.text = responseText;
    if (logs) {
      // If the logs db is set, then we want to record all input and responses
      id = uuid.v4();
      logs.insert({
        '_id': id,
        'request': input,
        'response': response,
        'time': new Date()
      });
    }
    return response;
  },
  saveLastMessage: function() {
    if (cloudantUrl) {
      // If logging has been enabled (as signalled by the presence of the cloudantUrl) then the
      // app developer must also specify a LOG_USER and LOG_PASS env vars.
      if (!cloudantCredentials.username || !cloudantCredentials.password) {
        throw new Error(
          'LOG_USER OR LOG_PASS not defined, both required to enable logging!'
        );
      }
      // add basic auth to the endpoints to retrieve the logs!
      var auth = basicAuth(cloudantCredentials.username,
        cloudantCredentials.password);
      // If the cloudantUrl has been configured then we will want to set up a nano client
      var nano = require('nano')(cloudantUrl);
      // add a new API which allows us to retrieve the logs (note this is not secure)
      nano.db.get('chatbot_logs', function(err) {
        if (err) {
          console.error(err);
          nano.db.create('chatbot_logs', function(errCreate) {
            console.error(errCreate);
            logs = nano.db.use('chatbot_logs');
          });
        } else {
          logs = nano.db.use('chatbot_logs');
        }
      });
      // Endpoint which allows deletion of db
      cloudant.post('/clearDb', auth, function(req, res) {
        nano.db.destroy('chatbot_logs', function() {
          nano.db.create('chatbot_logs', function() {
            logs = nano.db.use('chatbot_logs');
          });
        });
        return res.json({
          'message': 'Clearing db'
        });
      });
      // Endpoint which allows conversation logs to be fetched
      cloudant.get('/chats', auth, function(req, res) {
        logs.list({
          include_docs: true,
          'descending': true
        }, function(err, body) {
          console.error(err);
          // download as CSV
          var csv = [];
          csv.push(['Question', 'Intent', 'Confidence', 'Entity',
            'Output', 'Time'
          ]);
          body.rows.sort(function(a, b) {
            if (a && b && a.doc && b.doc) {
              var date1 = new Date(a.doc.time);
              var date2 = new Date(b.doc.time);
              var t1 = date1.getTime();
              var t2 = date2.getTime();
              var aGreaterThanB = t1 > t2;
              var equal = t1 === t2;
              if (aGreaterThanB) {
                return 1;
              }
              return equal ? 0 : -1;
            }
          });
          body.rows.forEach(function(row) {
            var question = '';
            var intent = '';
            var confidence = 0;
            var time = '';
            var entity = '';
            var outputText = '';
            if (row.doc) {
              var doc = row.doc;
              if (doc.request && doc.request.input) {
                question = doc.request.input.text;
              }
              if (doc.response) {
                intent = '<no intent>';
                if (doc.response.intents && doc.response.intents
                  .length > 0) {
                  intent = doc.response.intents[0].intent;
                  confidence = doc.response.intents[0].confidence;
                }
                entity = '<no entity>';
                if (doc.response.entities && doc.response.entities
                  .length > 0) {
                  entity = doc.response.entities[0].entity +
                    ' : ' + doc.response.entities[0].value;
                }
                outputText = '<no dialog>';
                if (doc.response.output && doc.response.output.text) {
                  outputText = doc.response.output.text.join(
                    ' ');
                }
              }
              time = new Date(doc.time).toLocaleString();
            }
            csv.push([question, intent, confidence, entity,
              outputText,
              time
            ]);
          });
          res.csv(csv);
        });
      });
    }
  }
};
