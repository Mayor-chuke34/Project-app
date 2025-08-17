import React from 'react';

const About = () => {
  const teamMembers = [
    {
      name: 'Adaora Okafor',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face',
      description: 'Passionate about connecting Nigerian businesses with customers nationwide.'
    },
    {
      name: 'Emeka Nwosu',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      description: 'Tech enthusiast building scalable solutions for e-commerce in Africa.'
    },
    {
      name: 'Fatima Mohammed',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      description: 'Ensuring smooth operations and excellent customer experience.'
    }
  ];

  const milestones = [
    { year: '2023', title: 'Company Founded', description: 'Started with a vision to revolutionize online shopping in Nigeria' },
    { year: '2023', title: 'First 1,000 Customers', description: 'Reached our first milestone of serving 1,000 happy customers' },
    { year: '2024', title: 'Multi-Category Launch', description: 'Expanded to electronics, fashion, and food categories' },
    { year: '2024', title: 'Nationwide Delivery', description: 'Extended delivery services to all 36 states in Nigeria' }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Quality First',
      description: 'We curate only the best products from trusted suppliers and brands.'
    },
    {
      icon: '⚡',
      title: 'Fast & Reliable',
      description: 'Quick delivery and dependable service you can count on.'
    },
    {
      icon: '💖',
      title: 'Customer-Centric',
      description: 'Your satisfaction is our top priority in everything we do.'
    },
    {
      icon: '🌍',
      title: 'Supporting Nigeria',
      description: 'Empowering local businesses and contributing to economic growth.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About NaijaShop</h1>
          <p className="text-xl md:text-2xl leading-relaxed">
            Connecting Nigeria through exceptional online shopping experiences, 
            one delivery at a time.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Our Story Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2023, NaijaShop began with a simple mission: to make quality products 
                  accessible to every Nigerian, regardless of their location. What started as a small 
                  e-commerce platform has grown into Nigeria's trusted online marketplace.
                </p>
                <p>
                  We recognized the challenges Nigerians face when shopping online - from counterfeit 
                  products to unreliable delivery services. That's why we built NaijaShop with a 
                  focus on quality assurance, authentic products, and dependable logistics.
                </p>
                <p>
                  Today, we serve thousands of customers across all 36 states, offering everything 
                  from cutting-edge electronics and fashionable clothing to delicious Nigerian cuisine. 
                  Our commitment to excellence has made us a household name in Nigerian e-commerce.
                </p>
              </div>
            </div>
            <div className="order-first lg:order-last">
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop"
                alt="Team working together"
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To provide Nigerians with access to quality products through a seamless, 
              secure, and reliable e-commerce platform that supports local businesses 
              and drives economic growth.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To become Africa's leading e-commerce platform, setting the standard 
              for online shopping excellence while empowering millions of businesses 
              and customers across the continent.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and help us deliver exceptional 
              experiences to our customers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition duration-300">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones in our growth story</p>
          </div>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center space-x-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-sm">
                  {milestone.year}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind NaijaShop, working tirelessly to bring 
              you the best online shopping experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition duration-300">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-purple-600 font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">NaijaShop by the Numbers</h2>
            <p className="text-xl opacity-90">Our impact in the Nigerian e-commerce landscape</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="opacity-90">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1,000+</div>
              <div className="opacity-90">Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">36</div>
              <div className="opacity-90">States Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="opacity-90">Customer Support</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Shop?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and experience the NaijaShop difference today!
          </p>
          <a
            href="/products"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition duration-300"
          >
            Start Shopping Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;