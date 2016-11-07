'use strict'

const Botmaster = require('botmaster');
const watson = require('watson-developer-cloud');
const cfenv = require('cfenv');

// get the app environment from Cloud Foundry
const appEnv = cfenv.getAppEnv();

const smallThumbID = 369239263222822;
const bigThumbID   = 369239343222814;
const hugeThumbID   = 369239383222810;

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

  var input = JSON.stringify(update.message.text);
  //Remove quotation marks
  input = input.substring(0, input.length - 1).substring(1);
  //Replace \n
  input = input.replace(/\\n/g," ");
  const messageForWatson = {
    context,
    workspace_id: process.env.WORKSPACE_ID,
    input: {
      text: input,
    },
  };

  var delay = 1200;

  //bot.sendTextMessageTo(String(JSON.stringify(update.message)),update.sender.id);

  if(update.message.sticker_id == smallThumbID || update.message.sticker_id == bigThumbID || update.message.sticker_id == hugeThumbID) {
    //Send is typing status...
    setTimeout(function () {
      bot.sendIsTypingMessageTo(update.sender.id);
    }, 250);

    //Answer depending on the thumb size
    if(update.message.sticker_id == smallThumbID) {
      setTimeout(function () {
        bot.sendTextMessageTo("Oh, c'est tout ? Je m'attendais à plus de satisfaction de votre part...",update.sender.id);
      }, delay);
    }
    else if(update.message.sticker_id == bigThumbID){
      setTimeout(function () {
        bot.sendTextMessageTo("On avance mais je suis certain que vous pouvez faire mieux ! Encore un petit effort...",update.sender.id);
      }, delay);
    }

    else {
      const message = {
        recipient: {
          id: update.sender.id,
        },
        message: {
          text: 'Ah ! Je vous remercie ! Vous aussi vous êtes au top !'
        }
        //These lines are supposed to join the thumb sent by the user, but for some reason it just does not appear.
        /*,
        attachment:{
          type:"image",
          payload:{
            url:update.message.attachments[0]['payload']['url'],
          }
        }*/
      };
      setTimeout(function () {
        bot.sendMessage(message);
      }, delay);
      /*setTimeout(function () {
        bot.sendAttachmentFromURLTo('image', update.message.attachments[0]['payload']['url'], update.sender.id);
      }, delay + 200);*/
    }
  }
  else {
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
      for(var i = 0; i < watsonUpdate.output.text.length; i++) {
        const text = watsonUpdate.output.text[i];
        setTimeout(function () {
          bot.sendIsTypingMessageTo(update.sender.id);
        }, delay*i+250);
        setTimeout(function () {
          if(text.indexOf("offres Play, Zen, et Jet ") !== -1 || text == "Avec les offres Fibre d'Orange, vous avez la garantie d'un service jusqu'à 30 fois plus rapide que l'ADSL, et d'une stabilité à toute épreuve !\n\nMerci de choisir parmi les offres Play, Zen, et Jet."){
            bot.sendDefaultButtonMessageTo(['Zen','Play','Jet'],update.sender.id, text);
          }
          else if(text.indexOf("par oui ou non") !== -1 || text.indexOf("Voulez-vous ") !== -1
                  || text.indexOf("Avez-vous ") !== -1 || text.indexOf("Tout est bon pour vous") !== -1
                  || text.indexOf("vous préférez peut-être télé") !== -1){
            bot.sendDefaultButtonMessageTo(['Oui','Non'],update.sender.id, text);
          }
          else if(text.indexOf("Vous pouvez modifier votre offre") !== -1) {
            bot.sendDefaultButtonMessageTo(['Adresse','Identité','Offre','Options TV','Moyen de paiement'],update.sender.id, text);
          }
          else if(text.indexOf("Nous proposons deux bouquets") !== -1) {
            bot.sendDefaultButtonMessageTo(['Canal+','CanalSat','Les deux'],update.sender.id, text);
          }
          else {
            bot.sendTextMessageTo(text,update.sender.id);
          }
        }, delay*(i+1));
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
