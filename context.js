const varsToUpdateBeforeWatson = {
  /*variableName: {
    value: false OR value, //Set a particular value on every call, set to false to ignore this field.
    forceIfUndefined: true, //If the context variable does not exist yet, tells if it should be created
    function: function(answerText, context, key) { //Different sets of actions depending on the answerText, can access the whole context, must not update context. @return the new context[key] value.
      return new_context[key]_value;
    }
  }*/
};
const varsToUpdateAfterWatson = {
  noCommande: {
    value: false, //Set a particular value on every call, set to false to ignore this field.
    forceIfUndefined: true, //If the context variable does not exist yet, tells if it should be created
    function: function(answerText, context, key) { //Different sets of actions depending on the answerText, can access the whole context, must not update context. @return the new context[key] value.
      var returnValue = 0;
      if (answerText.indexOf('Tout est bon pour vous ?') !== -1) {
        returnValue = Math.floor(Math.random() * 175000 + 100000); //context[key] + 1;
      } else if (context[key] !== returnValue) {
        returnValue = context[key];
      }
      return returnValue;
    }
  }
};
module.exports = {
  /**
   * Returns context before it's sent to Watson Conversation API.
   * The rules to update variables are in the static array varsToUpdateBeforeWatson.
   * @param   inMemoryContext     current context
   * @param   messageText         user text message
   * @return  inMemoryContext     modified context
   */
  setContextToWatson: function(inMemoryContext, messageText) {
    if (Object.keys(varsToUpdateBeforeWatson).length !== 0) {
      for (key in varsToUpdateBeforeWatson) {
        var currentUpdate = varsToUpdateBeforeWatson[key];
        if (typeof inMemoryContext[key] !== 'undefined' || currentUpdate.forceIfUndefined) {
          if (currentUpdate.value !== false && currentUpdate.value !==
            inMemoryContext[key]) {
            inMemoryContext[key] = currentUpdate.value;
          } else if (currentUpdate.function !== false) {
            inMemoryContext[key] = currentUpdate.function(messageText,
              inMemoryContext, key);
          }
        }
      }
    }
    return inMemoryContext;
  },
  /**
   * Updates context after it has been returned from Watson Conversation API.
   * The rules to update variables are in the static array varsToUpdateAfterWatson.
   * @param   watsonUpdate        return from Watson Conversation API which contains output, context, and all sorts of data.
   */
  setContextAfterWatson: function(watsonUpdate) {
    if (Object.keys(varsToUpdateAfterWatson).length !== 0) {
      for (key in varsToUpdateAfterWatson) {
        var currentUpdate = varsToUpdateAfterWatson[key];
        if (typeof watsonUpdate.context[key] !== 'undefined' ||
          currentUpdate.forceIfUndefined) {
          if (currentUpdate.value !== false && currentUpdate.value !==
            watsonUpdate.context[key]) {
            watsonUpdate.context[key] = currentUpdate.value;
          } else if (currentUpdate.function !== false) {
            watsonUpdate.context[key] = currentUpdate.function(watsonUpdate
              .output.text, watsonUpdate.context, key);
          }
        }
      }
    }
  }
}
