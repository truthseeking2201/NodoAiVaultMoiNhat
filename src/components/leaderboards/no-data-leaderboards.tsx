import ImageNodata from "@/assets/images/leaderboards/no-data.png";

export default function NoDataLeaderboards() {
  // RENDER
  return (
    <div className="bg-black md:rounded-b-xl max-md:rounded-xl max-md:border py-10 px-6 ">
      <div className="flex flex-col items-center justify-center">
        <img
          src={ImageNodata}
          alt="No data"
          className="h-auto md:max-w-[296px] max-w-[228px]"
        />
        <div className="my-4 font-sans text-xl md:text-2xl text-white font-bold">
          The space is still empty!
        </div>
        <div className="text-[#B1B1B1] font-sans text-base text-center font-light">
          No one has claimed a spot on the leaderboard yet. Lead the way!
        </div>
      </div>
    </div>
  );
}
