const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const inputHtmlPath = path.join(__dirname, 'report.html');
const outputPath = path.join(__dirname, 'Good_Health_Project_Report_Gujarati.pdf');
const chromePath = '/Users/gunakhushi/.cache/puppeteer/chrome/mac_arm-131.0.6778.85/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

(async () => {
  try {
    console.log('Reading HTML from:', inputHtmlPath);
    const htmlContent = fs.readFileSync(inputHtmlPath, 'utf8');

    console.log('Launching browser with Chrome at:', chromePath);
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    console.log('Generating PDF at:', outputPath);
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        right: '12mm',
        bottom: '12mm',
        left: '12mm'
      }
    });

    await browser.close();
    console.log('✅ PDF generated successfully:', outputPath);

    const stats = fs.statSync(outputPath);
    console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB`);
  } catch (err) {
    console.error('❌ Error generating PDF:', err);
    process.exit(1);
  }
})();
