import { features } from "../../../constants";

const FeatureSection = () => {
  return (
    <div className="relative  min-h-[800px]">
      <div className="text-center">
        <h2 className="text-3xl font-technical font-semibold sm:text-5xl lg:leading-20 lg:text-6xl mt-10 lg:mt-15 tracking-wide">
          Say <span className="text-gradient-secondary">goodbye</span> goodbye
          to outdated learning &{" "}
          <span className="text-gradient-secondary">Empower</span> students
          smarter!
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 lg:mt-20">
        {features.map((feature, index) => (
          <div key={index}>
            <div className="flex glass gap-4 h-50 rounded-2xl p-4">
              <div className="flex h-10 w-10 p-2 bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white justify-center items-center rounded-full">
                {feature.icon}
              </div>
              <div>
                <h5 className="mb-2 text-xl">{feature.text}</h5>
                <p className="text-md min-h-30 text-stone-400">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureSection;
