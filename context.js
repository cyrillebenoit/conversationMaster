const varsToUpdateBeforeWatson = {
  /*nbErrors2: {
    value: false,
    forceIfUndefined: true,
    function: function(answerText, context, key) {
      //Different sets of actions depending on the answerText, can access the whole context, should only update conntext[key]
      return context[key] * 2;
    }
  }*/
};
const varsToUpdateAfterWatson = {
  /*nbErrors2: {
    value: false,
    forceIfUndefined: false,
    function: function(answerText, context, key) {
      //Different sets of actions depending on the answerText, can access the whole context, should only update conntext[key]
      return context[key] + 1;
    }
  }*/
  noCommande: {
    value: false,
    forceIfUndefined: true,
    function: function(answerText, context, key) {
      //Different sets of actions depending on the answerText, can access the whole context, should only update conntext[key]
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
