export const calculateCost = (inputs, settings) => {
    // 1. Materiale Base Pris
    const gram1to1 = parseFloat(inputs.amount1to1) || 0;
    const gram2to1 = parseFloat(inputs.amount2to1) || 0;

    const cost1to1 = (gram1to1 / 1000) * (settings.price1to1 || 0);
    const cost2to1 = (gram2to1 / 1000) * (settings.price2to1 || 0);
    const materialBase = cost1to1 + cost2to1;

    // Materiale Total (m/ buffer)
    // HVIS includeBuffer er sand: Materiale = Base * (1 + Buffer%/100)
    let materialTotal = inputs.includeBuffer
        ? materialBase * (1 + (settings.buffer || 0) / 100)
        : materialBase;

    // Add Custom Materials (Direct Cost - assumed to include buffer or be exact)
    // The user might want buffer on these too? Usually "wood" etc. has waste.
    // Let's assume for now valid inputs are NET costs, but maybe apply buffer?
    // User request was simple "add material". Let's treat as direct cost adder to Material category.
    if (inputs.customMaterials && Array.isArray(inputs.customMaterials)) {
        const customSum = inputs.customMaterials.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
        materialTotal += customSum;
    }

    // 2. Drift & Maskiner (Operations)
    let ops = settings.consumables || 0;
    if (inputs.includeMoldWear) ops += (settings.moldWear || 0);
    if (inputs.useVacuum) ops += (settings.vacuumCost || 0);

    // 3. Arbejdsløn
    // HVIS includeLabor er sand: Løn = (Minutter/60) * Timesats
    const minutes = parseFloat(inputs.time) || 0;
    const labor = inputs.includeLabor
        ? (minutes / 60) * (settings.hourlyRate || 0)
        : 0;

    // 4. Total Kostpris (Minimumspris)
    // Total = Materiale + Ops + Løn + Ekstra + Emballage
    const extras = parseFloat(inputs.extrasCost) || 0;
    const packaging = parseFloat(inputs.packagingCost) || 0;

    const totalCost = materialTotal + ops + labor + extras + packaging;

    // 5. Salgspris
    // HVIS includeProfit er sand: Salg = Total * 2
    const salesPrice = inputs.includeProfit ? totalCost * 2 : totalCost;

    return {
        material: materialTotal,
        operations: ops,
        labor: labor,
        total: totalCost,
        sales: salesPrice
    };
};
