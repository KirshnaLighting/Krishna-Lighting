import { useState } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const AboutUs = () => {
    const [activeTab, setActiveTab] = useState('story');

    return (
        <div className="bg-white">
            <Navbar />
            {/* Hero Section */}
            <div className="relative bg-gray-900">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        className="w-full h-full object-cover opacity-50"
                        src="../bglight.jpeg"
                        alt="Krishna Lighting Showroom"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto py-32 px-4 sm:py-40 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Illuminating <span className="text-amber-400">Spaces</span>,<br />
                        Enriching <span className="text-amber-400">Lives</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        For over 15 years, Krishna Lighting has been transforming spaces with premium lighting solutions that combine artistry, innovation, and sustainability.
                    </p>
                </div>
            </div>

            {/* Our Story & Values */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Image */}
                    <div className="lg:w-1/2">
                        <div className="relative rounded-xl overflow-hidden shadow-2xl h-96 lg:h-full">
                            <img
                                className="w-full h-full object-cover"
                                src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Krishna Lighting Founders"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
                            <div className="absolute bottom-0 left-0 p-8 text-white">
                                <p className="text-2xl font-bold">"Light is not just illumination, it's emotion."</p>
                                <p className="mt-2">- Rajesh Kumar, Founder</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Journey</h2>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-8">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('story')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'story' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Our Story
                                </button>
                                <button
                                    onClick={() => setActiveTab('mission')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'mission' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Mission & Values
                                </button>
                                <button
                                    onClick={() => setActiveTab('difference')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'difference' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    The Krishna Difference
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="space-y-6 text-gray-700">
                            {activeTab === 'story' && (
                                <>
                                    <p>
                                        Founded in 2008 by lighting designer Rajesh Kumar, Krishna Lighting began as a small workshop in New Delhi with a vision to revolutionize lighting in India. What started as a passion project quickly grew into one of the most respected lighting brands in the country.
                                    </p>
                                    <p>
                                        Today, we operate from a 15,000 sq. ft. design studio and manufacturing facility, serving both residential and commercial clients across India and internationally. Our team of 50+ lighting experts includes designers, engineers, and craftsmen who share a common commitment to excellence.
                                    </p>
                                    <p>
                                        From our humble beginnings to becoming an award-winning lighting brand, our journey has been guided by innovation, quality craftsmanship, and an unwavering focus on customer satisfaction.
                                    </p>
                                </>
                            )}

                            {activeTab === 'mission' && (
                                <>
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-gray-900">Our Mission</h3>
                                        <p>
                                            To create lighting solutions that inspire, innovate, and transform spaces while maintaining the highest standards of quality and sustainability.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-gray-900">Our Core Values</h3>
                                        <ul className="space-y-3 list-disc pl-5">
                                            <li><span className="font-medium">Craftsmanship:</span> Every fixture is a testament to meticulous attention to detail</li>
                                            <li><span className="font-medium">Innovation:</span> Pioneering new lighting technologies and designs</li>
                                            <li><span className="font-medium">Sustainability:</span> Eco-friendly materials and energy-efficient solutions</li>
                                            <li><span className="font-medium">Integrity:</span> Honest business practices and transparency</li>
                                            <li><span className="font-medium">Client-Centric:</span> Tailored solutions for every project</li>
                                        </ul>
                                    </div>
                                </>
                            )}

                            {activeTab === 'difference' && (
                                <>
                                    <p>
                                        At Krishna Lighting, we don't just sell lights - we create lighting experiences. Here's what sets us apart:
                                    </p>
                                    <ul className="space-y-4">
                                        <li className="flex items-start">
                                            <div className="flex-shrink-0 mt-1 mr-3 text-amber-500">
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span><span className="font-medium">Premium Materials:</span> We source only the finest crystals, metals, and glass from trusted global suppliers</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="flex-shrink-0 mt-1 mr-3 text-amber-500">
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span><span className="font-medium">Custom Solutions:</span> 60% of our work is bespoke lighting designed for specific spaces</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="flex-shrink-0 mt-1 mr-3 text-amber-500">
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span><span className="font-medium">End-to-End Service:</span> From concept to installation, we handle every detail</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="flex-shrink-0 mt-1 mr-3 text-amber-500">
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span><span className="font-medium">5-Year Warranty:</span> Industry-leading coverage that demonstrates our confidence in quality</span>
                                        </li>
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Team Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Meet Our Lighting Experts</h2>
                <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
                    A team of passionate designers, engineers, and craftsmen dedicated to perfect illumination
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Team Member 1 */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
                        <img
                            className="w-full h-64 object-cover"
                            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                            alt="Rajesh Kumar"
                        />
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Rajesh Kumar</h3>
                            <p className="text-amber-600 font-medium mb-3">Founder & Lead Designer</p>
                            <p className="text-gray-600 text-sm">
                                20+ years in lighting design. Trained in Milan and specializes in luxury residential lighting.
                            </p>
                        </div>
                    </div>

                    {/* Team Member 2 */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
                        <img
                            className="w-full h-64 object-cover"
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                            alt="Priya Sharma"
                        />
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Priya Sharma</h3>
                            <p className="text-amber-600 font-medium mb-3">Head of Commercial Projects</p>
                            <p className="text-gray-600 text-sm">
                                Architect-turned-lighting expert with 15 years experience in hospitality lighting.
                            </p>
                        </div>
                    </div>

                    {/* Team Member 3 */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
                        <img
                            className="w-full h-64 object-cover"
                            src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                            alt="Amit Patel"
                        />
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Amit Patel</h3>
                            <p className="text-amber-600 font-medium mb-3">Lighting Engineer</p>
                            <p className="text-gray-600 text-sm">
                                Electrical engineer specializing in smart lighting and energy efficiency solutions.
                            </p>
                        </div>
                    </div>

                    {/* Team Member 4 */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
                        <img
                            className="w-full h-64 object-cover"
                            src="https://images.unsplash.com/photo-1542190891-2093d38760f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                            alt="Neha Gupta"
                        />
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Neha Gupta</h3>
                            <p className="text-amber-600 font-medium mb-3">Customer Experience Head</p>
                            <p className="text-gray-600 text-sm">
                                Ensures every client receives personalized attention and flawless service.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AboutUs;