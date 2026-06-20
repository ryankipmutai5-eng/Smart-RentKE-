"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Check,
  Smartphone,
  Shield,
  Zap,
  BarChart3,
  Users,
  Bell,
  ArrowRight,
  Star,
} from "lucide-react";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
];

const features = [
  {
    icon: Smartphone,
    title: "M-PESA STK Push",
    description:
      "Send automatic payment requests directly to your tenants' phones. No chasing, no confusion.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Shield,
    title: "Auto-Reconciliation",
    description:
      "Every M-PESA transaction is matched to the right tenant and house automatically.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Bell,
    title: "WhatsApp Reminders",
    description:
      "Tenants get friendly payment reminders and instant receipts via WhatsApp.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: BarChart3,
    title: "Real-Time Dashboard",
    description:
      "See who has paid, who hasn't, and how much you've collected — all in one place.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Users,
    title: "Tenant Management",
    description:
      "Keep track of all your tenants, houses, and rental agreements in one simple CRM.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: Zap,
    title: "Instant PDF Receipts",
    description:
      "Auto-generated, downloadable receipts for every successful payment. Tenant-approved!",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
];

const steps = [
  {
    number: "01",
    title: "Add Your Tenants",
    description: "Enter tenant names, phone numbers, house numbers, and monthly rent.",
  },
  {
    number: "02",
    title: "Set Due Dates",
    description: "Choose a collection date (e.g., 1st of every month). We handle the rest.",
  },
  {
    number: "03",
    title: "Auto-Collect Rent",
    description: "We send STK Push requests on your behalf. Tenants pay with their M-PESA PIN.",
  },
  {
    number: "04",
    title: "Sit Back & Relax",
    description: "Payments are reconciled automatically. You get WhatsApp alerts and live reports.",
  },
];

const testimonials = [
  {
    name: "Grace Mwangi",
    role: "Landlord, Eldoret",
    content:
      "I used to spend hours reconciling M-PESA messages every month. Now Smart-Rent KE does it all in seconds. Game changer!",
    rating: 5,
  },
  {
    name: "James Ochieng",
    role: "Property Agent, Nairobi",
    content:
      "My tenants love the WhatsApp reminders. No more excuses about forgetting to pay. Collections are up 40%.",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "KES 0",
    description: "For landlords getting started",
    features: [
      "Up to 3 tenants",
      "Manual STK Push",
      "Basic dashboard",
      "Email support",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "KES 0",
    description: "Pay only 1% per successful collection",
    features: [
      "Unlimited tenants",
      "Auto STK Push collection",
      "WhatsApp reminders & receipts",
      "Advanced dashboard & reports",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    footnote: "Average cost: ~KES 150/month per 15 units at KES 10,000 rent",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SR</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Smart-Rent <span className="text-emerald-600">KE</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition"
              >
                Get Started Free
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-100 pt-4">
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm font-medium text-gray-600 hover:text-emerald-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <hr className="border-gray-100" />
                <Link href="/login" className="text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link href="/signup" className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg text-center hover:bg-emerald-700 transition" onClick={() => setMobileMenuOpen(false)}>Get Started Free</Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4 mr-1.5 fill-emerald-600" />
              Trusted by Kenyan landlords
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
              Rent Collection That{" "}
              <span className="text-emerald-600">Actually Works</span> in Kenya
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Stop chasing M-PESA messages. Smart-Rent KE automates rent collection
              via STK Push, sends WhatsApp reminders, and reconciles every payment
              automatically.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-lg text-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
              >
                Start Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center text-emerald-600 border-2 border-emerald-600 font-semibold px-8 py-3.5 rounded-lg text-lg hover:bg-emerald-50 transition"
              >
                See How It Works
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Free to join • Pay only 1% per successful collection • Cancel anytime
            </p>
          </div>
        </div>
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-emerald-200/40 to-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* STATS */}
      <section className="bg-emerald-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-400">500+</p>
              <p className="text-sm text-emerald-200 mt-1">Active Landlords</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-400">KES 50M+</p>
              <p className="text-sm text-emerald-200 mt-1">Rent Collected</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-400">98%</p>
              <p className="text-sm text-emerald-200 mt-1">On-Time Payments</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-400">4.9★</p>
              <p className="text-sm text-emerald-200 mt-1">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything You Need to{" "}
              <span className="text-emerald-600">Manage Rent</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              No more spreadsheets. No more bank statement hunting. Just a clean,
              simple dashboard that does the heavy lifting.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="group p-6 rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-lg transition-all duration-200 bg-white">
                <div className={"w-12 h-12 " + feature.bg + " rounded-lg flex items-center justify-center mb-4"}>
                  <feature.icon className={"h-6 w-6 " + feature.color} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How It <span className="text-emerald-600">Works</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">Get started in minutes. No technical skills required.</p>
          </div>
          <div className="grid lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 relative z-10 shadow-lg shadow-emerald-200">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Loved by <span className="text-emerald-600">Landlords</span> Across Kenya
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-xl border border-gray-200 bg-white">
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.content}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Simple, Transparent <span className="text-emerald-600">Pricing</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">Free to join. You only pay when you successfully collect rent.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={"rounded-xl p-8 border-2 " + (plan.highlighted ? "border-emerald-600 bg-white shadow-xl shadow-emerald-100 relative" : "border-gray-200 bg-white")}>
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</span>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </p>
                {plan.footnote && <p className="mt-2 text-xs text-gray-500">{plan.footnote}</p>}
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start text-sm text-gray-600">
                      <Check className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/signup" className={"mt-8 block w-full text-center font-semibold py-3 rounded-lg transition " + (plan.highlighted ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200" : "bg-gray-100 text-gray-900 hover:bg-gray-200")}>{plan.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Stop Chasing Rent?</h2>
          <p className="mt-4 text-lg text-emerald-100">
            Join hundreds of Kenyan landlords who have automated their rent collection. It&apos;s free to start.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-emerald-800 font-semibold px-8 py-3.5 rounded-lg text-lg hover:bg-emerald-50 transition">
              Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a href="#features" className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-white/30 text-white font-semibold px-8 py-3.5 rounded-lg text-lg hover:bg-white/10 transition">Learn More</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SR</span>
                </div>
                <span className="text-lg font-bold text-white">Smart-Rent <span className="text-emerald-400">KE</span></span>
              </div>
              <p className="text-sm leading-relaxed">Automated M-PESA rental management for Kenyan landlords. Stop chasing payments — start growing.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Smart-Rent KE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
