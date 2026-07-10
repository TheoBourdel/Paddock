// Nom de pays Ergast/jolpica → code ISO 3166-1 alpha-2 (pour flagcdn.com)
const COUNTRY_CODES: Record<string, string> = {
    Australia: "au",
    Austria: "at",
    Azerbaijan: "az",
    Bahrain: "bh",
    Belgium: "be",
    Brazil: "br",
    Canada: "ca",
    China: "cn",
    France: "fr",
    Germany: "de",
    Hungary: "hu",
    Italy: "it",
    Japan: "jp",
    Mexico: "mx",
    Monaco: "mc",
    Netherlands: "nl",
    Portugal: "pt",
    Qatar: "qa",
    Russia: "ru",
    "Saudi Arabia": "sa",
    Singapore: "sg",
    "South Africa": "za",
    "South Korea": "kr",
    Korea: "kr",
    Spain: "es",
    Turkey: "tr",
    UAE: "ae",
    UK: "gb",
    USA: "us",
    "United States": "us",
    Vietnam: "vn",
};

/** URL du drapeau (PNG largeur 40 px, ratio variable) ou null si pays inconnu */
export function flagUrl(country: string): string | null {
    const code = COUNTRY_CODES[country];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
}