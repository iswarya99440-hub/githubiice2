
import HeroSection from "./HeroSection/page";
import AboutSection from "./AboutSection/page";
import ServicesSection from "./ServicesSection/page";
import WhyChooseSection from "./Whychoosesection/page";
import ModulesSection from "./Modulessection/page";
import HowItWorksSection from "./Howitworkssection/page";
export default function LandingPageLayout() {
    return (
        <>
            <HeroSection />
            <AboutSection />
            <ServicesSection />
            <WhyChooseSection />
            <ModulesSection />
            <HowItWorksSection />
        </>
    );
}