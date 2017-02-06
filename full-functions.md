# Context (context.js)

You can find 2 arrays in **context.js** :
+ varsToUpdateBeforeWatson
+ varsToUpdateAfterWatson

Both work the same way, but obviously, one is used before Watson Conversation gets the message, and one occurs after it answered.

*Here is an example of entry in varsToUpdateAfterWatson. It is used to generate an order number for the user after Watson said a certain text. The function has access to the whole context, and will return the new value of context[key] (so if the text you're looking for isn't present, just return the current value)*
```javascript
orderNumber: {
  value: false,
  forceIfUndefined: true,
  function: function(message, context, key) {
    var returnValue = 0;
    if(message.indexOf('Everything is ready for me, what about you ?') !== -1) {
      //Here is the actual important part. That's where you want to fetch certain data/values from third-party APIs eventually.
      returnValue = Math.floor(Math.random() * 175000 + 100000);
    }
    else if(context[key] !== returnValue) {
      returnValue = context[key];
    }
    return returnValue;
  }
}
```
*Note that you can make much more complex conditions depending on many factors from context for example.*

The value field is there to make sure a certain variable is always the same.
Set forceIfUndefined to true to force the creation of the variable in Context if nonexistent.

**Caution** :
+ in *varsToUpdateBeforeWatson*, the message in the function is from **user**.
+ in *varsToUpdateAfterWatson*, the message in the function is from **Watson**.

# Entities (input.js)

Watson Conversation service is really good for detecting Intents, but Entities are purely and simply search and replace. So I decided to allow us, developers, to do it from the outside, to eventually improve on this search and detect more data than Conversation can see from APIs like Alchemy or WKS.

Currently, the input.js file contains an array *key : value* where every instance of key (case insensitive) is replaced by value.

# Variables (output.js)

Finally, another important but simple file is **output.js** who makes it much easier to display promotions for instance (replace a price tag with another one without having to dig in the dialog and replace it everywhere at the beginning and at the end of the promotion)


##How to update your app if you forked this repository

As you might have noticed, when deploying this app in Bluemix, environmental variables are set to UNDEFINED so you can easily see what's missing for the initial setup.

But if you want to update the code and push it through CLI for instance, you should not use the manifest file as it is, because it will override your variables and you'll have to do the setup process again.

**Two** options are possible :
-  Replace `app_name` with your Bluemix app name in the *manifest1.yml*. Then push your code to Bluemix with `sudo cf push -f manifest1.yml` (assuming you're in the right directory)
-  Erase the env part in the manifest.yml so `sudo cf push` will not replace them.
