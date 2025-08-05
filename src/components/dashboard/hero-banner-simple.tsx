import HeroBannerImage2 from "@/assets/images/dashboard/hero-banner-2.png";
import { GradientOutlinedButton } from "@/components/ui/gradient-outlined-button";

const HeroBannerSimple = () => {
  const handleReadMore = () => {
    window.open(
      "https://docs.nodo.xyz/public/nodo-campaigns/nodo-ai-vault-genesis-yield-campaign-phase-1",
      "_blank"
    );
  };
  
  return (
    <section className="relative w-full h-[210px] flex items-center overflow-hidden rounded-xl mb-12">
      <img
        src={HeroBannerImage2}
        alt="Genesis Vault Campaign Banner"
        className="absolute inset-0 w-full h-full object-cover rounded-xl z-0"
        width={1720}
        height={210}
        loading="eager"
        fetchPriority="high"
      />
      <div className="relative z-20 flex flex-col justify-center h-full text-left max-w-[1000px]">
        <div className="bg-clip-text text-transparent bg-[linear-gradient(90deg,_#FFE8C9_0%,_#F9F4E9_25%,_#E3F6FF_60%,_#C9D4FF_100%)] text-left font-dm-sans text-[28px] font-bold mb-4 px-12">
          Claim your share in NODO’s Genesis vault campaign
        </div>
        <div
          className="text-white font-dm-sans text-[28px] font-bold leading-[36px] tracking-[-0.9px] flex items-center py-1 w-fit px-10 mb-4"
          style={{
            background:
              "linear-gradient(90deg, rgba(255, 0, 166, 0.00) 0%, rgba(255, 0, 200, 0.60) 12%, rgba(255, 0, 255, 0.60) 25%, rgba(196, 0, 255, 0.60) 38%, rgba(74, 40, 255, 0.60) 50%, rgba(0, 47, 255, 0.60) 62%, rgba(0, 120, 255, 0.60) 75%, rgba(0, 196, 255, 0.60) 88%, rgba(0, 255, 255, 0.00) 100%)",
          }}
        >
          <img
            src="/coins/usdc.png"
            alt="USDC"
            className="h-8 w-auto ml-2"
            width="32"
            height="32"
          />
          <span className="ml-2 mr-4 text-[32px]">10,000 USDC </span>
          <span className="mr-4">+ </span>
          <img
            src="/coins/xp.png"
            alt="XP"
            className="h-8 w-auto"
            width="32"
            height="32"
          />
          <span className="ml-2 text-[32px]">2,000,000,000 XP Shares</span>
        </div>
        <div className="w-fit px-12">
          <GradientOutlinedButton onClick={handleReadMore}>
            <span className="bg-gradient-to-r from-[#FFE8C9] via-[#E3F6FF] to-[#C9D4FF] text-transparent bg-clip-text flex items-center">
              Read More
              <svg
                className="inline ml-2 w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="arrow-gradient"
                    x1="0"
                    y1="12"
                    x2="24"
                    y2="12"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFE8C9" />
                    <stop offset="0.25" stopColor="#F9F4E9" />
                    <stop offset="0.6" stopColor="#E3F6FF" />
                    <stop offset="1" stopColor="#C9D4FF" />
                  </linearGradient>
                </defs>
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="url(#arrow-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </GradientOutlinedButton>
        </div>
      </div>
    </section>
  );
};

export default HeroBannerSimple;
