// Change "INR" / "en-IN" here to switch currency everywhere.
const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export const formatMoney = (n: number) => {
  const s = fmt.format(Math.abs(n)).replace(/\.00$/, "");
  return n < 0 ? `-${s}` : s;
};
