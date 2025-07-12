import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/authOptions';
import { FaSearch, FaQuestion, FaTags, FaUsers, FaChartLine, FaRocket, FaLightbulb, FaShieldAlt } from 'react-icons/fa';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23a855f7%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="container-responsive py-20 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">StackIt</span>
              <br />
              <span className="text-[#c8acd6]">Community</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Where developers connect, learn, and grow together. 
              Ask questions, share knowledge, and build the future of technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              {session ? (
                <Link 
                  href="/questions/ask" 
                  className="btn btn-primary text-lg px-12 py-4 glow-purple whitespace-nowrap"
                >
                  <FaQuestion className="mr-2 inline" />
                  Ask a Question
                </Link>
              ) : (
                <Link 
                  href="/auth/signin" 
                  className="btn btn-primary text-lg px-12 py-4 glow-purple whitespace-nowrap"
                >
                  <FaRocket className="mr-2 inline" />
                  Get Started
                </Link>
              )}
              <Link 
                href="/questions" 
                className="btn btn-outline text-lg px-12 py-4 whitespace-nowrap"
              >
                <FaSearch className="mr-2 inline" />
                Explore Questions
              </Link>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">1,000+</div>
                <div className="text-gray-300 text-sm">Questions Asked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">5,000+</div>
                <div className="text-gray-300 text-sm">Answers Provided</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">500+</div>
                <div className="text-gray-300 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">50+</div>
                <div className="text-gray-300 text-sm">Topics Covered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="gradient-text">StackIt</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our platform is designed to make learning and sharing knowledge effortless and engaging.
            </p>
          </div>
          
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card p-8 text-center hover-lift hover-glow">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 glow">
                <FaSearch className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Smart Search</h3>
              <p className="text-gray-300 leading-relaxed">
                Find answers instantly with our AI-powered search and intelligent filtering system.
              </p>
            </div>
            
            <div className="card p-8 text-center hover-lift hover-glow">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 glow">
                <FaLightbulb className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Quality Answers</h3>
              <p className="text-gray-300 leading-relaxed">
                Get verified solutions from experienced developers and industry experts.
              </p>
            </div>
            
            <div className="card p-8 text-center hover-lift hover-glow">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 glow">
                <FaTags className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Organized Topics</h3>
              <p className="text-gray-300 leading-relaxed">
                Questions are perfectly organized by tags and categories for seamless navigation.
              </p>
            </div>
            
            <div className="card p-8 text-center hover-lift hover-glow">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 glow">
                <FaUsers className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Global Community</h3>
              <p className="text-gray-300 leading-relaxed">
                Join a worldwide community of developers helping each other grow and innovate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20"></div>
        <div className="container-responsive relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Platform <span className="gradient-text">Statistics</span>
            </h2>
            <p className="text-xl text-gray-300">
              See how our community is growing and helping developers worldwide.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="card p-8 text-center hover-lift">
              <div className="text-5xl font-bold gradient-text mb-4">1,000+</div>
              <div className="text-gray-300 text-lg">Questions Asked</div>
            </div>
            <div className="card p-8 text-center hover-lift">
              <div className="text-5xl font-bold gradient-text mb-4">5,000+</div>
              <div className="text-gray-300 text-lg">Answers Provided</div>
            </div>
            <div className="card p-8 text-center hover-lift">
              <div className="text-5xl font-bold gradient-text mb-4">500+</div>
              <div className="text-gray-300 text-lg">Active Users</div>
            </div>
            <div className="card p-8 text-center hover-lift">
              <div className="text-5xl font-bold gradient-text mb-4">50+</div>
              <div className="text-gray-300 text-lg">Topics Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="card p-12 text-center max-w-4xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 glow-lg">
              <FaShieldAlt className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="gradient-text">Get Started</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of developers who are already learning and sharing knowledge on our platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {session ? (
                <Link 
                  href="/questions/ask" 
                  className="btn btn-primary text-lg px-12 py-4 glow-purple whitespace-nowrap"
                >
                  <FaQuestion className="mr-2 inline" />
                  Ask Your First Question
                </Link>
              ) : (
                <Link 
                  href="/auth/signup" 
                  className="btn btn-primary text-lg px-12 py-4 glow-purple whitespace-nowrap"
                >
                  <FaRocket className="mr-2 inline" />
                  Create Account
                </Link>
              )}
              <Link 
                href="/questions" 
                className="btn btn-outline text-lg px-12 py-4 whitespace-nowrap"
              >
                <FaSearch className="mr-2 inline" />
                Explore Questions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 