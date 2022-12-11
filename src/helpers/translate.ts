import axios from 'axios';

export default class Translate {
  public static autoTranslate(inputText: string, languageOutput: string): Promise<string> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${languageOutput}&dt=t&q=${escape(inputText)}`;
    const translate = new Promise<string>((resolve, rejects) => {
      axios
        .get(url)
        .then(async (data) => {
          let results = '';
          for await (const rs of data.data[0]) {
            results = results.concat(...rs[0]);
          }
          resolve(results);
        })
        .catch((err) => {
          rejects(inputText);
          console.log(err);
        });
    });
    return translate;
  }
}
