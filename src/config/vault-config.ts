export const RATE_DENOMINATOR = 1000000;

export const CLOCK = "0x6";

export const EXCHANGE_CODES_MAP: Record<
  number,
  {
    code: string;
    name: string;
  }
> = {
  1: {
    code: "cetus",
    name: "Cetus",
  },
  2: {
    code: "pancake",
    name: "Pancake",
  },
  3: {
    code: "mmt",
    name: "Momentum",
  },
  5: {
    code: "bluefin",
    name: "Bluefin",
  },
  6: {
    code: "kriya",
    name: "Kriya",
  },
  8: {
    code: "turbos",
    name: "Turbos",
  },
  9: {
    code: "flowx",
    name: "FlowX",
  },
};
