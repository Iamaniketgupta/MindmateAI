import { testimonials } from "../../../constants";

const Testimonials = () => {
  return (
    <div className="mt-20 tracking-">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center my-10 lg:my-20">
        What <span className="text-gradient-secondary font-technical font-semibold">People</span> are saying
      </h2>
      <div className="flex flex-wrap justify-center t ext-gray-900">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3 md:px-4 py-2">
            <div className="bg-gradient-to-r glass rounded-2xl p-6 text-md border border-neutral-800 font-thin">
              <p className="text-gray-200 font-medium">{testimonial.text}</p>
              <div className="flex mt-8 items-start">
                <img
                  className="w-12 h-12 mr-6 rounded-full border text-gray-200"
                  src={`https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=`}
                  alt=""
                />
                <div>
                  <h6 className="text-gray-200 font-medium">{testimonial.user}</h6>
                  <span className="text-sm font-normal italic text-gray-200">
                    {testimonial.company}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
