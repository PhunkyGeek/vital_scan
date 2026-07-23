"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Stethoscope, Shield, Brain, Menu } from "lucide-react"

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Vital Scan</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-wrap items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:border-primary/70 hover:text-primary md:hidden"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background/90 px-4 pb-4">
            <div className="mt-3 space-y-3">
              <Link href="/login">
                <Button variant="ghost" className="w-full" onClick={() => setMenuOpen(false)}>
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full" onClick={() => setMenuOpen(false)}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            AI-Assisted Health Screening
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload images of visible health conditions and receive AI-powered insights,
            risk assessments, and self-care recommendations. Not a medical diagnosis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Screening
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-muted-foreground">
                Advanced AI analyzes uploaded images to identify potential health conditions.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Risk Assessment</h3>
              <p className="text-muted-foreground">
                Get clear risk level indicators and confidence scores for informed decisions.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Self-Care Guidance</h3>
              <p className="text-muted-foreground">
                Receive personalized recommendations and next steps for your health.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-muted/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Important Medical Disclaimer</h2>
            <p className="text-muted-foreground">
              Vital Scan provides AI-assisted screening and informative content for quick self-care solutions only.
              This is not a substitute for a professional, endeavour to seek further medical advice, diagnosis, or treatment.
              Always consult with qualified healthcare providers for medical concerns.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t bg-background/80 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-primary">Vital Scan</span>
          </div>
          <p className="text-muted-foreground">
            © 2026 Vital Scan. AI-assisted health screening for educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  )
}
