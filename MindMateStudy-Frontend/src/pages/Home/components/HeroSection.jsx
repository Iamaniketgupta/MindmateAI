import { useEffect, useState } from "react";
import InfiniteCarousel from "./verticalMarquee/InfiniteCrousal";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          console.log("User accepted the install prompt");
          setDeferredPrompt(null);
          setIsInstallable(false);
        } else {
          console.log("User dismissed the install prompt");
        }
      } catch (err) {
        console.error("Failed to install the app", err);
      }
    }
  };

  return (
    <div className="flex md:gap-16 max-h-screen relative bg-background lg:px-30 md-px-15 p-4">
      <div className="flex flex-col md:pt-20 pt-4 flex-1 ">
        <div className="inline-flex  max-w-fit items-center max-sm:mx-auto glass border-[1px] rounded-2xl px-4 gap-2 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-green-400" />
          <span className="md:text-sm text-xs text-muted-foreground">
            AI-Powered Study Revolution
          </span>
        </div>
        <h1 className="md:text-6xl max-sm:mx-auto text-5xl lg:text-8xl font-bold mb-6 leading-tight font-technical">
          <span className="bg-gradient-to-r from-gradient-primary to-gradient-secondary text-transparent bg-clip-text">
            Mind
          </span>
          <span className=""> Mate</span>
        </h1>

        <p className="text-xl max-sm:text-center md:text-2xl text-stone-300 mb-8 max-w-3xl leading-relaxed">
          Your next-generation AI study & Mental Health companion. Get
          personalized mentorship, intelligent analysis, and community support
          to transform your learning journey.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center mb-12">
          <Link
            to="/register"
            className=" cursor-pointer hover:opacity-90 flex items-center gap-4 bg-gradient-to-r from-gradient-primary to-gradient-secondary rounded-2xl  glow-primary px-8 py-4 text-lg font-bold"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>

          <a href="https://drive.google.com/file/d/1FDzQWtcS_eboM55-hL9aFn93_XAjutTj/view" target="_blank" className="hover:opacity-80 glass border-[2px] border-stone-400 cursor-pointer flex items-center gap-2 rounded-2xl px-8 py-4 text-lg transition-colors">
            <Play className="mr-2 w-5 h-5" />
            Watch Demo
          </a>
        </div>
      </div>

      <div className="max-w-xl">
        <InfiniteCarousel />
      </div>
    </div>
  );
};

export default HeroSection;
