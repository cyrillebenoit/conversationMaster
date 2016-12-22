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
  replaceTagsUserInput: function(text) {
    for (tag in tagsToReplace) {
      var regex = new RegExp('\\b' + tag + '\\b', 'i')
      while (text.search(regex) !== -1) {
        text = text.replace(regex, tagsToReplace[tag])
      }
    }
    return text;
  }
}
