'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, FileText, Megaphone, BookOpen, GraduationCap, MessageSquare, Shield, Zap, CheckCircle, ArrowRight, Play, Star, Globe, Clock, Sparkles, Target, Award, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300, 600], [1, 0.8, 0]);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div 
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <Image 
              src="/logo.svg" 
              alt="EduBridge Logo" 
              width={64} 
              height={64} 
              className="animate-pulse"
              priority
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-scholiax-purple/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-lg font-semibold text-gray-700">Loading EduBridge...</p>
        </motion.div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-scholiax-purple/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-scholiax-teal/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-scholiax-lavender/10 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 w-full backdrop-blur-md shadow-sm border-b border-white/20 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ 
          backgroundColor: `rgba(255, 255, 255, ${Math.min(scrollY.get() / 100, 0.95)})`,
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image 
                src="/logo.svg" 
                alt="EduBridge Logo" 
                width={32} 
                height={32} 
                className="h-8 w-8"
                priority
              />
              <span className="text-xl font-bold text-scholiax-purple">
                EduBridge
              </span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" className="text-gray-700 hover:text-scholiax-purple">
                    Sign In
                  </Button>
                </motion.div>
              </Link>
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-scholiax-purple hover:bg-scholiax-purple/90 text-white shadow-lg">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              className="text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                className="inline-flex items-center px-4 py-2 rounded-full bg-scholiax-purple/10 text-scholiax-purple text-sm font-medium mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Revolutionizing Academic Communication
              </motion.div>
              
              <motion.h1 
                className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Modern
                <span className="block text-scholiax-purple">
                  Academic
                </span>
                Communication
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 mb-8 max-w-2xl lg:max-w-none leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                Transform the way lecturers and students connect. Our comprehensive platform 
                streamlines announcements, materials, and course management with cutting-edge technology.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <Link href="/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="bg-scholiax-purple hover:bg-scholiax-purple/90 text-white shadow-xl text-lg px-8 py-6">
                      Start Learning Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-scholiax-purple text-lg px-8 py-6">
                      <Play className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="flex justify-center lg:justify-start space-x-8 mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Active Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Lecturers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">99%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Hero Visual */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 bg-scholiax-purple rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.div 
                    className="bg-scholiax-purple/10 rounded-xl p-4"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <BookOpen className="w-8 h-8 text-scholiax-purple mb-2" />
                    <h3 className="font-semibold text-gray-800">Course Management</h3>
                    <p className="text-sm text-gray-600">Organize content seamlessly</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-scholiax-lavender/10 rounded-xl p-4"
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Megaphone className="w-8 h-8 text-scholiax-lavender mb-2" />
                    <h3 className="font-semibold text-gray-800">Announcements</h3>
                    <p className="text-sm text-gray-600">Instant communication</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-scholiax-teal/10 rounded-xl p-4"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FileText className="w-8 h-8 text-scholiax-teal mb-2" />
                    <h3 className="font-semibold text-gray-800">Materials</h3>
                    <p className="text-sm text-gray-600">Easy file sharing</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-scholiax-purple/5 rounded-xl p-4"
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <MessageSquare className="w-8 h-8 text-scholiax-purple mb-2" />
                    <h3 className="font-semibold text-gray-800">Discussions</h3>
                    <p className="text-sm text-gray-600">Interactive learning</p>
                  </motion.div>
                </div>
                
                <motion.div 
                  className="bg-scholiax-purple rounded-xl p-4 text-white"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Real-time Updates</h3>
                      <p className="text-sm text-blue-100">Stay connected 24/7</p>
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Globe className="w-6 h-6" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white/50 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-scholiax-purple/10 text-scholiax-purple text-sm font-medium mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Target className="w-4 h-4 mr-2" />
              Powerful Features
            </motion.div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for
              <span className="block text-scholiax-purple">
                Academic Success
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed to enhance the learning experience for both educators and students
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Course Management',
                description: 'Create and manage courses with ease. Organize content and track student progress.',
                color: 'blue',
                gradient: 'from-blue-500 to-blue-600'
              },
              {
                icon: Megaphone,
                title: 'Smart Announcements',
                description: 'Share important updates and announcements with your students instantly.',
                color: 'purple',
                gradient: 'from-purple-500 to-purple-600'
              },
              {
                icon: FileText,
                title: 'Materials Library',
                description: 'Upload and organize course materials. Students can access them anytime.',
                color: 'emerald',
                gradient: 'from-emerald-500 to-emerald-600'
              },
              {
                icon: MessageSquare,
                title: 'Interactive Discussions',
                description: 'Foster engagement with comment systems and real-time discussions.',
                color: 'orange',
                gradient: 'from-orange-500 to-orange-600'
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.div
                  className={`w-16 h-16 bg-scholiax-purple rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 5 }}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-scholiax-purple transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <motion.div
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: 20 }}
                  whileHover={{ x: 0 }}
                >
                  <ArrowRight className="w-5 h-5 text-scholiax-purple" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-scholiax-purple relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Trusted by Educators
              <span className="block">Worldwide</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              See what lecturers and students are saying about their experience with EduBridge
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. D. O., Opaleke",
                role: "Professor of  Nutrition",
                content: "EduBridge has transformed how I interact with my students. The platform is intuitive and powerful.",
                rating: 5
              },
              {
                name: "Muhammad Fatimah",
                role: "Student",
                content: "Finally, a platform that makes learning accessible and engaging. The materials are always up-to-date.",
                rating: 5
              },
              {
                name: "Dr. A. O., Oloyede",
                role: "Department Head",
                content: "The announcement system is a game-changer. My students never miss important updates anymore.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/90 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-blue-200 text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-scholiax-purple/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-scholiax-purple text-white text-sm font-medium mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Award className="w-4 h-4 mr-2" />
              Join the Revolution
            </motion.div>
            
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Ready to Transform Your
              <span className="block text-scholiax-lavender">
                Academic Experience?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Join thousands of educators and students who are already using EduBridge to enhance their learning journey
            </p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-scholiax-purple hover:bg-scholiax-purple/90 text-white shadow-2xl text-lg px-10 py-6">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="bg-scholiax-lavender/20 border-2 border-white/30 hover:border-white text-white hover:bg-white/10 text-lg px-10 py-6">
                    Sign In Now
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <motion.div 
                className="flex items-center space-x-2 mb-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Image 
                  src="/logo.svg" 
                  alt="EduBridge Logo" 
                  width={32} 
                  height={32} 
                  className="h-8 w-8"
                />
                <span className="text-2xl font-bold text-scholiax-lavender">
                  EduBridge
                </span>
              </motion.div>
              <p className="text-gray-400 mb-6 max-w-md">
                Revolutionizing academic communication with modern technology and intuitive design.
              </p>
              <div className="flex space-x-4">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-scholiax-purple transition-colors">
                    <Globe className="w-5 h-5" />
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-scholiax-purple transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </motion.div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
          </div>
          
          <motion.div 
            className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p>© 2025 EduBridge. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}