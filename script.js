document.addEventListener("DOMContentLoaded", () => {
  const dataUrl = "cv-data.json"; // Or path to your JSON file

  async function loadCVData() {
    try {
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      populateCV(data);
      initializePopups(); // Re-initialize popup logic after content is loaded
    } catch (error) {
      console.error("Could not load CV data:", error);
      // Display an error message to the user on the page
      document.body.innerHTML =
        "<p>Error loading CV data. Please try again later.</p>";
    }
  }

  function populateCV(data) {
    // Set document title
    document.title = data.documentTitle || "CV";

    // Populate Header
    setTextContent("header-name", data.headerName);
    setTextContent("header-tagline", data.headerTagline);

    // Populate Section Titles
    setTextContent("contact-title", data.sectionTitles?.contact);
    setTextContent("skills-title", data.sectionTitles?.skills);
    setTextContent("about-me-title", data.sectionTitles?.aboutMe);
    setTextContent("experience-title", data.sectionTitles?.experience);
    setTextContent("achievements-title", data.sectionTitles?.achievements);
    setTextContent("education-title", data.sectionTitles?.education);

    // ... and for all other section titles

    // Populate Contact
    setTextContent("contact-phone", data.contact?.phone);
    const emailLink = document.getElementById("contact-email-link");
    const emailTextSpan = document.getElementById("contact-email-text");
    if (emailLink && data.contact?.emailHref)
      emailLink.href = data.contact.emailHref;
    if (emailTextSpan)
      setTextContent("contact-email-text", data.contact?.emailText);

    const addressContainer = document.getElementById("contact-address");
    if (addressContainer && data.contact?.addressLines) {
      addressContainer.innerHTML = ""; // Clear existing
      data.contact.addressLines.forEach((line) => {
        const p = document.createElement("span"); // Or <p> if you prefer block
        p.textContent = line;
        addressContainer.appendChild(p);
        addressContainer.appendChild(document.createElement("br"));
      });
    }

    // Populate Skills
    const skillsList = document.getElementById("skills-list");
    if (skillsList && data.skills) {
      skillsList.innerHTML = ""; // Clear existing
      data.skills.forEach((skill) => {
        const li = document.createElement("li");
        li.textContent = skill;
        skillsList.appendChild(li);
      });
    }

    // Populate Education
    const educationList = document.getElementById("education-list");
    if (educationList && data.education) {
      educationList.innerHTML = "";
      data.education.forEach((edu) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "education-item";
        itemDiv.id = `edu-item-${edu.id}`;

        const h3 = document.createElement("h3");
        h3.id = `edu-institution-${edu.id}`;
        h3.textContent = edu.institution;
        itemDiv.appendChild(h3);

        const detailsDiv = document.createElement("div");
        detailsDiv.className = "education-details";
        detailsDiv.id = `edu-details-${edu.id}`;
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
        strongDates.id = `edu-dates-${edu.id}`;
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
        p.textContent = paragraph;
        aboutMeContent.appendChild(p);
      });
    }

    // Populate Experience & Popups
    const experienceList = document.getElementById("experience-list");
    const popupsContainer = document.getElementById("popups-container");
    if (experienceList && popupsContainer && data.experience) {
      experienceList.innerHTML = "";
      popupsContainer.innerHTML = "";
      data.experience.forEach((exp) => {
        // Create list item
        const li = document.createElement("li");
        li.className = "interactive-item";
        li.dataset.popupTarget = `exp-popup-${exp.id}`;
        li.textContent = exp.summary;
        experienceList.appendChild(li);

        // Create popup
        const popupDiv = document.createElement("div");
        popupDiv.id = `exp-popup-${exp.id}`;
        popupDiv.className = "popup";

        const popupContentDiv = document.createElement("div");
        popupContentDiv.className = "popup-content";

        const closeButton = document.createElement("span");
        closeButton.className = "close-button";
        closeButton.innerHTML = "&times;"; // 'x' character
        popupContentDiv.appendChild(closeButton);

        const h2 = document.createElement("h2");
        h2.id = `exp-popup-title-${exp.id}`;
        h2.textContent = exp.popupTitle;
        popupContentDiv.appendChild(h2);

        const detailsTextDiv = document.createElement("div");
        detailsTextDiv.className = "popup-details-text";
        detailsTextDiv.id = `exp-popup-details-${exp.id}`;
        // Parse plain text into paragraphs
        if (exp.popupDetailsText) {
          const paragraphs = exp.popupDetailsText.split(/\n\s*\n/); // Split by one or more newlines
          paragraphs.forEach((paraText) => {
            if (paraText.trim()) {
              const p = document.createElement("p");
              p.textContent = paraText.trim();
              detailsTextDiv.appendChild(p);
            }
          });
        }
        popupContentDiv.appendChild(detailsTextDiv);
        popupDiv.appendChild(popupContentDiv);
        popupsContainer.appendChild(popupDiv);
      });
    }

    // Populate Achievements
    const achievementsContent = document.getElementById("achievements-content");
    if (achievementsContent && data.achievements) {
      achievementsContent.innerHTML = "";
      if (data.achievements.introText) {
        const introP = document.createElement("p");
        introP.id = "achievements-intro-text";
        introP.textContent = data.achievements.introText;
        achievementsContent.appendChild(introP);
      }
      if (data.achievements.subsections) {
        data.achievements.subsections.forEach((sub) => {
          const subDiv = document.createElement("div");
          subDiv.className = "achievement-subsection";
          subDiv.id = `achieve-sub-${sub.id}`;

          const h3 = document.createElement("h3");
          h3.id = `achieve-subsection-title-${sub.id}`;
          h3.textContent = sub.title;
          subDiv.appendChild(h3);

          const ul = document.createElement("ul");
          ul.id = `achieve-subsection-list-${sub.id}`;
          if (sub.items) {
            sub.items.forEach((itemText) => {
              const li = document.createElement("li");
              li.textContent = itemText;
              ul.appendChild(li);
            });
          }
          subDiv.appendChild(ul);
          achievementsContent.appendChild(subDiv);
        });
      }
    }
  }

  // Helper function to set text content safely
  function setTextContent(id, text) {
    const element = document.getElementById(id);
    if (element && text !== undefined && text !== null) {
      element.textContent = text;
    } else if (element) {
      element.textContent = ""; // Clear if no text provided
    }
  }

  function initializePopups() {
    const interactiveItems = document.querySelectorAll(".interactive-item");
    const popupOverlay = document.getElementById("popup-overlay");
    const popupsContainer = document.getElementById("popups-container"); // Get the container

    function openPopup(popupId) {
      // Find the popup within the popupsContainer
      const popup = popupsContainer.querySelector(`#${popupId}`);
      if (popup) {
        popup.style.display = "block";
        if (popupOverlay) popupOverlay.style.display = "block";
        document.body.style.overflow = "hidden";
      }
    }

    function closeAllPopups() {
      // Find all popups within the popupsContainer
      if (popupsContainer) {
        popupsContainer.querySelectorAll(".popup").forEach((popup) => {
          popup.style.display = "none";
        });
      }
      if (popupOverlay) popupOverlay.style.display = "none";
      document.body.style.overflow = "auto";
    }

    interactiveItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        const popupId = item.getAttribute("data-popup-target");
        if (popupId) {
          closeAllPopups();
          openPopup(popupId);
        }
      });
    });

    // Use event delegation for close buttons since they are dynamically added
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

  loadCVData(); // Load and populate data when the page loads
});
