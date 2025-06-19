function applyTextFormatting(paragraphElement, text) {
  paragraphElement.innerHTML = "";

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
      content: match[1], // URL
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

function setTextContent(id, text) {
  const element = document.getElementById(id);
  if (element && text !== undefined && text !== null) {
    element.textContent = text;
  } else if (element) {
    element.textContent = "";
  }
}

export function populateCV(data) {
  document.title = data.documentTitle || "CV";
  setTextContent("header-name", data.headerName);
  setTextContent("header-tagline", data.headerTagline);

  setTextContent("contact-title", data.sectionTitles?.contact);
  setTextContent("contact-phone", data.contact?.phone);
  setTextContent("skills-title", data.sectionTitles?.skills);
  setTextContent("education-title", data.sectionTitles?.education);
  setTextContent("characteristics-title", data.sectionTitles?.characteristics);
  setTextContent("about-me-title", data.sectionTitles?.aboutMe);
  setTextContent("experience-title", data.sectionTitles?.experience);
  setTextContent("achievements-title", data.sectionTitles?.achievements);
  setTextContent("projects-title", data.sectionTitles?.projects);

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

  // Populate Skills
  const charList = document.getElementById("characteristics-list");
  if (charList && data.characteristics && popupsContainer) {
    charList.innerHTML = "";
    data.characteristics.forEach((char) => {
      const li = document.createElement("li");
      li.textContent = char.summary;

      if (shouldBeInteractive(char)) {
        li.className = "interactive-item";
        li.dataset.popupTarget = `popup-${char.id}`;
        popupsContainer.appendChild(createPopupElement(char));
      }
      charList.appendChild(li);
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

  // Populate Projects
  const projectsList = document.getElementById("projects-list");
  if (projectsList && data.projects && popupsContainer) {
    projectsList.innerHTML = "";
    data.projects.forEach((proj) => {
      const li = document.createElement("li");
      li.textContent = proj.summary;

      if (shouldBeInteractive(proj)) {
        li.className = "interactive-item";
        li.dataset.popupTarget = `popup-${proj.id}`;
        popupsContainer.appendChild(createPopupElement(proj));
      }
      projectsList.appendChild(li);
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

export function initalizeHints(data) {
  const hintText = document.getElementById("interactive-hint-p");
  if (hintText && data.hintText) {
    applyTextFormatting(hintText, data.hintText.trim());
  }

  function dismissHint(hint) {
    if (hint) {
      hint.classList.add("hidden");
      setTimeout(() => {
        hint.remove();
      }, 200);
    }
  }

  const hint = document.getElementById("interactive-hint");
  const closeButton = document.getElementById("close-hint-interactive");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      dismissHint.bind(null, hint)();
    });
  }
}
