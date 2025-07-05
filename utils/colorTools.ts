export const getTransparentColor = (hex: string, alpha: number): string => {
    if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(hex)) {
        throw new Error(`Invalid hex color: ${hex}`);
    }

    let normalizedHex = hex.replace('#', '');

    // Expand 3-digit hex to 6-digit
    if (normalizedHex.length === 3) {
        normalizedHex = normalizedHex
            .split('')
            .map((c) => c + c)
            .join('');
    }

    const bigint = parseInt(normalizedHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
