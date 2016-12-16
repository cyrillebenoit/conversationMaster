const varsToUpdateBeforeWatson = {
  /*nbErrors: {
    value : 0,
    function: function(messageText, context, key) {
      //Different sets of actions depending on the messageText, can access the whole context, should only update conntext[key]
      return context[key]*2;
    }
  }*/
};

const varsToUpdateAfterWatson = {
  /*nbErrors: {
    value : 0,
    function: function(answerText, context, key) {
      //Different sets of actions depending on the answerText, can access the whole context, should only update conntext[key]
      return context[key]*2;
    }
  }*/
};

module.exports = {

  setContextToWatson : function(inMemoryContext, messageText){
    if(Object.keys(varsToUpdateBeforeWatson).length === 0)
      return inMemoryContext;

    for(key in varsToUpdateBeforeWatson) {
      inMemoryContext[key]=varsToUpdateBeforeWatson[key];
      var currentUpdate = varsToUpdateBeforeWatson[key];
      if(currentUpdate.value && typeof inMemoryContext[key] !== 'undefined') {
        inMemoryContext[key] = currentUpdate.value;
      }else if(currentUpdate.function && typeof inMemoryContext[key] !== 'undefined') {
        inMemoryContext[key] = currentUpdate.function(messageText, inMemoryContext, key);
      }
    }
    return inMemoryContext;
  },

  setContextAfterWatson : function(watsonUpdate){
    if(Object.keys(varsToUpdateAfterWatson).length !== 0){
      for(key in varsToUpdateAfterWatson) {
        var currentUpdate = varsToUpdateAfterWatson[key];
        if(currentUpdate.value && typeof watsonUpdate.context[key] !== 'undefined') {
          watsonUpdate.context[key] = currentUpdate.value;
        }else if(currentUpdate.function && typeof watsonUpdate.context[key] !== 'undefined') {
          watsonUpdate.context[key] = currentUpdate.function(watsonUpdate.output.text, watsonUpdate.context, key);
        }
      }
    }
  }

}
