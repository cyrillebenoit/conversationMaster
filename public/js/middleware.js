'use strict';

const watson = require('watson-developer-cloud');

class WatsonConversationMiddleware {
  constructor(settings) {
    this.watsonConversation = watson.conversation(settings);
    this.inMemoryContexts = {};
  }

  attach(bot, update) {
    update.context = this.inMemoryContexts[update.sender.id];
  }
}

module.exports = WatsonConversationMiddleware;