const mongoose = require('mongoose');

const opggHeadless = require('./opggHeadless');
const getChampionList = require('./getChampionList');
const { MONGO_URL, DATABASE_NAME } = require('./config');
const ChampionHintImgModel = require('./mongo/ChampionHintImgModel');

console.log('TCL: (`${MONGO_URL}/${DATABASE_NAME}`', `mongodb://${MONGO_URL}/${DATABASE_NAME}`);
mongoose.connect(`mongodb://${MONGO_URL}/${DATABASE_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once('open', () => {
  console.log('✅MongoDB Connected');
});

const crawChampion = async () => {
  const traverseAll = async cham => {
    console.log('TCL: traverseAll -> cham', cham);
    const result = await opggHeadless(cham);

    const query = { name: cham };
    const update = {
      runeHint: result.runeHint,
      itemAndSpellHint: result.itemAndSpellHint,
    };
    const options = { upsert: true };

    // Find the document
    ChampionHintImgModel.findOneAndUpdate(query, update, options, (updateError, result) => {
      if (!updateError) {
        // If the document doesn't exist, Create it.
        if (!result) {
          result = new ChampionHintImgModel({
            ...query,
            ...update,
          });
        }
        // Save the document
        result.save(saveError => {
          if (saveError) {
            throw saveError;
          }
        });
      } else {
        throw updateError;
      }
    });
  };

  const chamList = await getChampionList();

  console.log('TCL: crawChampion -> chamList.length();', chamList.length);
  chamList
    .reduce((chain, item) => chain.then(() => traverseAll(item)), Promise.resolve())
    .then(() => console.log('all finished, one after the other'));
};

crawChampion();
