const fs = require("fs");
const path = require("path");

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
    console.error("Usage: node docs/generate-pdf.js <input-md> <output-pdf>");
    process.exit(1);
}

const source = fs.readFileSync(inputPath, "utf8");
const rawLines = source.replace(/\r\n/g, "\n").split("\n");

const lines = rawLines.map((line) => {
    const plain = line
        .replace(/^#{1,6}\s*/g, "")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1");
    return plain.length > 100 ? plain.slice(0, 100) : plain;
});

const pageWidth = 595;
const pageHeight = 842;
const marginLeft = 50;
const marginTop = 800;
const lineHeight = 14;
const linesPerPage = 52;

function escapePdfText(text) {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");
}

function chunk(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

const pages = chunk(lines, linesPerPage);
if (pages.length === 0) {
    pages.push([""]);
}

let nextObjectId = 1;
const catalogId = nextObjectId++;
const pagesId = nextObjectId++;
const fontId = nextObjectId++;

const pageEntries = pages.map(() => {
    const pageId = nextObjectId++;
    const contentId = nextObjectId++;
    return { pageId, contentId };
});

const objects = [];

objects.push({
    id: catalogId,
    content: `<< /Type /Catalog /Pages ${pagesId} 0 R >>`,
});

const kids = pageEntries.map((entry) => `${entry.pageId} 0 R`).join(" ");
objects.push({
    id: pagesId,
    content: `<< /Type /Pages /Kids [${kids}] /Count ${pageEntries.length} >>`,
});

objects.push({
    id: fontId,
    content: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
});

for (let i = 0; i < pageEntries.length; i++) {
    const { pageId, contentId } = pageEntries[i];
    const pageLines = pages[i].map((line) => (line.trim() === "" ? " " : line));

    let stream = "BT\n";
    stream += `/F1 11 Tf\n${marginLeft} ${marginTop} Td\n${lineHeight} TL\n`;
    for (let j = 0; j < pageLines.length; j++) {
        stream += `(${escapePdfText(pageLines[j])}) Tj\n`;
        if (j < pageLines.length - 1) {
            stream += "T*\n";
        }
    }
    stream += "\nET";

    objects.push({
        id: pageId,
        content:
            `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
            `/Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    });

    objects.push({
        id: contentId,
        content: `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`,
    });
}

objects.sort((a, b) => a.id - b.id);

let pdf = "%PDF-1.4\n";
const offsets = [0];

for (const obj of objects) {
    offsets[obj.id] = Buffer.byteLength(pdf, "utf8");
    pdf += `${obj.id} 0 obj\n${obj.content}\nendobj\n`;
}

const xrefOffset = Buffer.byteLength(pdf, "utf8");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";

for (let id = 1; id <= objects.length; id++) {
    const offset = String(offsets[id]).padStart(10, "0");
    pdf += `${offset} 00000 n \n`;
}

pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n`;
pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, pdf, "binary");
console.log(`PDF created at ${outputPath}`);
