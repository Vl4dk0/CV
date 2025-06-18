import { loadCVData } from "./dataLoader.js";
import { populateCV, initalizeHints } from "./uiBuilder.js";
import {
  initializeInteractions,
  triggerInteractiveHighlight,
  updateLanguageToggleText,
} from "./interactions.js";

const DEFAULT_LANG = "en";
const LANG_STORAGE_KEY = "cvPreferredLanguage";
let currentLang = localStorage.getItem(LANG_STORAGE_KEY) || DEFAULT_LANG;
let interactionInitializer = null;

async function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  document.documentElement.lang = lang;

  updateLanguageToggleText(currentLang);

  const data = await loadCVData(lang);
  if (data) {
    populateCV(data);
    if (interactionInitializer) {
      interactionInitializer.initializePopups();
    }
    initalizeHints(data);
  }

  setTimeout(triggerInteractiveHighlight, 500);
}

function isMobile() {
  const userAgent = navigator.userAgent;
  if (/Mobi|Android/i.test(userAgent)) {
    return true;
  } else if (/Tablet|iPad/i.test(userAgent)) {
    return true;
  }
  return false;
}


document.addEventListener("DOMContentLoaded", () => {
  interactionInitializer = initializeInteractions(setLanguage);
  setLanguage(currentLang);
});
