import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { translations } from './translations';
// Note: We'll import a font or just use standard fonts. For simplicity and reliability in electron with widely varying languages, we'll try standard fonts first.
// If special characters like 'æøå' or Cyrillic break, we might need a custom font, but jsPDF has improved utf8 support.

export const generateInvoice = (entryOrEntries, settings, invoiceNumber = null, customerDetails = {}) => {
    try {
        const doc = new jsPDF();
        const lang = settings.language || 'da';
        const t = (key) => translations[lang][key] || key;
        const currency = settings.currency || 'kr';

        // Determine if merged
        const isMerged = Array.isArray(entryOrEntries);
        const entries = isMerged ? entryOrEntries : [entryOrEntries];
        // Use first entry date or today for merged
        const invoiceDate = isMerged ? new Date().toLocaleDateString() : entries[0].date;

        // --- HEADER LAYOUT ---
        // Left Side: Customer Info (Bill To)
        // Right Side: Logo -> Company Info -> Invoice Metadata

        // 1. Right Side (Logo, Company, Metadata)
        let rightX = 195; // Right margin 15mm
        let yPos = 20;

        const alignRight = (text, y) => {
            if (!text) return;
            doc.text(text, rightX, y, { align: 'right' });
        };

        // Logo (Right Aligned - kind of)
        // We want the image anchored top-right.
        if (settings.companyLogo) {
            try {
                // Assume 30x30 max. 
                // X position: Page Width (210) - Margin (15) - Width (30) = 165
                // Let's align the Right edge of image to 195.
                doc.addImage(settings.companyLogo, 'JPEG', 165, 10, 30, 30, undefined, 'FAST');
                yPos = 45; // Start text below logo
            } catch (imgErr) {
                console.warn("Could not add logo", imgErr);
            }
        }

        // Company Name (Bold, larger)
        doc.setFontSize(14);
        doc.setTextColor(0);
        const companyName = settings.companyName || t('appTitle') || "EpoxyCalc";
        alignRight(companyName, yPos);
        yPos += 6;

        // Company Details (Small)
        doc.setFontSize(9);
        doc.setTextColor(80);

        if (settings.companyAddress) {
            alignRight(`${t('setCompanyAddress')}: ${settings.companyAddress}`, yPos);
            yPos += 4;
        }
        if (settings.companyZipCity) {
            alignRight(settings.companyZipCity, yPos);
            yPos += 4;
        }
        if (settings.companyCVR) {
            alignRight(`${t('setCompanyCVR')}: ${settings.companyCVR}`, yPos);
            yPos += 4;
        }
        if (settings.companyPhone) {
            alignRight(`${t('setCompanyPhone')}: ${settings.companyPhone}`, yPos);
            yPos += 4;
        }
        if (settings.companyEmail) {
            alignRight(`${t('setCompanyEmail')}: ${settings.companyEmail}`, yPos);
            yPos += 4;
        }
        if (settings.companyWeb) {
            alignRight(`${t('setCompanyWeb')}: ${settings.companyWeb}`, yPos);
            yPos += 4;
        }

        // Invoice Metadata (Below Company Info, Right Aligned)
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(0);
        const invTitle = invoiceNumber ? `${t('pdfTitle')} #${invoiceNumber}` : t('pdfTitle');
        alignRight(invTitle, yPos);

        yPos += 5;
        // Date
        doc.setFontSize(10);
        doc.setTextColor(100);
        const timeStr = entries[0].timestamp ? ` kl. ${entries[0].timestamp}` : '';
        doc.text(`${t('lblDate')}: ${entries[0].date}${timeStr}`, rightX, yPos, { align: 'right' });     // 2. Left Side: Customer Info (Bill To)
        // Starts at top now, since Logo moved away
        let leftY = 20;

        // Customer Info (Bill To)
        if (customerDetails && (customerDetails.name || customerDetails.address)) {
            doc.setFontSize(10);
            doc.setTextColor(150); // Label color
            doc.text("Bill To:", 14, leftY);
            leftY += 6;

            doc.setFontSize(11);
            doc.setTextColor(0);
            if (customerDetails.name) {
                doc.text(customerDetails.name, 14, leftY);
                leftY += 5;
            }
            if (customerDetails.address) {
                doc.text(customerDetails.address, 14, leftY);
                leftY += 5;
            }
            if (customerDetails.zipCity) {
                doc.text(customerDetails.zipCity, 14, leftY);
                leftY += 5;
            }
            if (customerDetails.ref) {
                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.text(`Ref: ${customerDetails.ref}`, 14, leftY);
                leftY += 5;
            }
        } else if (!isMerged) {
            // Fallback to Project Name if no Customer Details
            doc.setFontSize(10);
            doc.text(`${t('histTableProject')}: ${entries[0].projectName}`, 14, leftY);
        }

        // 2. Data for Table
        // We want to show a breakdown that justifies the price.
        // Since it's a "kind of bill", we might want to list materials used and operations.
        // However, often you just want to sell the product.
        // Let's make a detailed view for the user.

        // Helper to generate rows for a single entry
        const generateEntryRows = (entry) => {
            return [
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
                    mat.name ? [
                        mat.note && mat.showOnInvoice ? `${mat.name}\n(Note: ${mat.note})` : mat.name,
                        String(mat.quantity || 1),
                        mat.unitPrice > 0 ? parseFloat(mat.unitPrice).toFixed(2) : (mat.cost || '0.00'),
                        parseFloat(mat.cost || 0).toFixed(2)
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

                // Machine Surcharge
                (() => {
                    let surchargeTotal = 0;
                    if (entry.includeBuffer) {
                        const price1 = parseFloat(settings.price1to1) || 0;
                        const price2 = parseFloat(settings.price2to1) || 0;
                        const cost1 = (parseFloat(entry.amount1to1 || 0) / 1000) * price1;
                        const cost2 = (parseFloat(entry.amount2to1 || 0) / 1000) * price2;
                        const baseMat = cost1 + cost2;
                        const bufferPct = parseFloat(settings.buffer || 0);
                        surchargeTotal += baseMat * (bufferPct / 100);
                    }
                    if (entry.useVacuum) surchargeTotal += parseFloat(settings.vacuumCost || 0);
                    if (entry.includeMoldWear) surchargeTotal += parseFloat(settings.moldWear || 0);

                    if (surchargeTotal > 0) {
                        return [
                            t('pdfMachineSurcharge'),
                            '1',
                            surchargeTotal.toFixed(2),
                            surchargeTotal.toFixed(2)
                        ];
                    }
                    return null;
                })()
            ].filter(Boolean);
        };

        const tableHead = [[t('pdfDesc'), t('pdfQty'), t('pdfPrice'), t('pdfTotal')]];
        let tableBody = [];

        if (isMerged) {
            // Detailed Merged Body
            entries.forEach((entry, index) => {
                // Header Row for Project
                tableBody.push([{
                    content: `${entry.projectName} (${entry.date})`,
                    colSpan: 4,
                    styles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
                }]);

                // Detailed rows for this project
                const rows = generateEntryRows(entry);
                tableBody.push(...rows);

                // Optional Subtotal for project could go here, but maybe overkill if we just want itemization
                // Let's add an empty spacer row if it's not the last item
                // if (index < entries.length - 1) {
                //    tableBody.push([{ content: '', colSpan: 4, styles: { minCellHeight: 5 } }]);
                // }
            });
        } else {
            // Detailed Single Entry Body
            tableBody = generateEntryRows(entries[0]);
        }

        // 3. Generate Table
        // Dynamic startY based on header content
        // Let's assume max header height is around 80mm
        autoTable(doc, {
            startY: Math.max(yPos + 20, 90), // Ensure it clears header
            head: tableHead,
            body: tableBody,
            theme: 'grid',
            styles: { font: "helvetica" }, // 'helvetica' handles some utf8
            headStyles: { fillColor: [44, 62, 80] }, // Professional dark blue header
        });

        // 4. Totals
        let finalY = doc.lastAutoTable.finalY + 10;

        // Logic for Breakdown
        // subtotal = Sales Price - Rounding
        // discount = Rounding
        // total = Sales Price

        // Calculate totals from entries (usually single entry for invoice)
        // If merged, we sum them up.
        const totalSales = entries.reduce((sum, e) => sum + (e.results.sales || 0), 0);
        const totalRounding = entries.reduce((sum, e) => sum + (e.results.rounding || 0), 0);
        const subtotal = totalSales - totalRounding;

        // Render Breakdown
        doc.setFontSize(10);
        doc.setTextColor(80);

        // Subtotal
        alignRight(`${t('pdfSubtotal')}: ${subtotal.toFixed(2)} ${currency}`, finalY);
        finalY += 5;

        // Discount / Rounding
        alignRight(`${t('pdfDiscount')}: ${totalRounding.toFixed(2)} ${currency}`, finalY);
        finalY += 7;

        // Final Total
        doc.setFontSize(16);
        doc.setTextColor(0, 150, 0); // Green
        alignRight(`${t('pdfTotal')}: ${totalSales.toFixed(2)} ${currency}`, finalY);

        // Project Note
        if (entries[0].projectNote && entries[0].showProjectNoteOnInvoice) {
            finalY += 15;
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.text(`${t('lblNotes')}:`, 14, finalY);

            finalY += 6;
            doc.setFontSize(10);
            doc.setTextColor(80);

            // Split text to fit width
            const noteLines = doc.splitTextToSize(entries[0].projectNote, 180);
            doc.text(noteLines, 14, finalY);

            // Update finalY for next element if needed
            finalY += (noteLines.length * 5);
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated by EpoxyCalc v${import.meta.env.PACKAGE_VERSION}`, 14, 280);

        // 5. Append Project Image if exists (Only for single entry)
        if (!isMerged && entries[0].projectImage) {
            const entry = entries[0]; // Define entry for this block
            doc.addPage();
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text(t('histTableProject') + " View", 14, 20); // Or specific translation "Resultat"

            try {
                // Fit image to page (A4: 210mm width, minus margins = ~180mm)
                const imgProps = doc.getImageProperties(entry.projectImage);
                const pdfWidth = document.internal?.pageSize?.getWidth() || 210;
                const pdfHeight = document.internal?.pageSize?.getHeight() || 297;

                const margin = 14;
                const maxWidth = pdfWidth - (margin * 2);
                const maxHeight = pdfHeight - 40; // Title + margins

                // Calculate ratio
                const ratio = Math.min(maxWidth / imgProps.width, maxHeight / imgProps.height);
                const w = imgProps.width * ratio;
                const h = imgProps.height * ratio;

                doc.addImage(entry.projectImage, 'JPEG', margin, 30, w, h);
            } catch (err) {
                console.error("Failed to add project image to PDF", err);
            }
        }

        // Save via Electron Dialog
        const filename = isMerged
            ? `Invoice_${invoiceNumber || 'merged'}.pdf`
            : `${entries[0].projectName.replace(/\s+/g, '_')}_invoice.pdf`;

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
