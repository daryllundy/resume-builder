export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer",
      quote: "I was applying to at least 5 jobs per week and getting nowhere. Using Resume Tailor to customize my applications for each position got me three interviews in just one week!",
      rating: 5,
    },
    {
      name: "David Chen",
      role: "Marketing Specialist",
      quote: "The AI does an amazing job of highlighting relevant experience I didn't even think to emphasize. It made my resume feel perfectly tailored to each job without having to spend hours rewriting it.",
      rating: 4.5,
    },
  ];

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Users Love Resume Tailor</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="mr-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                  <i className="fas fa-user"></i>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{testimonial.name}</h4>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>
            <p className="text-gray-600">{testimonial.quote}</p>
            <div className="mt-3 flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                i < Math.floor(testimonial.rating) ? (
                  <i key={i} className="fas fa-star"></i>
                ) : i < testimonial.rating ? (
                  <i key={i} className="fas fa-star-half-alt"></i>
                ) : (
                  <i key={i} className="far fa-star"></i>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
