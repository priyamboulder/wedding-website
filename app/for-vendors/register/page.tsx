"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  "Photographer", "Videographer", "Venue", "Caterer", "Decorator",
  "HMUA", "Mehendi Artist", "Pandit / Priest", "DJ / Music",
  "Wedding Planner", "Invitation Designer", "Cake & Sweets",
  "Jewellery", "Bridal Wear", "Groom Wear", "Transport",
  "Entertainment", "Other",
];

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  category: string;
  location: string;
  phone: string;
  bio: string;
}

interface FieldErrors {
  [key: string]: string;
}

export default function VendorRegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    name: "", email: "", password: "", confirmPassword: "",
    businessName: "", category: "", location: "", phone: "", bio: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  async function checkEmail() {
    if (!form.email || !form.email.includes("@")) return;
    setEmailChecking(true);
    try {
      const res = await fetch(`/api/vendor-onboarding/check-availability?email=${encodeURIComponent(form.email)}`);
      const data = await res.json();
      if (!data.available) {
        setErrors((e) => ({ ...e, email: "This email is already registered." }));
      }
    } catch {
      // ignore
    } finally {
      setEmailChecking(false);
    }
  }

  function validateStep(s: number): boolean {
    const errs: FieldErrors = {};
    if (s === 1) {
      if (!form.name.trim()) errs.name = "Name is required.";
      if (!form.email.includes("@")) errs.email = "Enter a valid email.";
      if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
      if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    }
    if (s === 2) {
      if (!form.businessName.trim()) errs.businessName = "Business name is required.";
      if (!form.category) errs.category = "Please select a category.";
      if (!form.location.trim()) errs.location = "Location is required.";
      if (!form.phone.trim()) errs.phone = "Phone is required.";
    }
    if (s === 3) {
      if (form.bio.trim().length < 20) errs.bio = "Please write at least 20 characters about your business.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => s + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep(3)) return;
    setLoading(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/vendor-onboarding/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          category: form.category,
          location: form.location,
          bio: form.bio,
          phone: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Registration failed. Please try again.");
        return;
      }
      setSuccess(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🌸</div>
          <h1 className="text-2xl font-semibold text-stone-800 mb-3">Welcome to Ananya!</h1>
          <p className="text-stone-500 mb-6 leading-relaxed">
            Your vendor profile has been created. Check your email for a welcome message, then sign in to complete your profile.
          </p>
          <Link
            href="/app"
            className="inline-block bg-stone-800 text-white rounded-xl px-8 py-3 font-medium hover:bg-stone-700 transition-colors"
          >
            Sign In →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-stone-800 mb-2">Join Ananya</h1>
          <p className="text-stone-500">Connect with couples planning their dream wedding</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${s <= step ? "bg-stone-800" : "bg-stone-200"}`} />
              <p className={`text-xs mt-1.5 text-center ${s === step ? "text-stone-800 font-medium" : "text-stone-400"}`}>
                {s === 1 ? "Account" : s === 2 ? "Business" : "About"}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-stone-800 mb-6">Create your account</h2>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Full name</label>
                  <input className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Priya Sharma" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Email address</label>
                  <input type="email" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" value={form.email} onChange={(e) => set("email", e.target.value)} onBlur={checkEmail} placeholder="priya@studio.com" />
                  {emailChecking && <p className="text-stone-400 text-xs mt-1">Checking availability…</p>}
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
                  <input type="password" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="At least 6 characters" />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Confirm password</label>
                  <input type="password" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} placeholder="Same as above" />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-stone-800 mb-6">Your business</h2>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Business name</label>
                  <input className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="Priya Photography Studio" />
                  {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
                  <select className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 bg-white" value={form.category} onChange={(e) => set("category", e.target.value)}>
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">City / Location</label>
                  <input className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Mumbai, Maharashtra" />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone number</label>
                  <input type="tel" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-stone-800 mb-6">About your work</h2>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Tell couples about your work</label>
                  <textarea rows={6} className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none" value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Describe your style, experience, and what makes your work special…" />
                  <p className="text-stone-400 text-xs mt-1">{form.bio.length} characters</p>
                  {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
                </div>
                {submitError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-red-600 text-sm">{submitError}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button type="button" onClick={() => setStep((s) => s - 1)} className="flex-1 border border-stone-200 text-stone-700 rounded-xl px-6 py-3 font-medium hover:bg-stone-50 transition-colors">
                  Back
                </button>
              )}
              <button type="submit" disabled={loading} className="flex-1 bg-stone-800 text-white rounded-xl px-6 py-3 font-medium hover:bg-stone-700 transition-colors disabled:opacity-50">
                {loading ? "Creating account…" : step === 3 ? "Create account" : "Continue →"}
              </button>
            </div>
          </form>

          <p className="text-center text-stone-400 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/app" className="text-stone-700 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
