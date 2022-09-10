import axios from "../axios";
const domain = process.env.REACT_APP_API_URL;

const fetchLanguages = async () => {
  return await axios.get(
    "https://api.cognitive.microsofttranslator.com/languages?api-version=3.0&scope=translation"
  );
};

const translateMessage = async (data) => {
  return await axios.post(`${domain}/translate/message`, data);
};

export const translationService = {
  fetchLanguages,
  translateMessage,
};
