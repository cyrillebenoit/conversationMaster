'use strict'

const Botmaster = require('botmaster');
const watson = require('watson-developer-cloud');
const cfenv = require('cfenv');

// get the app environment from Cloud Foundry
const appEnv = cfenv.getAppEnv();


const watsonConversation = watson.conversation({
  username: process.env.WATSON_CONVERSATION_USERNAME,
  password: process.env.WATSON_CONVERSATION_PASSWORD,
  version: 'v1',
  version_date: '2016-05-19',
});

const telegramSettings = {
  credentials: {
    authToken: process.env.TELEGRAM_AUTH_TOKEN,
  },
  webhookEndpoint: process.env.TELEGRAM_WEBHOOKENDPOINT,
};

const messengerSettings = {
  credentials: {
    verifyToken: process.env.MESSENGER_VERIFY_TOKEN,
    pageToken: process.env.MESSENGER_PAGE_TOKEN,
    fbAppSecret: process.env.MESSENGER_APP_SECRET,
  },
  webhookEndpoint: '/webhook1234/',
};
/*
* Where the actual code starts. This code is actually all that is required
* to have a bot that works on the various different channels and that
* communicates with the end user using natural language (from Watson Conversation).
* If a conversation is properly trained on the system, no more code is required.
*/
const botsSettings = [{ telegram: telegramSettings },
                      { messenger: messengerSettings }];

const express = require('express');
const bots = express();
const bodyParser = require('body-parser');

bots.use(bodyParser.json());
bots.use(bodyParser.urlencoded({ extended: true }));

const botmasterSettings = {
  botsSettings,
  app : bots,
  port: appEnv.isLocal ? 3000 : appEnv.port,
};

const botmaster = new Botmaster(botmasterSettings);

const inMemoryContexts = {};

botmaster.on('update', (bot, update) => {
  const context = inMemoryContexts[update.sender.id]; // this will be undefined on the first run
  const messageForWatson = {
    context,
    workspace_id: process.env.WORKSPACE_ID,
    input: {
      text: update.message.text,
    },
  };

  var delay = 1200;

  watsonConversation.message(messageForWatson, (err, watsonUpdate) => {
    inMemoryContexts[update.sender.id] = watsonUpdate.context;
    for(var i = 0; i < watsonUpdate.output.text.length; i++) {
      const text = watsonUpdate.output.text[i];
      setTimeout(function () {
        bot.sendIsTypingMessageTo(update.sender.id);
      }, delay*i+250);
      setTimeout(function () {
        bot.sendTextMessageTo(text, update.sender.id);
      }, delay*(i+1));
    }
  })
});

botmaster.on('error', (bot, err) => {
  console.log(err.stack);
});
/*
*
* Where the actual code stops. The rest is boilerplate.
*
*/

module.exports = bots;
