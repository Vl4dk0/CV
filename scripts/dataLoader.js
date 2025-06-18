export async function loadCVData(lang = currentLang) {
  const dataUrl = `../cv-data-${lang}.json`;
  try {
    const response = await fetch(dataUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Could not load CV data:", error);
    document.body.innerHTML =
      "<p style='color:#ff0000;font-weight:bold;font-size:2rem;text-align:center;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:1rem 2rem;background-color:rgba(255,0,0,0.1);border:2px solid #ff0000;border-radius:5px;box-shadow:0 0 10px rgba(255,0,0,0.3);z-index:1000;'>Error loading CV data.</p>";

    return null;
  }
}
