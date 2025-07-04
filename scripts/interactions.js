import { prettyPrintTimestamp } from "./utils.js";

export function initializeInteractions(setLanguageCallback) {
  const popupOverlay = document.getElementById("popup-overlay");
  const popupsContainer = document.getElementById("popups-container");
  const languageToggleButton = document.getElementById(
    "language-toggle-button",
  );

  let interactions = [];

  function logInteraction(itemId, lang) {
    const ts = new Date().toISOString();
    interactions.push(`${prettyPrintTimestamp(ts)}: ${lang}-${itemId}`);
    sessionStorage.setItem("userInteractions", JSON.stringify(interactions));
  }

  function openPopup(popupId) {
    const popup = popupsContainer.querySelector(`#${popupId}`);
    if (popup) {
      popup.classList.add("active");
      if (popupOverlay) {
        popupOverlay.classList.add("active");
      }
      if (languageToggleButton) {
        languageToggleButton.classList.add("hidden");
      }
      document.body.style.overflow = "hidden";
    }
  }

  function closeAllPopups() {
    if (popupsContainer) {
      popupsContainer.querySelectorAll(".popup.active").forEach((popup) => {
        popup.classList.remove("active");
      });
    }
    if (popupOverlay) {
      popupOverlay.classList.remove("active");
    }
    if (languageToggleButton) {
      languageToggleButton.classList.remove("hidden");
    }
    document.body.style.overflow = "auto";
  }

  function initializePopups() {
    const interactiveItems = document.querySelectorAll(".interactive-item");
    interactiveItems.forEach((item) => {
      if (item.dataset.popupTarget) {
        item.addEventListener("click", (event) => {
          if (event.target.tagName === "A") {
            return;
          }
          event.preventDefault();

          const popupId = item.getAttribute("data-popup-target");
          if (popupId) {
            openPopup(popupId);
          }

          const currentLang = document.documentElement.lang;
          logInteraction(popupId, currentLang);
        });
      }
    });

    if (popupsContainer) {
      popupsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("close-button")) {
          closeAllPopups();
        }
      });
    }

    if (popupOverlay) {
      popupOverlay.addEventListener("click", () => {
        closeAllPopups();
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAllPopups();
      }
    });
  }

  if (languageToggleButton) {
    languageToggleButton.addEventListener("click", () => {
      const anyPopupActive = document.querySelector(".popup.active");
      if (anyPopupActive) return;
      const currentLang = document.documentElement.lang;
      const newLang = currentLang === "en" ? "sk" : "en";
      setLanguageCallback(newLang);
    });
  }

  return { initializePopups };
}

export function updateLanguageToggleText(currentLang) {
  const languageToggleButton = document.getElementById(
    "language-toggle-button",
  );
  if (!languageToggleButton) return;

  let currentLangDisplay, otherLangDisplay;
  if (currentLang === "en") {
    currentLangDisplay = "EN";
    otherLangDisplay = "SK";
  } else {
    currentLangDisplay = "SK";
    otherLangDisplay = "EN";
  }

  // if @media (max-width: 768px) only show current language
  if (window.matchMedia("(max-width: 768px)").matches) {
    languageToggleButton.innerHTML = `<span class="current-lang">${currentLangDisplay}</span>`;
  } else {
    languageToggleButton.innerHTML = `
        <span class="current-lang">${currentLangDisplay}</span>
        <span class="separator">|</span>
        <span class="other-lang">${otherLangDisplay}</span>
      `;
  }
}

export function triggerInteractiveHighlight() {
  const interactiveItems = document.querySelectorAll(".interactive-item");
  if (interactiveItems.length === 0) return;

  interactiveItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add("highlight-pulse");

      setTimeout(() => {
        item.classList.remove("highlight-pulse");
      }, 150);
    }, index * 75);
  });
}
