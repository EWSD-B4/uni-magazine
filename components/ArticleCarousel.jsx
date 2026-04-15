"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

export default function ArticleCarousel({ images, title }) {
  return (
    <Carousel className="mx-auto w-full max-w-[640px]" opts={{ loop: true }}>
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.src}>
            <div className="relative h-[220px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <Image
                src={image.src}
                alt={image.alt || `${title} image`}
                width={500}
                height={500}
                className="w-full object-fill"
                unoptimized
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
  );
}
