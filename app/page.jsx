import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const backgroundImage = '/home/home.jpg';

  return (
    <div>
      <header className="w-full backdrop-blur-sm bg-[#EFE9E1]">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div>
            <Link href="/">
              <Image
                src="/logo_black.svg"
                alt="Campus Mag"
                width={100}
                height={100}
              />
            </Link>
          </div>
          
          <Button asChild
            className="rounded-full px-10 py-5 bg-[#F26454]"
          >
            <Link href="/login" className="text-white">Login</Link>
          </Button>
        </div>
      </header>

      <section className="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
        </div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Content */}
        <div className="container relative z-10 mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-5xl font-light italic leading-tight text-white md:text-6xl lg:text-7xl">
              University Magazine
            </h1>
            
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-white/90">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec metus volutpat, feugiat sem sit amet, semper magna. Fusce molestie sollicitudin nisi, quis laoreet ante varius sit amet.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button className="group gap-2 rounded-full px-10 py-6 text-base whitespace-nowrap bg-[#F26454]">
                <Link href="/login" className="text-white">
                  Submit Article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 inline-block ml-2 text-white" />
                </Link>
              </Button>
              
              <Button variant="outline" className="rounded-full border-2 border-white bg-transparent px-10 py-6 text-base text-white hover:bg-white/10 hover:text-white">
                <Link href="/login">Explore</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
