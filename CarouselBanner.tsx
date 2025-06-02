import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonAction: () => void;
  backgroundImage: string;
}

export function CarouselBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 1,
      title: "Fresh Pizza Daily",
      subtitle: "Made with love, delivered with care",
      buttonText: "Order Now",
      buttonAction: () => {
        const menuSection = document.getElementById("menu");
        if (menuSection) {
          menuSection.scrollIntoView({ behavior: "smooth" });
        }
      },
      backgroundImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600",
    },
    {
      id: 2,
      title: "Healthy Snacks",
      subtitle: "Nutritious and delicious options",
      buttonText: "Explore Menu",
      buttonAction: () => {
        const menuSection = document.getElementById("menu");
        if (menuSection) {
          menuSection.scrollIntoView({ behavior: "smooth" });
        }
      },
      backgroundImage: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600",
    },
    {
      id: 3,
      title: "Fast Delivery",
      subtitle: "Get your order in 30 minutes or less",
      buttonText: "Track Order",
      buttonAction: () => {
        // Track order functionality would go here
        console.log("Track order clicked");
      },
      backgroundImage: "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative mt-16 h-96 overflow-hidden">
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="relative w-full h-full bg-gradient-to-r from-black/60 to-black/20 bg-cover bg-center"
              style={{ backgroundImage: `url('${slide.backgroundImage}')` }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
                <div className="max-w-4xl">
                  <h2 className="text-4xl md:text-6xl font-bold mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-xl md:text-2xl mb-8">{slide.subtitle}</p>
                  <Button
                    onClick={slide.buttonAction}
                    className="bg-primary text-white px-8 py-3 text-lg hover:bg-primary/90 transition-colors"
                  >
                    {slide.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Carousel indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-opacity ${
              index === currentSlide
                ? "bg-white opacity-100"
                : "bg-white opacity-50 hover:opacity-75"
            }`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-accent transition-colors p-2"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-accent transition-colors p-2"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </section>
  );
}
