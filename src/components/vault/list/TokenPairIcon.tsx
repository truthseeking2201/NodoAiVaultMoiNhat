export function TokenPairIcon() {
  return (
    <div className={"flex items-center md:justify-center"}>
      <img
        src={`/coins/usdc.png`}
        alt="USDC"
        className={"mr-2 w-12 h-12 rounded-full max-md:w-8 max-md:h-8"}
      />
      <img
        src={`/coins/sui.png`}
        alt="SUI"
        className={"mr-2 w-12 h-12 rounded-full max-md:w-8 max-md:h-8 ml-[-15px]"}
      />
    </div>
  );
}
