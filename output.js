const tagsToReplace = {
  'PRIX_OFFRE_1': '19,99€',
  'PRIX_OFFRE_2': '25,99€',
  'PRIX_OFFRE_3': '33,99€',
  'DEBIT_UP_OFFRE_1': '100',
  'DEBIT_UP_OFFRE_2': '100',
  'DEBIT_UP_OFFRE_3': '200',
  'DEBIT_DOWN_OFFRE_1': '100',
  'DEBIT_DOWN_OFFRE_2': '200',
  'DEBIT_DOWN_OFFRE_3': '500',
  'OPERATEUR_PRINCIPAL': 'Orange',
  'OFFRE_1': 'Zen',
  'OFFRE_2': 'Play',
  'OFFRE_3': 'Jet'
};
module.exports = {
  /**
   * Returns watson answer before it's shown to the user.
   * The rules to replace tags are set in the static array tagsToReplace.
   * @param   {string}    text     watson answer
   * @return  {string}             modified text
   */
  replaceTags: function(text) {
    if (Object.keys(tagsToReplace).length !== 0) {
      for (tag in tagsToReplace) {
        while (text.indexOf(tag) !== -1) {
          text = text.replace(tag, tagsToReplace[tag])
        }
      }
    }
    return text;
  }
}
