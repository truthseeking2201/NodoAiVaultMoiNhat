const ArrowRightGradient = () => (
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
);

export default ArrowRightGradient;
