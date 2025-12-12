import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { translations } from './translations';
// Note: We'll import a font or just use standard fonts. For simplicity and reliability in electron with widely varying languages, we'll try standard fonts first.
// If special characters like 'æøå' or Cyrillic break, we might need a custom font, but jsPDF has improved utf8 support.

export const generateInvoice = (entry, settings) => {
    try {
        const doc = new jsPDF();
        const lang = settings.language || 'da';
        const t = (key) => translations[lang][key] || key;
        const currency = settings.currency || 'kr';

        // 1. Header & Logo
        let topOffset = 20;

        // Custom Logo
        if (settings.companyLogo) {
            // Add image (format, x, y, w, h)
            // We'll fix width to 30mm and scale height accordingly (or just square for simplicity)
            // But we don't know aspect ratio easily without loading it. 
            // Let's assume a square-ish box 25x25 max.
            try {
                doc.addImage(settings.companyLogo, 'JPEG', 14, 10, 25, 25, undefined, 'FAST');
                topOffset = 50; // Push text down if logo exists
            } catch (imgErr) {
                console.warn("Could not add logo", imgErr);
            }
        }

        doc.setFontSize(22);
        // Use custom company name or default
        const title = settings.companyName || t('appTitle') || "EpoxyCalc";
        doc.text(title, settings.companyLogo ? 45 : 14, 25); // Offset text if logo exists

        doc.setFontSize(16);
        doc.text(t('pdfTitle'), 14, settings.companyLogo ? 45 : 35);

        doc.setFontSize(10);
        doc.text(`${t('histTableDate')}: ${entry.date}`, 14, settings.companyLogo ? 55 : 45);
        doc.text(`${t('histTableProject')}: ${entry.projectName}`, 14, settings.companyLogo ? 60 : 50);

        // 2. Data for Table
        // We want to show a breakdown that justifies the price.
        // Since it's a "kind of bill", we might want to list materials used and operations.
        // However, often you just want to sell the product.
        // Let's make a detailed view for the user.

        const tableHead = [[t('pdfDesc'), t('pdfQty'), t('pdfPrice'), t('pdfTotal')]];

        const tableBody = [
            // Epoxy 1:1
            entry.amount1to1 > 0 ? [
                t('amount1to1'),
                `${entry.amount1to1} g`,
                `${settings.price1to1} /kg`,
                `${((entry.amount1to1 / 1000) * settings.price1to1).toFixed(2)}`
            ] : null,

            // Epoxy 2:1
            entry.amount2to1 > 0 ? [
                t('amount2to1'),
                `${entry.amount2to1} g`,
                `${settings.price2to1} /kg`,
                `${((entry.amount2to1 / 1000) * settings.price2to1).toFixed(2)}`
            ] : null,

            // Custom Materials
            ...(entry.customMaterials && Array.isArray(entry.customMaterials) ? entry.customMaterials.map(mat => (
                mat.name && mat.cost ? [
                    mat.name,
                    '1',
                    mat.cost,
                    parseFloat(mat.cost).toFixed(2)
                ] : null
            )).filter(Boolean) : []),

            // Labor
            entry.includeLabor && entry.time > 0 ? [
                t('resLabor'),
                `${(entry.time / 60).toFixed(2)} t`,
                `${settings.hourlyRate} /t`,
                `${((entry.time / 60) * settings.hourlyRate).toFixed(2)}`
            ] : null,

            // Extras
            entry.extrasCost > 0 ? [
                t('extras'),
                '1',
                entry.extrasCost,
                entry.extrasCost?.toFixed(2)
            ] : null,

            // Packaging
            entry.packagingCost > 0 ? [
                t('packaging'),
                '1',
                entry.packagingCost,
                entry.packagingCost?.toFixed(2)
            ] : null,

            // Vacuum (if true, it's a surcharge)
            entry.useVacuum ? [
                t('useVacuum'),
                '1',
                settings.vacuumCost,
                settings.vacuumCost?.toFixed(2)
            ] : null,

            // Mold Wear
            entry.includeMoldWear ? [
                t('includeMoldWear'),
                '1',
                settings.moldWear,
                settings.moldWear?.toFixed(2)
            ] : null,

            // Buffer categories are skipped for clarity, focused on "billable items"
        ].filter(Boolean);

        // 3. Generate Table
        autoTable(doc, {
            startY: settings.companyLogo ? 70 : 60,
            head: tableHead,
            body: tableBody,
            theme: 'grid',
            styles: { font: "helvetica" }, // 'helvetica' handles some utf8
        });

        // 4. Totals
        let finalY = doc.lastAutoTable.finalY + 10;

        doc.setFontSize(12);
        doc.text(`${t('resCost')}: ${entry.results.total.toFixed(2)} ${currency}`, 14, finalY);

        finalY += 10;
        doc.setFontSize(16);
        doc.setTextColor(0, 150, 0); // Green
        doc.text(`${t('resSales')}: ${entry.results.sales.toFixed(2)} ${currency}`, 14, finalY);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Generated by EpoxyCalc v1.0", 14, 280);

        // Save via Electron Dialog
        const filename = `${entry.projectName.replace(/\s+/g, '_')}_invoice.pdf`;

        // Efficient Base64 conversion using jsPDF built-in
        const dataUriString = doc.output('datauristring');
        // Format is "data:application/pdf;base64,....."
        const base64Data = dataUriString.split(',')[1];

        if (window.electronAPI && window.electronAPI.savePdf) {
            window.electronAPI.savePdf(base64Data, filename)
                .then(result => {
                    if (result.success) {
                        alert('PDF gemt korrekt!');
                    } else if (result.canceled) {
                        // User canceled, do nothing
                    } else {
                        console.error('Failed to save PDF:', result.error);
                        alert('Fejl ved gemning af PDF: ' + result.error);
                    }
                })
                .catch(err => {
                    alert('Kritisk fejl under gem-proces: ' + err.message);
                });
        } else {
            // Fallback for web dev mode
            console.log('No electronAPI found, using fallback save');
            doc.save(filename);
            alert('PDF gemt i Downloads (browser mode)');
        }
    } catch (e) {
        console.error("PDF Generation Error:", e);
        alert('Kunne ikke generere PDF. Fejl: ' + e.message);
    }
};
