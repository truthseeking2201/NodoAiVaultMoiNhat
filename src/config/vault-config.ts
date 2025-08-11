export const RATE_DENOMINATOR = 1000000;

export const CLOCK = "0x6";

export const EXCHANGE_CODES_MAP: Record<
  number,
  {
    code: string;
    name: string;
    image: string;
  }
> = {
  1: {
    code: "cetus",
    name: "Cetus",
    image: "/dexs/cetus.png",
  },
  2: {
    code: "pancake",
    name: "Pancake",
    image: "/dexs/pancake.png",
  },
  3: {
    code: "mmt",
    name: "Momentum",
    image: "/dexs/mmt.png",
  },
  5: {
    code: "bluefin",
    name: "Bluefin",
    image: "/dexs/bluefin.png",
  },
  6: {
    code: "kriya",
    name: "Kriya",
    image: "/dexs/kriya.png",
  },
  8: {
    code: "turbos",
    name: "Turbos",
    image: "/dexs/turbos.png",
  },
  9: {
    code: "flowx",
    name: "FlowX",
    image: "/dexs/flowx.png",
  },
};
