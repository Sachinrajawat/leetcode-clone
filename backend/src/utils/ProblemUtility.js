const axios = require("axios");

const getLanguageId = (lang) => {
  const languages = {
    "c++": 54,
    java: 62,
    javascript: 63,
  };

  return languages[lang.toLowerCase()];
};


const submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "false",
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE0_API_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      submissions,
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
    //   console.log(response.data);
    return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  return await fetchData();
};

const waiting = async(timer) =>{
    setTimeout(()=>{
        return 1;
    },timer);
}

const submitToken = async (resultToken) => {
  const options = {
    method: "GET",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      fields: "*",
      base64_encoded: "false",
      tokens: resultToken.join(","),
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE0_API_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      // console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  while (true) {
    const result = await fetchData();
    const isResultObtained = result.submissions.every((r) => r.status_id > 2);
    if (isResultObtained) {
      return result.submissions;
    }
    await waiting(1000);
  }
};

module.exports = {
  getLanguageId,
  submitBatch,
  submitToken,
};
