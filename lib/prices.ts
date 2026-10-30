// Tonet's prices, in one place for every page and the calculator. Set by the founder on 2026-10-22.
// Pay as you go: $10 a person a month + 1¢ a minute. Unlimited: $15 a person a month, US and Canada
// calls included. Texts 3¢ on both plans. Numbers $2.50 a month. $15 to start, billed by the day.
export const prices = {
  payg: { perPersonMonth: 10, perMinute: 0.01 },
  unlimited: { perPersonMonth: 15 },
  perText: 0.03,
  perNumberMonth: 2.5,
  firstTopUp: 15,
} as const;

/** Minutes a person a month above which Unlimited costs less than Pay as you go. */
export const breakEvenMinutes = Math.round(
  (prices.unlimited.perPersonMonth - prices.payg.perPersonMonth) / prices.payg.perMinute,
);
