
const calculateCost = (inputs, settings) => {
    // COPIED FROM src/utils/calculations.js (Simplified for Node)

    // 1. Materiale Base Pris
    const gram1to1 = parseFloat(inputs.amount1to1) || 0;
    const gram2to1 = parseFloat(inputs.amount2to1) || 0;

    const cost1to1 = (gram1to1 / 1000) * (settings.price1to1 || 0);
    const cost2to1 = (gram2to1 / 1000) * (settings.price2to1 || 0);
    const materialBase = cost1to1 + cost2to1;

    // Materiale Total (m/ buffer)
    let materialTotal = inputs.includeBuffer
        ? materialBase * (1 + (settings.buffer || 0) / 100)
        : materialBase;

    // Add Custom Materials
    if (inputs.customMaterials && Array.isArray(inputs.customMaterials)) {
        const customSum = inputs.customMaterials.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
        console.log("Custom Sum separate:", customSum);
        materialTotal += customSum;
    }

    // 2. Drift & Maskiner (Operations)
    let ops = settings.consumables || 0;
    if (inputs.includeMoldWear) ops += (settings.moldWear || 0);
    if (inputs.useVacuum) ops += (settings.vacuumCost || 0);

    // 3. Arbejdsløn
    const minutes = parseFloat(inputs.time) || 0;
    const labor = inputs.includeLabor
        ? (minutes / 60) * (settings.hourlyRate || 0)
        : 0;

    // 4. Total Kostpris (Minimumspris)
    const extras = parseFloat(inputs.extrasCost) || 0;
    const packaging = parseFloat(inputs.packagingCost) || 0;

    const totalCost = materialTotal + ops + labor + extras + packaging;

    // 5. Salgspris
    const salesPrice = inputs.includeProfit ? totalCost * 2 : totalCost;

    return {
        material: materialTotal,
        operations: ops,
        labor: labor,
        total: totalCost,
        sales: salesPrice
    };
};

const settings = {
    price1to1: 100,
    price2to1: 100,
    buffer: 10,
    moldWear: 10,
    vacuumCost: 5,
    consumables: 5,
    hourlyRate: 100
};

const inputs = {
    amount1to1: 1000, // 100kr
    amount2to1: 0,
    includeBuffer: true, // +10% = 110kr
    customMaterials: [
        { name: 'Wood', cost: '50' },
        { name: 'Paper', cost: 20 }
    ],
    // Expect materialTotal = 110 + 50 + 20 = 180
    includeLabor: false,
    includeMoldWear: false,
    useVacuum: false,
    includeProfit: false
};

const result = calculateCost(inputs, settings);
console.log("Inputs:", JSON.stringify(inputs, null, 2));
console.log("Result:", result);

if (result.material === 180) {
    console.log("SUCCESS: Material cost included correctly.");
} else {
    console.log("FAILURE: Expected 180, got " + result.material);
}
