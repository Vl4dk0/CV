document.addEventListener("DOMContentLoaded", () => {
  const dataUrl = "cv-data-en.json";
  const hintPopup = document.getElementById("interactive-hint");
  const closeHintButton = document.getElementById("close-hint-button");
  closedHint = false;

  function showHint() {
    if (hintPopup && !closedHint) {
      hintPopup.classList.remove("hidden");
    } else if (hintPopup) {
      hintPopup.classList.add("hidden");
      hintPopup.style.display = "none";
    }
  }

  function dismissHint() {
    if (hintPopup) {
      hintPopup.classList.add("hidden");
      closedHint = true;
      setTimeout(() => {
        if (hintPopup.classList.contains("hidden")) {
          hintPopup.style.display = "none";
        }
      }, 200);
    }
  }

  if (closeHintButton) {
    closeHintButton.addEventListener("click", dismissHint);
  }

  async function loadCVData() {
    try {
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      populateCV(data);
      initializePopups();
      showHint();
    } catch (error) {
      console.error("Could not load CV data:", error);
      document.body.innerHTML =
        "<p style='color:#ff0000;font-weight:bold;font-size:2rem;text-align:center;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:1rem 2rem;background-color:rgba(255,0,0,0.1);border:2px solid #ff0000;border-radius:5px;box-shadow:0 0 10px rgba(255,0,0,0.3);z-index:1000;'>Error loading CV data.</p>";
    }
  }

  function applyTextFormatting(paragraphElement, text) {
    paragraphElement.innerHTML = ""; // Clear existing content

    const linkRegex = /\blink:(\S+)\b/g;
    const boldRegex = /\bbold:\((.+?)\)/g;

    const matches = [];
    let match;

    // Collect link matches
    linkRegex.lastIndex = 0;
    while ((match = linkRegex.exec(text)) !== null) {
      matches.push({
        type: "link",
        index: match.index,
        length: match[0].length,
        content: match[1], // The URL
      });
    }

    // Collect bold matches
    boldRegex.lastIndex = 0;
    while ((match = boldRegex.exec(text)) !== null) {
      matches.push({
        type: "bold",
        index: match.index,
        length: match[0].length,
        content: match[1],
      });
    }

    // Sort matches by starting index
    matches.sort((a, b) => a.index - b.index);

    let currentIndex = 0;
    for (const currentMatch of matches) {
      if (currentMatch.index > currentIndex) {
        paragraphElement.appendChild(
          document.createTextNode(
            text.substring(currentIndex, currentMatch.index),
          ),
        );
      }

      if (currentMatch.type === "link") {
        const url = currentMatch.content;
        const a = document.createElement("a");
        a.href =
          url.startsWith("http://") || url.startsWith("https://")
            ? url
            : `http://${url}`;
        a.textContent = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        paragraphElement.appendChild(a);
      } else if (currentMatch.type === "bold") {
        const boldText = currentMatch.content;
        const strong = document.createElement("strong");
        strong.textContent = boldText;
        paragraphElement.appendChild(strong);
      }
      currentIndex = currentMatch.index + currentMatch.length;
    }

    if (currentIndex < text.length) {
      paragraphElement.appendChild(
        document.createTextNode(text.substring(currentIndex)),
      );
    }
  }

  function createPopupElement(item) {
    const popupDiv = document.createElement("div");
    popupDiv.id = `popup-${item.id}`;
    popupDiv.className = "popup";

    const popupContentDiv = document.createElement("div");
    popupContentDiv.className = "popup-content";

    const closeButton = document.createElement("span");
    closeButton.className = "close-button";
    closeButton.innerHTML = "&times;";
    popupContentDiv.appendChild(closeButton);

    const h2 = document.createElement("h2");
    h2.textContent = item.popupTitle || item.summary || item.institution;
    popupContentDiv.appendChild(h2);

    const detailsTextDiv = document.createElement("div");
    detailsTextDiv.className = "popup-details-text";
    if (item.popupDetailsText) {
      const paragraphsTextArray = item.popupDetailsText.split(/\n\s*\n/);
      paragraphsTextArray.forEach((paraText) => {
        if (paraText.trim()) {
          const p = document.createElement("p");
          applyTextFormatting(p, paraText.trim());
          detailsTextDiv.appendChild(p);
        }
      });
    }
    popupContentDiv.appendChild(detailsTextDiv);
    popupDiv.appendChild(popupContentDiv);
    return popupDiv;
  }

  function populateCV(data) {
    document.title = data.documentTitle || "CV";
    setTextContent("header-name", data.headerName);
    setTextContent("header-tagline", data.headerTagline);

    setTextContent("contact-title", data.sectionTitles?.contact);
    setTextContent("skills-title", data.sectionTitles?.skills);
    setTextContent("about-me-title", data.sectionTitles?.aboutMe);
    setTextContent("experience-title", data.sectionTitles?.experience);
    setTextContent("achievements-title", data.sectionTitles?.achievements);
    setTextContent("education-title", data.sectionTitles?.education);
    setTextContent("contact-phone", data.contact?.phone);

    function shouldBeInteractive(item) {
      const hasTitle = item.popupTitle && item.popupTitle.trim() !== "";
      const hasDetails =
        item.popupDetailsText && item.popupDetailsText.trim() !== "";
      return hasTitle && hasDetails;
    }

    const emailLink = document.getElementById("contact-email-link");
    const emailTextSpan = document.getElementById("contact-email-text");
    if (emailLink && data.contact?.emailHref)
      emailLink.href = data.contact.emailHref;
    if (emailTextSpan)
      setTextContent("contact-email-text", data.contact?.emailText);

    const addressContainer = document.getElementById("contact-address");
    if (addressContainer && data.contact?.addressLines) {
      addressContainer.innerHTML = "";
      data.contact.addressLines.forEach((line) => {
        const span = document.createElement("span");
        span.textContent = line;
        addressContainer.appendChild(span);
        addressContainer.appendChild(document.createElement("br"));
      });
    }

    const popupsContainer = document.getElementById("popups-container");
    if (popupsContainer) popupsContainer.innerHTML = "";

    // Populate Skills
    const skillsList = document.getElementById("skills-list");
    if (skillsList && data.skills && popupsContainer) {
      skillsList.innerHTML = "";
      data.skills.forEach((skill) => {
        const li = document.createElement("li");
        li.textContent = skill.summary;

        if (shouldBeInteractive(skill)) {
          li.className = "interactive-item";
          li.dataset.popupTarget = `popup-${skill.id}`;
          popupsContainer.appendChild(createPopupElement(skill));
        }
        skillsList.appendChild(li);
      });
    }

    // Populate Education
    const educationList = document.getElementById("education-list");
    if (educationList && data.education && popupsContainer) {
      educationList.innerHTML = "";
      data.education.forEach((edu) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "education-item";
        itemDiv.id = `edu-item-${edu.id}`;

        if (shouldBeInteractive(edu)) {
          itemDiv.classList.add("interactive-item");
          itemDiv.dataset.popupTarget = `popup-${edu.id}`;
          popupsContainer.appendChild(createPopupElement(edu));
        }

        const h3 = document.createElement("h3");
        h3.textContent = edu.institution;
        itemDiv.appendChild(h3);

        const detailsDiv = document.createElement("div");
        detailsDiv.className = "education-details-summary";
        if (edu.details) {
          edu.details.forEach((detailLine) => {
            const p = document.createElement("p");
            p.textContent = detailLine;
            detailsDiv.appendChild(p);
          });
        }
        itemDiv.appendChild(detailsDiv);

        const datesP = document.createElement("p");
        const strongDates = document.createElement("strong");
        strongDates.textContent = edu.dates;
        datesP.appendChild(strongDates);
        itemDiv.appendChild(datesP);
        educationList.appendChild(itemDiv);
      });
    }

    // Populate About Me
    const aboutMeContent = document.getElementById("about-me-content");
    if (aboutMeContent && data.aboutMe) {
      aboutMeContent.innerHTML = "";
      data.aboutMe.forEach((paragraph) => {
        const p = document.createElement("p");
        applyTextFormatting(p, paragraph.trim());
        aboutMeContent.appendChild(p);
      });
    }

    // Populate Experience
    const experienceList = document.getElementById("experience-list");
    if (experienceList && data.experience && popupsContainer) {
      experienceList.innerHTML = "";
      data.experience.forEach((exp) => {
        const li = document.createElement("li");
        li.textContent = exp.summary;

        if (shouldBeInteractive(exp)) {
          li.className = "interactive-item";
          li.dataset.popupTarget = `popup-${exp.id}`;
          popupsContainer.appendChild(createPopupElement(exp));
        }
        experienceList.appendChild(li);
      });
    }

    // Populate Achievements
    const achievementsContent = document.getElementById("achievements-content");
    if (achievementsContent && data.achievements && popupsContainer) {
      achievementsContent.innerHTML = "";
      if (data.achievements.introText && data.achievements.introText.trim()) {
        const introP = document.createElement("p");
        applyTextFormatting(introP, data.achievements.introText.trim());
        achievementsContent.appendChild(introP);
      }
      if (data.achievements.subsections) {
        data.achievements.subsections.forEach((sub) => {
          const subDiv = document.createElement("div");
          subDiv.className = "achievement-subsection";

          const h3 = document.createElement("h3");
          h3.textContent = sub.title;
          subDiv.appendChild(h3);

          const ul = document.createElement("ul");
          if (sub.items) {
            sub.items.forEach((item) => {
              const li = document.createElement("li");
              li.textContent = item.summary;

              if (shouldBeInteractive(item)) {
                li.className = "interactive-item";
                li.dataset.popupTarget = `popup-${item.id}`;
                popupsContainer.appendChild(createPopupElement(item));
              }
              ul.appendChild(li);
            });
          }
          subDiv.appendChild(ul);
          achievementsContent.appendChild(subDiv);
        });
      }
    }
  }

  function setTextContent(id, text) {
    const element = document.getElementById(id);
    if (element && text !== undefined && text !== null) {
      element.textContent = text;
    } else if (element) {
      element.textContent = "";
    }
  }

  function initializePopups() {
    const interactiveItems = document.querySelectorAll(".interactive-item");
    const popupOverlay = document.getElementById("popup-overlay");
    const popupsContainer = document.getElementById("popups-container");

    function openPopup(popupId) {
      const popup = popupsContainer.querySelector(`#${popupId}`);
      if (popup) {
        popup.classList.add("active");
        if (popupOverlay) {
          popupOverlay.classList.add("active");
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
      document.body.style.overflow = "auto";
    }

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
    console.log("Interactive CV popups initialized!");
  }

  loadCVData();
});
