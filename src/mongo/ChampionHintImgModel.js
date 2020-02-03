const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const championHintImgModel = new Schema({
  name: String,
  runeHint: Buffer,
  itemAndSpellHint: Buffer
});

module.exports = mongoose.model("ChampionHintImg", championHintImgModel);
