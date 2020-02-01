const axios = require("axios");

const { LOL_CLIENT_VERSION } = require("./config");
const lolStaticCDN = "http://ddragon.leagueoflegends.com/cdn";

const getChampionList = async () => {
  const axiosConfig = {
    method: "get",
    url: `${lolStaticCDN}/${LOL_CLIENT_VERSION}/data/ko_KR/champion.json`
  };
  console.log("TCL: getCham -> axiosConfig", axiosConfig.url);

  const {
    data: { data }
  } = await axios(axiosConfig);
  console.log("TCL: getChampionList -> Object.keys(data", Object.keys(data));
  return data;
};

getChampionList();
