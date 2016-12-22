const buttonText = {
  "offres Zen, Play, et Jet": 0,
  "par oui ou non": 1,
  "Voulez-vous ": 1,
  "Voulez vous": 1,
  "voulez vous": 1,
  "voulez-vous ": 1,
  "Avez-vous ": 1,
  "avez-vous ": 1,
  "Avez vous ": 1,
  "avez vous ": 1,
  "est-ce bien": 1,
  "Tout est bon pour vous": 1,
  "vous préférez peut-être télé": 1,
  "Souhaitez-vous": 1,
  "Vous pouvez modifier votre offre": 2,
  "Nous proposons deux bouquets": 3
}
const buttons = [
  ['Zen', 'Play', 'Jet'],
  ['Oui', 'Non'],
  ['Adresse', 'Identité', 'Offre', 'Options TV', 'Moyen de paiement'],
  ['Canal+', 'CanalSat', 'Les deux', 'Aucun']
]
module.exports = {
  sendWithButtons: function(text) {
    for (button in buttonText) {
      if (text.indexOf(button) !== -1) return buttons[buttonText[button]];
    }
    return false;
  }
}
