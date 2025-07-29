import HeroBannerImage from "@/assets/images/dashboard/hero-banner.png";

type HeroBannerProps = {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
};

const HeroBanner = ({
  title = "NODO AI Vaults",
  description = "Maximizing DeFi Yields With Autonomous Risk Management.",
}: HeroBannerProps) => {
  return (
    <section
      className="relative w-full h-[260px] md:h-[340px] flex items-center overflow-hidden"
      style={{
        backgroundImage: `url(${HeroBannerImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-20 flex flex-col justify-center h-full text-left max-w-[600px]">
        <h1
          className="text-white text-3xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: "DM Sans" }}
        >
          {title}
        </h1>
        <p className="text-white text-base md:text-lg mb-1">{description}</p>
      </div>
    </section>
  );
};

export default HeroBanner;
