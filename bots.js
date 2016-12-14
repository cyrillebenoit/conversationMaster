'use strict'

const Botmaster = require('botmaster');
const watson = require('watson-developer-cloud');
const cfenv = require('cfenv');
const Buttons = require('./buttons')
const Stickers = require('./stickers')

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
  webhookEndpoint: process.env.MESSENGER_WEBHOOKENDPOINT,
};
/*
 * Where the actual code starts. This code is actually all that is required
 * to have a bot that works on the various different channels and that
 * communicates with the end user using natural language (from Watson Conversation).
 * If a conversation is properly trained on the system, no more code is required.
 */
const botsSettings = [{
  telegram: telegramSettings
}, {
  messenger: messengerSettings
}];

const express = require('express');
const bots = express();
const bodyParser = require('body-parser');

bots.use(bodyParser.json());
bots.use(bodyParser.urlencoded({
  extended: true
}));

const botmasterSettings = {
  botsSettings,
  app: bots,
    port: appEnv.isLocal ? 3000 : appEnv.port,
};

const botmaster = new Botmaster(botmasterSettings);

const inMemoryContexts = {};

botmaster.on('update', (bot, update) => {

  /*if (inMemoryContexts[update.sender.id]) {
    if(!inMemoryContexts[update.sender.id].nodesVisited)
      inMemoryContexts[update.sender.id].nodesVisited = {};
    if (!inMemoryContexts[update.sender.id].bubbleAmount) {
      inMemoryContexts[update.sender.id].bubbleAmount = 0;
    }
    inMemoryContexts[update.sender.id].bubbleAmount++;
    inMemoryContexts[update.sender.id].nbNodes = Object.keys(inMemoryContexts[update.sender.id].nodesVisited).length+1;
  }*/

  const context = inMemoryContexts[update.sender.id]; // this will be undefined on the first run
  var messageForWatson = {};
  if (update.message.text) {
    var input = JSON.stringify(update.message.text);
    //Remove quotation marks
    input = input.substring(1, input.length - 1);
    //Replace \n
    input = input.replace(/\\n/g, " ");
    messageForWatson = {
      context,
      workspace_id: process.env.WORKSPACE_ID,
        input: {
          text: input,
        },
    };
  }

  var delay = 1200;

  //THIS LINE READS THE USER INPUT (USEFUL TO DETERMINE STICKERS ID)
  //bot.sendTextMessageTo(String(JSON.stringify(update.message)),update.sender.id);

  if (update.message.sticker_id && Stickers.reactToStickers(update.message.sticker_id)) {
    var reaction = Stickers.reactToStickers(update.message.sticker_id);
    //Send is typing status...
    setTimeout(function() {
      bot.sendIsTypingMessageTo(update.sender.id);
    }, 250);

    //Support attachments
    if (reaction.attachment) {
      const message = {
        recipient: {
          id: update.sender.id,
        },
        message: {
          text: reaction.text
        },
        attachment: {
          type: "image",
          payload: {
            url: reaction.attachment
          }
        }
      };
      bot.sendMessage(message);
    } else {
      setTimeout(function() {
        bot.sendTextMessageTo(reaction.text, update.sender.id);
      }, delay);
    }
  } else {
    watsonConversation.message(messageForWatson, (err, watsonUpdate) => {
      //This type of process allows us to alterate the context of watson conversation from the outside.
      //These lines in particular were replaced, inside WC, by an unique counter increased each time the user imput was not recognized well.
      /*if(watsonUpdate.output.nodes_visited){
        if(watsonUpdate.context.nodesVisited){
          if(watsonUpdate.output.nodes_visited[0] && !watsonUpdate.context.nodesVisited[watsonUpdate.output.nodes_visited[0]] ) {
            watsonUpdate.context.nodesVisited[watsonUpdate.output.nodes_visited[0]]=1;
          }
        }
      }*/
      inMemoryContexts[update.sender.id] = watsonUpdate.context;
      for (var i = 0; i < watsonUpdate.output.text.length; i++) {
        const text = watsonUpdate.output.text[i];
        setTimeout(function() {
          bot.sendIsTypingMessageTo(update.sender.id);
        }, delay * i + 250);
        setTimeout(function() {
          var buttons = [];
          if (buttons = Buttons.sendWithButtons(text)) {
            bot.sendDefaultButtonMessageTo(buttons, update.sender.id,
              text);
          } else {
            bot.sendTextMessageTo(text, update.sender.id);
          }
        }, delay * (i + 1));
      }
    })
  }
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
