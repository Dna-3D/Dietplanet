import { Facebook, Instagram, Twitter, Youtube, Linkedin, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const quickLinks = [
    { href: "#menu", label: "Menu" },
    { href: "#about", label: "About Us" },
    { href: "#contact", label: "Contact" },
    { href: "#", label: "Track Order" },
  ];

  const handleLinkClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">DietPlanet</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Delivering fresh, healthy, and delicious food right to your doorstep. 
              Made with love, delivered with care.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div id="contact">
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-3" />
                <a 
                  href="https://wa.me/2349135371742" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  09135371742
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-3" />
                <a 
                  href="mailto:dietplanetpizza@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  dietplanetpizza@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <MapPin className="h-4 w-4 mr-3" />
                <span>FUTO</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} DietPlanet. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            Designed by <span className="text-white font-medium">Darc Design</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
