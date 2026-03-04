"use client"

import Image from "next/image"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function ArticleCarousel({ images, title }) {
  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.src}>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <Image
                src={image.src}
                alt={image.alt || `${title} image`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 960px, 100vw"
                priority
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 ? (
        <>
          <CarouselPrevious className="left-3 border-white/70 bg-white/85" />
          <CarouselNext className="right-3 border-white/70 bg-white/85" />
        </>
      ) : null}
    </Carousel>
  )
}
