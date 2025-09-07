// Calculate vertical earth pressure reduction coefficient based on soil type, cover thickness, and pipe diameter
// Returns K1 value and formatted calculation process description
export interface K1Result {
    K1: number;
    description: string;
}

export function calculateK1(
    Kμ: number,
    H: number,
    D: number,
    soilType: string
): K1Result {
    if (Kμ === 0) {
        return {
            K1: 1,
            description: `
Since the soil above the pipe crown is ${soilType}, take $K_1 = 1$`
        };
    }

    if (H <= D) {
        return {
            K1: 1,
            description: `
Since the soil cover thickness $H_s ≤ D_1$, take $K_1 = 1$`
        };
    }

    const K1Calc = (1 - Math.exp(-Kμ * H / D)) / (Kμ * H / D);
    const K1Min = D / H;

    if (K1Calc < K1Min) {
        return {
            K1: K1Min,
            description: `
$$
  K_1 = \\frac{1-e^{-${Kμ.toFixed(3)}\\times\\frac{${H.toFixed(2)}}{${D.toFixed(2)}}}}{${Kμ.toFixed(3)}\\times\\frac{${H.toFixed(2)}}{${D.toFixed(2)}}} = ${K1Calc.toFixed(4)} < \\frac{D_1}{H_s} = \\frac{${D.toFixed(2)}}{${H.toFixed(2)}} = ${K1Min.toFixed(4)}; \\text{ therefore take } K_1 = \\frac{D_1}{H_s} = ${K1Min.toFixed(4)}
$$`
        };
    } else {
        return {
            K1: K1Calc,
            description: `    
$$
  K_1 = \\frac{1-e^{-${Kμ.toFixed(3)}\\times\\frac{${H.toFixed(2)}}{${D.toFixed(2)}}}}{${Kμ.toFixed(3)}\\times\\frac{${H.toFixed(2)}}{${D.toFixed(2)}}} = ${K1Calc.toFixed(4)}
$$`
        };
    }
}