//DEFINE USED STICKER IDS

//Facebook thumb stickers IDs
const smallThumbID = 369239263222822;
const bigThumbID = 369239343222814;
const hugeThumbID = 369239383222810;

//This array includes every answer depending on the sticker used.
const stickers = {
  [smallThumbID]: {
    text: "Oh, c'est tout ? Je m'attendais à plus de satisfaction de votre part...",
    attachment: false
  }, [bigThumbID]: {
    text: "On avance mais je suis certain que vous pouvez faire mieux ! Encore un petit effort...",
    attachment: false
  }, [hugeThumbID]: {
    text: "Ah ! Je vous remercie ! Vous aussi vous êtes au top !",
    attachment: false
  }
};

module.exports = {
  reactToStickers: function(sticker_id) {
    if (stickers[sticker_id])
      return stickers[sticker_id];
    else {
      return false;
    }
  }
}
