const mongoose = require("mongoose");

const opggHeadless = require("./opggHeadless");
const getChampionList = require("./getChampionList");
const { MONGO_URL, DATABASE_NAME } = require("./config");
const ChampionHintModel = require("./mongo/ChampionHintModel");

console.log(
  "TCL: (`${MONGO_URL}/${DATABASE_NAME}`",
  `mongodb://${MONGO_URL}/${DATABASE_NAME}`
);
mongoose.connect(`mongodb://${MONGO_URL}/${DATABASE_NAME}`, {
  useNewUrlParser: true
});
mongoose.connection.once("open", () => {
  console.log("✅MongoDB Connected");
});

const crawChampion = async () => {
  const traverseAll = async cham => {
    console.log("TCL: traverseAll -> cham", cham);
    const result = await opggHeadless(cham);
    const newChamDoc = new ChampionHintModel({
      name: cham,
      runeHint: result.runeHint,
      itemAndSpellHint: result.itemAndSpellHint
    });
    const DB_result = await newChamDoc.save();
    console.log("TCL: crawChampion -> DB_result", DB_result);

    return DB_result;
  };

  const chamList = await getChampionList();

  console.log("TCL: crawChampion -> chamList.length();", chamList.length);
  chamList
    .reduce(
      (chain, item) => chain.then(() => traverseAll(item)),
      Promise.resolve()
    )
    .then(() => console.log("all finished, one after the other"));
};

crawChampion();