const tagsToReplace = {
  'PRIX_OFFRE_1': '19,99€',
  'PRIX_OFFRE_2': '25,99€',
  'PRIX_OFFRE_3': '33,99€'
};
module.exports = {
  replaceTags: function(text) {
    for (tag in tagsToReplace) {
      while (text.indexOf(tag) !== -1) {
        text = text.replace(tag, tagsToReplace[tag])
      }
    }
    return text;
  }
}
