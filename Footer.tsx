export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img 
                className="h-8 w-auto mr-3" 
                src="/generated-icon.png" 
                alt="DietPlanet" 
              />
              <h3 className="text-xl font-bold text-red-400">DietPlanet</h3>
            </div>
            <p className="text-gray-300">
              Delicious pizza and snacks delivered fresh to your doorstep. 
              Quality ingredients, authentic flavors, and exceptional service.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-300">
              <p>📞 09135371742</p>
              <p>📧 info@dietplanet.com.ng</p>
              <p>🕒 Mon-Sun: 10AM - 10PM</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a href="#menu" className="text-gray-300 hover:text-red-400 block">
                Our Menu
              </a>
              <a href="#about" className="text-gray-300 hover:text-red-400 block">
                About Us
              </a>
              <a href="#contact" className="text-gray-300 hover:text-red-400 block">
                Contact
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            DietPlanet 2025 all rights reserved. Designed by Darc design
          </p>
        </div>
      </div>
    </footer>
  );
}