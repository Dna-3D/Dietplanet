import { useState } from "react";
import { ShoppingCart, User, Settings, Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { useTheme } from "./ThemeContext";

interface NavbarProps {
  onCartClick: () => void;
  onLoginClick: () => void;
  onAdminClick: () => void;
}

export function Navbar({ onCartClick, onLoginClick, onAdminClick }: NavbarProps) {
  const { currentUser, userProfile, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img 
                className="h-10 w-auto" 
                src="/generated-icon.png" 
                alt="DietPlanet" 
              />
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
                DietPlanet
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onCartClick}
              className="relative text-gray-600 dark:text-gray-300"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Button>

            {currentUser ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="text-gray-600 dark:text-gray-300"
                >
                  <User className="h-5 w-5" />
                </Button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      {userProfile?.displayName || currentUser.email}
                    </div>
                    
                    {userProfile?.isAdmin && (
                      <button
                        onClick={onAdminClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </button>
                    )}
                    
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={onLoginClick}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}