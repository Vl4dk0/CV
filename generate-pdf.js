const fs = require('fs');
const path = require('path');
const { mdToPdf } = require('md-to-pdf');

function parseBold(text) {
  if (!text) return '';
  // Convert bold:(text) to **text** and link:url to [url](https://url)
  return text.replace(/bold:\((.*?)\)/g, '**$1**')
             .replace(/link:(.*?)(?=\s|$|\n)/g, '[$1](https://$1)');
}

function generateMarkdown(data) {
  let md = `# ${data.headerName}\n`;
  md += `## ${data.headerTagline}\n\n`;

  md += `> **Note to recruiters:** An interactive version of this CV, optimized for humans, is available at [vladimirjancar-cv.netlify.app](https://vladimirjancar-cv.netlify.app/)\n\n`;

  // Contact Info
  md += `### ${data.sectionTitles.contact}\n`;
  md += `- **Phone:** ${data.contact.phone}\n`;
  md += `- **Email:** [${data.contact.emailText}](${data.contact.emailHref})\n`;
  md += `- **Address:** ${data.contact.addressLines.join(', ')}\n\n`;

  // About Me
  md += `### ${data.sectionTitles.aboutMe}\n`;
  data.aboutMe.forEach(line => {
    md += `${parseBold(line)}\n\n`;
  });

  // Skills
  md += `### ${data.sectionTitles.skills}\n`;
  data.skills.forEach(skill => {
    md += `#### ${skill.summary}\n`;
    md += `${parseBold(skill.popupDetailsText)}\n\n`;
  });

  // Experience
  md += `### ${data.sectionTitles.experience}\n`;
  data.experience.forEach(exp => {
    md += `#### ${exp.summary}\n`;
    md += `${parseBold(exp.popupDetailsText)}\n\n`;
  });

  // Projects
  md += `### ${data.sectionTitles.projects}\n`;
  data.projects.forEach(proj => {
    md += `#### ${proj.summary}\n`;
    md += `${parseBold(proj.popupDetailsText)}\n\n`;
  });

  // Achievements
  md += `### ${data.sectionTitles.achievements}\n`;
  md += `${parseBold(data.achievements.introText)}\n\n`;
  data.achievements.subsections.forEach(sub => {
    md += `#### ${sub.title}\n`;
    sub.items.forEach(item => {
      md += `- **${item.summary}:** ${parseBold(item.popupDetailsText)}\n`;
    });
    md += '\n';
  });

  // Education
  md += `### ${data.sectionTitles.education}\n`;
  data.education.forEach(edu => {
    md += `#### ${edu.institution} (${edu.dates})\n`;
    if (edu.details && edu.details.length > 0) {
      md += `- ${edu.details.join('\n- ')}\n`;
    }
    md += `${parseBold(edu.popupDetailsText)}\n\n`;
  });

  // Personal Characteristics
  md += `### ${data.sectionTitles.characteristics}\n`;
  data.characteristics.forEach(char => {
    md += `#### ${char.summary}\n`;
    md += `${parseBold(char.popupDetailsText)}\n\n`;
  });

  return md;
}

async function run() {
  const inputPath = path.join(__dirname, 'cv-data-en.json');
  const pdfPath = path.join(__dirname, 'VladimirJancar.pdf');

  try {
    console.log('Reading JSON data...');
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    console.log('Generating Markdown content...');
    const markdown = generateMarkdown(data);

    console.log('Converting to PDF...');
    const pdf = await mdToPdf({ content: markdown }, { 
        dest: pdfPath,
        pdf_options: {
            format: 'A4',
            margin: '20mm',
            printBackground: true
        }
    });

    if (pdf) {
        console.log(`- PDF successfully saved to: ${pdfPath}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
