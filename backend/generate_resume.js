const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createResume() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  let currentY = height - 50;
  
  const writeText = (text, size, isBold = false) => {
    page.drawText(text, {
      x: 50,
      y: currentY,
      size: size,
      font: isBold ? boldFont : font,
      color: rgb(0, 0, 0),
    });
    currentY -= (size + 6);
  };

  writeText('John Doe', 24, true);
  currentY -= 10;
  writeText('Software Engineering Student', 14);
  writeText('Email: john.doe@example.com | Phone: (555) 123-4567 | GitHub: github.com/johndoe', 10);
  
  currentY -= 20;
  writeText('SUMMARY', 14, true);
  currentY -= 5;
  writeText('Highly motivated Software Engineering student with experience in building full-stack', 11);
  writeText('web applications. Passionate about AI, web development, and writing clean code.', 11);

  currentY -= 20;
  writeText('EDUCATION', 14, true);
  currentY -= 5;
  writeText('B.S. in Computer Science - Tech University', 12, true);
  writeText('Expected Graduation: May 2027 | GPA: 3.8/4.0', 11);
  writeText('Relevant Coursework: Data Structures, Algorithms, Web Development, Databases.', 11);

  currentY -= 20;
  writeText('EXPERIENCE', 14, true);
  currentY -= 5;
  writeText('Software Engineer Intern | InnovateTech', 12, true);
  writeText('June 2025 - August 2025', 11);
  writeText('- Developed responsive user interfaces using React and Tailwind CSS.', 11);
  writeText('- Collaborated with backend engineers to integrate RESTful APIs using Node.js.', 11);
  writeText('- Improved page load performance by 15% through lazy loading and code splitting.', 11);

  currentY -= 20;
  writeText('PROJECTS', 14, true);
  currentY -= 5;
  writeText('InternPilot - Internship Tracker (React, Node.js, SQLite)', 12, true);
  writeText('- Built a full-stack platform for students to track internship applications.', 11);
  writeText('- Integrated Google Gemini AI to analyze job descriptions and prep for interviews.', 11);
  
  currentY -= 20;
  writeText('SKILLS', 14, true);
  currentY -= 5;
  writeText('Languages: JavaScript, Python, HTML/CSS, SQL', 11);
  writeText('Frameworks/Libraries: React, Node.js, Express, Tailwind', 11);
  writeText('Tools & Tech: Git, GitHub, VS Code, REST APIs, SQLite', 11);

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(__dirname, '..', 'dummy_resume.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log('Dummy resume generated at:', outputPath);
}

createResume().catch(console.error);
