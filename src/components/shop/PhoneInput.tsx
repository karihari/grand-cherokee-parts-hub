import { useT } from "@/lib/i18n";

// Armenia first, then the countries customers most often call from.
export const PHONE_COUNTRIES = [
  { iso: "AM", name: "Armenia", flag: "🇦🇲", dial: "+374" },
  { iso: "RU", name: "Russia", flag: "🇷🇺", dial: "+7" },
  { iso: "GE", name: "Georgia", flag: "🇬🇪", dial: "+995" },
  { iso: "US", name: "United States", flag: "🇺🇸", dial: "+1" },
  { iso: "FR", name: "France", flag: "🇫🇷", dial: "+33" },
  { iso: "DE", name: "Germany", flag: "🇩🇪", dial: "+49" },
  { iso: "GB", name: "United Kingdom", flag: "🇬🇧", dial: "+44" },
  { iso: "UA", name: "Ukraine", flag: "🇺🇦", dial: "+380" },
  { iso: "BY", name: "Belarus", flag: "🇧🇾", dial: "+375" },
  { iso: "KZ", name: "Kazakhstan", flag: "🇰🇿", dial: "+7" },
  { iso: "IR", name: "Iran", flag: "🇮🇷", dial: "+98" },
  { iso: "AE", name: "United Arab Emirates", flag: "🇦🇪", dial: "+971" },
  { iso: "TR", name: "Turkey", flag: "🇹🇷", dial: "+90" },
] as const;

export type PhoneCountry = (typeof PHONE_COUNTRIES)[number]["iso"];

export function dialCode(iso: PhoneCountry) {
  return PHONE_COUNTRIES.find((c) => c.iso === iso)!.dial;
}

// Digits only, without a leading 0 (a trunk prefix such as 098 → 98).
export function cleanLocalNumber(value: string) {
  return value.replace(/\D/g, "").replace(/^0+/, "");
}

export function PhoneInput({
  id,
  country,
  number,
  onCountryChange,
  onNumberChange,
  required,
}: {
  id: string;
  country: PhoneCountry;
  number: string;
  onCountryChange: (iso: PhoneCountry) => void;
  onNumberChange: (v: string) => void;
  required?: boolean;
}) {
  const t = useT();
  return (
    <div className="flex gap-2">
      <select
        aria-label={t("Код страны", "Country code")}
        value={country}
        onChange={(e) => onCountryChange(e.target.value as PhoneCountry)}
        className="h-11 w-32 shrink-0 rounded-md border border-input bg-card px-2 text-sm"
      >
        {PHONE_COUNTRIES.map((c) => (
          <option key={c.iso} value={c.iso}>
            {c.flag} {c.dial} {c.iso}
          </option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        required={required}
        value={number}
        onChange={(e) => onNumberChange(e.target.value)}
        placeholder={country === "AM" ? "98 123456" : t("Номер телефона", "Phone number")}
        className="h-11 min-w-0 flex-1 rounded-md border border-input bg-card px-3 text-sm"
      />
    </div>
  );
}
