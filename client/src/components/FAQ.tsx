import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openFAQs, setOpenFAQs] = useState<number[]>([]);

  const faqs: FAQItem[] = [
    {
      question: "Is my resume data secure?",
      answer: "Yes, your data is completely secure. We don't store your resume or job descriptions on our servers after processing. All data is encrypted in transit and our AI processing follows strict privacy guidelines."
    },
    {
      question: "How accurate is the AI tailoring?",
      answer: "Our AI uses advanced natural language processing to match your qualifications with job requirements. While highly accurate, we recommend reviewing the tailored resume before sending it to ensure it represents you correctly and making any necessary adjustments."
    },
    {
      question: "Can I use this for any industry?",
      answer: "Yes! Resume Tailor works for all industries and job types. The AI adapts to the specific language and requirements of each industry based on the job description you provide."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQs(prevOpenFAQs => 
      prevOpenFAQs.includes(index)
        ? prevOpenFAQs.filter(i => i !== index)
        : [...prevOpenFAQs, index]
    );
  };

  return (
    <section className="mt-16" id="faq">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Frequently Asked Questions</h2>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-200 max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div key={index} className="p-6">
            <button 
              className="flex justify-between items-center w-full text-left"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-lg font-medium text-gray-800">{faq.question}</h3>
              <i className={`fas fa-chevron-${openFAQs.includes(index) ? 'up' : 'down'} text-gray-500`}></i>
            </button>
            <div className={`mt-3 text-gray-600 ${openFAQs.includes(index) ? 'block' : 'hidden'}`}>
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
