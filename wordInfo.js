// const query = "hello";

const searchBoxElem = document.getElementById("query");
const resultsContainerElem = document.getElementById("results");

// when someone presses enter in the search box,
searchBoxElem.addEventListener("keydown", whenSomeKeyPressed);

async function whenSomeKeyPressed(event) {
  
  if (event.key === "Enter") {
    event.preventDefault();
    const rhymes = await searchForRhymes(searchBoxElem.value);
    const rhymeElements = await createRhymeElements(rhymes);
    clearResultsElem();
    populateResultsElem(rhymeElements);
    searchBoxElem.value = '';
  }
}

async function searchForRhymes(query) {
  const rhymeResults = await fetch(
    `https://rhymebrain.com/talk?function=getRhymes&word=${query}`
  );
  const rhymeResultsJson = await rhymeResults.json();
  const truncatedTo10 = rhymeResultsJson.slice(0, 10);
  console.log(truncatedTo10);
  return truncatedTo10;
}

async function createRhymeElements(rhymeResultsJson) {
  const wordInfos = await getWordsInfos(rhymeResultsJson);

  return rhymeResultsJson.map((rhymeWord, i) => {
    let resultElem = document.createElement("div");
    resultElem.classList.add("result");
    resultElem.dataset.score = rhymeWord.score;
    resultElem.append(rhymeWord.word);
    resultElem.append(createWordInfoElements(wordInfos[i]));
    resultElem = styleRhymeResult(resultElem);
    return resultElem;
  });
}

async function getWordsInfos(rhymes) {
  const wordsInfos = await Promise.all(
    rhymes.map(async (rhyme) => {
      const wordInfo = await fetch(
        `https://rhymebrain.com/talk?function=getWordInfo&word=${rhyme.word}`
      );
      const wordInfoJson = await wordInfo.json();
      return wordInfoJson;
    })
  );
  return wordsInfos;
}

function createWordInfoElements(wordInfo) {
  const wordInfoElem = document.createElement("dl");
  for (const [key, value] of Object.entries(wordInfo)) {
    const dt = document.createElement("dt");
    dt.append(key);
    const dd = document.createElement("dd");
    dd.append(value);
    wordInfoElem.append(dt);
    wordInfoElem.append(dd);
  }
  return wordInfoElem;
}

function styleRhymeResult(resultElem) {
  const styledResult = resultElem;
  const resultScore = parseInt(resultElem.dataset.score, 10);
  styledResult.style.fontSize = `${0.5 + (3.5 * resultScore) / 300}rem`;
  return styledResult;
}

function clearResultsElem() {
  Array.from(resultsContainerElem.childNodes).forEach((child) => {
    child.remove();
  });
}

function populateResultsElem(rhymeResultsElems) {
  resultsContainerElem.append(...rhymeResultsElems);
}