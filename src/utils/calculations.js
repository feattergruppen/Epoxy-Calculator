const parseNum = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    // Handle both comma and dot
    const str = String(val).replace(',', '.');
    return parseFloat(str) || 0;
};

export const calculateCost = (inputs, settings) => {
    // 1. Materiale Base Pris
    const gram1to1 = parseNum(inputs.amount1to1);
    const gram2to1 = parseNum(inputs.amount2to1);

    const cost1to1 = (gram1to1 / 1000) * parseNum(settings.price1to1);
    const cost2to1 = (gram2to1 / 1000) * parseNum(settings.price2to1);
    const materialBase = cost1to1 + cost2to1;

    // Materiale Total (m/ buffer)
    // HVIS includeBuffer er sand: Materiale = Base * (1 + Buffer%/100)
    let materialTotal = inputs.includeBuffer
        ? materialBase * (1 + parseNum(settings.buffer) / 100)
        : materialBase;

    // Add Custom Materials (Direct Cost - assumed to include buffer or be exact)
    // The user might want buffer on these too? Usually "wood" etc. has waste.
    // Let's assume for now valid inputs are NET costs, but maybe apply buffer?
    // User request was simple "add material". Let's treat as direct cost adder to Material category.
    if (inputs.customMaterials && Array.isArray(inputs.customMaterials)) {
        const customSum = inputs.customMaterials.reduce((sum, item) => sum + parseNum(item.cost), 0);
        materialTotal += customSum;
    }

    // 2. Drift & Maskiner (Operations)
    let ops = parseNum(settings.consumables);
    if (inputs.includeMoldWear) ops += parseNum(settings.moldWear);
    if (inputs.useVacuum) ops += parseNum(settings.vacuumCost);

    // 3. Arbejdsløn
    // HVIS includeLabor er sand: Løn = (Minutter/60) * Timesats
    const minutes = parseNum(inputs.time);
    const labor = inputs.includeLabor
        ? (minutes / 60) * parseNum(settings.hourlyRate)
        : 0;

    // 4. Total Kostpris (Minimumspris)
    // Total = Materiale + Ops + Løn + Ekstra + Emballage
    // 4. Total Kostpris (Minimumspris)
    // Total = Materiale + Ops + Løn + Ekstra + Emballage
    const extras = parseNum(inputs.extrasCost);
    const packaging = parseNum(inputs.packagingCost);

    const totalCost = materialTotal + ops + labor + extras + packaging;

    // 5. Salgspris
    // HVIS includeProfit er sand: Salg = Total * 2
    // 5. Salgspris
    // HVIS includeProfit er sand: Salg = Total * 2
    let salesPrice = inputs.includeProfit ? totalCost * 2 : totalCost;

    // 6. Afrunding / Rabat
    let roundingAmount = 0;
    const roundingInput = String(inputs.rounding || '').trim();

    if (roundingInput) {
        if (roundingInput.endsWith('%')) {
            // Percentage
            const pct = parseNum(roundingInput.replace('%', ''));
            roundingAmount = salesPrice * (pct / 100);
        } else {
            // Absolute
            roundingAmount = parseNum(roundingInput);
        }
        salesPrice += roundingAmount;
    }

    return {
        material: materialTotal,
        operations: ops,
        labor: labor,
        total: totalCost,
        sales: salesPrice,
        rounding: roundingAmount
    };
};
