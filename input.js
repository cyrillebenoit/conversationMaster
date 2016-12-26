const tagsToReplace = {
  'Zen': 'OFFRE_1',
  'Play': 'OFFRE_2',
  'Jet': 'OFFRE_3',
  'Orange': 'OPERATEUR_PRINCIPAL',
  'Free': 'OPERATEUR_CONCURRENT',
  'Bouygues': 'OPERATEUR_CONCURRENT',
  'SFR': 'OPERATEUR_CONCURRENT',
  'B&You': 'OPERATEUR_CONCURRENT'
};
module.exports = {
  /**
   * Returns user input before it's sent to Watson Conversation API.
   * The rules to replace tags are set in the static array tagsToReplace.
   * @param   {string}      text       user input
   * @return  {string}                 modified text
   */
  replaceTagsUserInput: function(text) {
    if (Object.keys(tagsToReplace).length !== 0) {
      for (tag in tagsToReplace) {
        var regex = new RegExp('\\b' + tag + '\\b', 'i')
        while (text.search(regex) !== -1) {
          text = text.replace(regex, tagsToReplace[tag])
        }
      }
    }
    return text;
  }
}
