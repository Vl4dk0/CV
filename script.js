document.addEventListener("DOMContentLoaded", () => {
  const dataUrl = "cv-data.json";

  async function loadCVData() {
    try {
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      populateCV(data);
      initializePopups();
    } catch (error) {
      console.error("Could not load CV data:", error);
      document.body.innerHTML = "<h1>Error loading CV data.</h1>";
    }
  }

  function parseTextAndCreateLinks(paragraphElement, text) {
    const linkRegex = /\blink:(\S+)\b/g; // Matches "link:URL"
    let lastIndex = 0;
    let match;

    // Clear existing content of the paragraph element before appending new nodes
    paragraphElement.innerHTML = "";

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        paragraphElement.appendChild(
          document.createTextNode(text.substring(lastIndex, match.index)),
        );
      }

      // Create and add the link
      const url = match[1];
      const a = document.createElement("a");
      a.href =
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `http://${url}`;
      a.textContent = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      paragraphElement.appendChild(a);

      lastIndex = linkRegex.lastIndex;
    }

    // Add any remaining text after the last link
    if (lastIndex < text.length) {
      paragraphElement.appendChild(
        document.createTextNode(text.substring(lastIndex)),
      );
    }
  }

  // Helper function to create a popup DOM element
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
          parseTextAndCreateLinks(p, paraText.trim());
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
    if (popupsContainer) popupsContainer.innerHTML = ""; // Clear existing popups

    // Populate Skills
    const skillsList = document.getElementById("skills-list");
    if (skillsList && data.skills && popupsContainer) {
      skillsList.innerHTML = "";
      data.skills.forEach((skill) => {
        const li = document.createElement("li");
        li.className = "interactive-item";
        li.dataset.popupTarget = `popup-${skill.id}`;
        li.textContent = skill.summary;
        skillsList.appendChild(li);
        if (skill.popupDetailsText) {
          popupsContainer.appendChild(createPopupElement(skill));
        }
      });
    }

    // Populate Education
    const educationList = document.getElementById("education-list");
    if (educationList && data.education && popupsContainer) {
      educationList.innerHTML = "";
      data.education.forEach((edu) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "education-item interactive-item";
        itemDiv.id = `edu-item-${edu.id}`;
        itemDiv.dataset.popupTarget = `popup-${edu.id}`;

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

        if (edu.popupDetailsText) {
          popupsContainer.appendChild(createPopupElement(edu));
        }
      });
    }

    // Populate About Me
    const aboutMeContent = document.getElementById("about-me-content");
    if (aboutMeContent && data.aboutMe) {
      aboutMeContent.innerHTML = "";
      data.aboutMe.forEach((paragraph) => {
        const p = document.createElement("p");
        p.textContent = paragraph;
        aboutMeContent.appendChild(p);
      });
    }

    // Populate Experience
    const experienceList = document.getElementById("experience-list");
    if (experienceList && data.experience && popupsContainer) {
      experienceList.innerHTML = "";
      data.experience.forEach((exp) => {
        const li = document.createElement("li");
        li.className = "interactive-item";
        li.dataset.popupTarget = `popup-${exp.id}`;
        li.textContent = exp.summary;
        experienceList.appendChild(li);
        if (exp.popupDetailsText) {
          popupsContainer.appendChild(createPopupElement(exp));
        }
      });
    }

    // Populate Achievements
    const achievementsContent = document.getElementById("achievements-content");
    if (achievementsContent && data.achievements && popupsContainer) {
      achievementsContent.innerHTML = "";
      if (data.achievements.introText) {
        const introP = document.createElement("p");
        introP.textContent = data.achievements.introText;
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
              li.className = "interactive-item";
              li.dataset.popupTarget = `popup-${item.id}`;
              li.textContent = item.summary;
              ul.appendChild(li);
              if (item.popupDetailsText) {
                popupsContainer.appendChild(createPopupElement(item));
              }
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
