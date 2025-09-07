import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/authOptions';
import Header from '@/components/Header';
import { 
  FiSearch, 
  FiHelpCircle, 
  FiTag, 
  FiUsers, 
  FiTrendingUp, 
  FiZap, 
  FiStar, 
  FiShield,
  FiCheck,
  FiArrowRight,
  FiCode,
  FiMessageSquare,
  FiEye,
  FiTarget
} from 'react-icons/fi';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-slate-900/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23a855f7%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="container-responsive relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-8">
                <FiStar className="w-4 h-4" />
                Trusted by 500+ developers worldwide
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-white">Ask.</span>{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Learn.</span>{' '}
              <span className="text-white">Grow.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join the most vibrant developer community where knowledge flows freely. 
              <span className="text-purple-300 font-medium">Get instant answers</span> to your coding questions from experts worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {session ? (
                <Link 
                  href="/questions/ask" 
                  className="btn btn-primary text-lg px-8 py-4 flex items-center gap-3 justify-center group"
                >
                  <FiHelpCircle className="w-5 h-5" />
                  Ask a Question
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link 
                  href="/auth/signin" 
                  className="btn btn-primary text-lg px-8 py-4 flex items-center gap-3 justify-center group"
                >
                  <FiZap className="w-5 h-5" />
                  Get Started Free
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link 
                href="/questions" 
                className="btn btn-outline text-lg px-8 py-4 flex items-center gap-3 justify-center"
              >
                <FiSearch className="w-5 h-5" />
                Explore Questions
              </Link>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: FiHelpCircle, number: '2,500+', label: 'Questions Solved' },
                { icon: FiMessageSquare, number: '8,300+', label: 'Expert Answers' },
                { icon: FiUsers, number: '1,200+', label: 'Active Developers' },
                { icon: FiTag, number: '150+', label: 'Tech Topics' }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <stat.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-purple-900/5">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-6">
              <FiStar className="w-4 h-4" />
              Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Why Developers Choose{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                StackIt
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the most advanced Q&A platform designed specifically for modern developers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FiSearch,
                title: 'Smart Search',
                description: 'Find answers instantly with our AI-powered search and intelligent filtering system.',
                gradient: 'from-purple-500 to-blue-500'
              },
              {
                icon: FiTarget,
                title: 'Expert Solutions',
                description: 'Get verified answers from experienced developers and industry professionals.',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: FiTag,
                title: 'Smart Organization',
                description: 'Questions are perfectly categorized by tags and topics for easy discovery.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: FiUsers,
                title: 'Global Community',
                description: 'Connect with developers from around the world sharing knowledge freely.',
                gradient: 'from-blue-500 to-purple-500'
              }
            ].map((feature, index) => (
              <div key={index} className="card p-6 text-center hover-lift transition-all duration-300 group">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-6">
              <FiCode className="w-4 h-4" />
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Get Answers in{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                icon: FiHelpCircle,
                title: 'Ask Your Question',
                description: 'Post your coding question with detailed context, code snippets, and error messages.',
                color: 'purple'
              },
              {
                step: '02',
                icon: FiUsers,
                title: 'Get Expert Answers',
                description: 'Our community of experienced developers provides detailed solutions and explanations.',
                color: 'blue'
              },
              {
                step: '03',
                icon: FiCheck,
                title: 'Mark as Solved',
                description: 'Choose the best answer and help other developers facing similar challenges.',
                color: 'green'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="card p-8 text-center hover-lift transition-all duration-300">
                  <div className="text-6xl font-bold text-gray-800/50 mb-4">{item.step}</div>
                  <div className={`w-16 h-16 bg-gradient-to-br ${
                    item.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    item.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    'from-green-500 to-green-600'
                  } rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-purple-900/10"></div>
        <div className="container-responsive relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-6">
              <FiTrendingUp className="w-4 h-4" />
              Growing Community
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Platform{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Impact
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See how our community is transforming the way developers learn and solve problems
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FiHelpCircle, number: '2,500+', label: 'Questions Solved', subtext: '+15% this month' },
              { icon: FiMessageSquare, number: '8,300+', label: 'Expert Answers', subtext: 'Avg. response: 12min' },
              { icon: FiUsers, number: '1,200+', label: 'Active Developers', subtext: 'From 50+ countries' },
              { icon: FiEye, number: '45K+', label: 'Monthly Views', subtext: 'Growing rapidly' }
            ].map((stat, index) => (
              <div key={index} className="card p-6 text-center hover-lift transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300 font-medium mb-2">{stat.label}</div>
                <div className="text-sm text-purple-300">{stat.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="card p-12 text-center max-w-4xl mx-auto hover-lift transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <FiZap className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Level Up
              </span>
              {' '}Your Skills?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of developers who are already accelerating their learning journey with StackIt
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Link 
                  href="/questions/ask" 
                  className="btn btn-primary text-lg px-8 py-4 flex items-center gap-3 justify-center group"
                >
                  <FiHelpCircle className="w-5 h-5" />
                  Ask Your First Question
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link 
                  href="/auth/signup" 
                  className="btn btn-primary text-lg px-8 py-4 flex items-center gap-3 justify-center group"
                >
                  <FiZap className="w-5 h-5" />
                  Create Free Account
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link 
                href="/questions" 
                className="btn btn-outline text-lg px-8 py-4 flex items-center gap-3 justify-center"
              >
                <FiSearch className="w-5 h-5" />
                Browse Questions
              </Link>
            </div>
            
            <div className="mt-8 text-sm text-gray-400">
              Free forever • No credit card required • Join in seconds
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 